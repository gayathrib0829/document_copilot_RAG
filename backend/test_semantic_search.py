from app.core.supabase_client import supabase
from app.services.semantic_search import search_similar_chunks

# Step 1: Login
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

# Step 4: Search relevant chunks
results = search_similar_chunks(
    question=question,
    document_id=document_id,
    match_count=3
)

# Step 5: Display results
print("\nRelevant document passages:")

for index, result in enumerate(results, start=1):
    print(f"\nResult {index}")
    print("Page:", result["page_number"])
    print("Similarity:", round(result["similarity"], 4))
    print("Text:", result["chunk_text"])