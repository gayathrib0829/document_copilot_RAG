from pathlib import Path

from app.core.supabase_client import supabase
from app.services.document_processing import process_pdf
from app.services.embedding import generate_embedding

# Step 1: Locate the sample PDF
pdf_path = Path("../data/sample.pdf")

# Step 2: Read the PDF as bytes
pdf_content = pdf_path.read_bytes()

# Step 3: Extract text and create chunks
chunks = process_pdf(pdf_content)

print("Total chunks generated:", len(chunks))

# Step 4: Generate embeddings for each chunk

for index, chunk in enumerate(chunks, start=1):

    embedding = generate_embedding(chunk["chunk_text"])

    print(f"\nChunk {index}")
    print("Page number:", chunk["page_number"])
    print("Embedding dimensions:", len(embedding))

# Step 4: Generate and collect embeddings

chunk_records = []

for index, chunk in enumerate(chunks, start=1):

    embedding = generate_embedding(chunk["chunk_text"])

    chunk_record = {
        "chunk_text": chunk["chunk_text"],
        "page_number": chunk["page_number"],
        "embedding": embedding
    }

    chunk_records.append(chunk_record)

    print(f"Chunk {index} processed successfully")

print("\nTotal chunk records prepared:", len(chunk_records))

# Step 5: Authenticate the user

email = input("\nEnter test user email: ")
password = input("Enter test user password: ")

auth_response = supabase.auth.sign_in_with_password({
    "email": email,
    "password": password
})

user_id = auth_response.user.id

print("\nUser authenticated successfully!")
print("User ID:", user_id)

# Step 6: Retrieve the existing document ID

document_response = (
    supabase.table("documents")
    .select("id")
    .eq("user_id", user_id)
    .eq("filename", "test_document.pdf")
    .order("created_at", desc=True)
    .limit(1)
    .execute()
)

if not document_response.data:
    raise ValueError("Test document not found!")

document_id = document_response.data[0]["id"]

print("\nExisting document found!")
print("Document ID:", document_id)

# Step 7: Attach document and user IDs to every chunk

for record in chunk_records:
    record["document_id"] = document_id
    record["user_id"] = user_id

print("\nDocument and user IDs added to all chunks!")
print("Total records ready for insertion:", len(chunk_records))

# Step 8: Insert all chunks into Supabase

result = (
    supabase.table("document_chunks")
    .insert(chunk_records)
    .execute()
)

print("\nChunks inserted successfully!")
print("Total chunks inserted:", len(result.data))