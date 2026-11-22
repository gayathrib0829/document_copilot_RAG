
from app.core.supabase_client import supabase
from app.services.rag import generate_answer

# Step 1: Login to Supabase
email = input("Enter test user email: ")
password = input("Enter test user password: ")

auth_response = supabase.auth.sign_in_with_password({
    "email": email,
    "password": password
})

print("\nLogin successful!")

# Step 2: Get document ID
document_id = input("Enter your document ID: ")

# Step 3: Ask a question
question = input("\nAsk a question about your PDF: ")

# Step 4: Generate answer using RAG
result = generate_answer(
    question=question,
    document_id=document_id
)

# Step 5: Display answer
print("\n========== DOCUMENT COPILOT ==========")

print("\nAI Answer:")
print(result["answer"])

# Step 6: Display sources
print("\nSources:")

for index, source in enumerate(result["sources"], start=1):
    print(f"\nSource {index}")
    print("Page:", source["page_number"])
    print("Similarity:", round(source["similarity"], 4))
    print("Chunk ID:", source["chunk_id"])
