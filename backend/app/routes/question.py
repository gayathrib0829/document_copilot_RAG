
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.supabase_client import get_supabase_client
from app.models.question import QuestionRequest
from app.services.rag import generate_answer

router = APIRouter()
security = HTTPBearer()


@router.post("/ask")
async def ask_question(
    request: QuestionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    access_token = credentials.credentials

    try:
        supabase = get_supabase_client(access_token)

        # Verify logged-in user
        auth_response = supabase.auth.get_user(access_token)
        user = auth_response.user

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired access token"
            )

        user_id = str(user.id)
        document_id = str(request.document_id)

        # Generate answer using existing RAG pipeline
        result = generate_answer(
            supabase=supabase,
            question=request.question,
            document_id=document_id
        )

        # Create a new conversation if no ID was provided
        if request.conversation_id is None:

            conversation_response = (
                supabase.table("conversations")
                .insert({
                    "user_id": user_id,
                    "document_id": document_id,
                    "title": request.question[:60]
                })
                .execute()
            )

            conversation_id = conversation_response.data[0]["id"]

        else:
            conversation_id = str(request.conversation_id)

            # Verify conversation belongs to this user and document
            conversation_response = (
                supabase.table("conversations")
                .select("id")
                .eq("id", conversation_id)
                .eq("user_id", user_id)
                .eq("document_id", document_id)
                .execute()
            )

            if not conversation_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Conversation not found"
                )

        # Save user question
        supabase.table("conversation_messages").insert({
            "conversation_id": conversation_id,
            "user_id": user_id,
            "role": "user",
            "content": request.question
        }).execute()

        # Save assistant answer and citations
        supabase.table("conversation_messages").insert({
            "conversation_id": conversation_id,
            "user_id": user_id,
            "role": "assistant",
            "content": result["answer"],
            "sources": result.get("sources", [])
        }).execute()

        # Update conversation timestamp
        supabase.table("conversations").update({
            "updated_at": "now()"
        }).eq("id", conversation_id).eq("user_id", user_id).execute()

        return {
            **result,
            "conversation_id": conversation_id
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
