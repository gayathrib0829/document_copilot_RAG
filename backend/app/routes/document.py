
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pypdf import PdfReader

from app.core.supabase_client import get_supabase_client
from app.services.document_processing import process_pdf
from app.services.embedding import generate_embedding


router = APIRouter()

security = HTTPBearer(auto_error=False)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials | None = Depends(security)
):

    # Step 1: Validate Authorization header
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authorization token is missing. Please sign in."
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication scheme."
        )

    access_token = credentials.credentials

    # Step 2: Create authenticated Supabase client
    try:
        supabase = get_supabase_client(access_token)

    except Exception as error:
        print("SUPABASE CLIENT ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to initialize Supabase client."
        )

    # Step 3: Verify the user's access token
    try:
        auth_response = supabase.auth.get_user(access_token)

        if not auth_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired access token."
            )

        user_id = str(auth_response.user.id)

        print("AUTH SUCCESS: User authenticated")

    except HTTPException:
        raise

    except Exception as error:
        print("SUPABASE AUTH ERROR:", repr(error))

        raise HTTPException(
            status_code=401,
            detail="Authentication failed. Please sign in again."
        )

    # Step 4: Validate PDF filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    content = bytearray()

    storage_path = None
    document_id = None

    try:

        # Step 5: Read PDF with a size limit
        while True:

            file_chunk = await file.read(1024 * 1024)

            if not file_chunk:
                break

            content.extend(file_chunk)

            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail="File size must not exceed 10 MB."
                )

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        # Step 6: Verify PDF signature
        if not content.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file."
            )

        pdf_content = bytes(content)

        # Step 7: Read PDF pages
        try:
            pdf_reader = PdfReader(BytesIO(pdf_content))
            total_pages = len(pdf_reader.pages)

        except Exception as error:
            print("PDF READING ERROR:", repr(error))

            raise HTTPException(
                status_code=422,
                detail="Unable to read this PDF."
            )

        if total_pages == 0:
            raise HTTPException(
                status_code=422,
                detail="PDF contains no pages."
            )

        # Step 8: Extract text and create chunks
        try:
            chunks = process_pdf(pdf_content)

        except ValueError as error:
            raise HTTPException(
                status_code=422,
                detail=str(error)
            )

        if not chunks:
            raise HTTPException(
                status_code=422,
                detail="No readable text found in the PDF."
            )

        # Step 9: Generate a safe unique filename
        safe_filename = Path(
            file.filename.replace("\\", "/")
        ).name

        unique_filename = f"{uuid4()}_{safe_filename}"

        storage_path = f"{user_id}/{unique_filename}"

        # Step 10: Upload PDF to private Supabase Storage
        supabase.storage.from_("documents").upload(
            storage_path,
            pdf_content,
            file_options={
                "content-type": "application/pdf",
                "upsert": "false"
            }
        )

        print("PDF STORAGE SUCCESS")

        # Step 11: Insert document metadata
        document_result = supabase.table("documents").insert({
            "user_id": user_id,
            "filename": safe_filename,
            "file_size": len(pdf_content),
            "total_pages": total_pages,
            "storage_path": storage_path
        }).execute()

        if not document_result.data:
            raise Exception("Document metadata insertion failed.")

        document_id = document_result.data[0]["id"]

        print("DOCUMENT METADATA SAVED")

        # Step 12: Generate embeddings
        chunk_records = []

        for item in chunks:

            embedding = generate_embedding(
                item["chunk_text"]
            )

            chunk_records.append({
                "document_id": document_id,
                "user_id": user_id,
                "chunk_text": item["chunk_text"],
                "page_number": item["page_number"],
                "embedding": embedding
            })

        # Step 13: Insert chunks into Supabase
        supabase.table("document_chunks").insert(
            chunk_records
        ).execute()

        print("DOCUMENT CHUNKS SAVED")

        # Step 14: Return successful response
        return {
            "document_id": document_id,
            "filename": safe_filename,
            "file_size": len(pdf_content),
            "total_pages": total_pages,
            "total_chunks": len(chunk_records),
            "storage_path": storage_path,
            "message": "PDF uploaded and saved successfully."
        }

    except HTTPException:
        raise

    except Exception as error:

        print("DOCUMENT UPLOAD ERROR:", repr(error))

        # Step 15: Cleanup failed upload
        try:

            if document_id:

                supabase.table("document_chunks").delete().eq(
                    "document_id", document_id
                ).execute()

                supabase.table("documents").delete().eq(
                    "id", document_id
                ).execute()

            if storage_path:

                supabase.storage.from_("documents").remove(
                    [storage_path]
                )

        except Exception as cleanup_error:
            print("CLEANUP ERROR:", repr(cleanup_error))

        raise HTTPException(
            status_code=500,
            detail="Document upload failed. Check backend terminal."
        )

    finally:
        await file.close()
