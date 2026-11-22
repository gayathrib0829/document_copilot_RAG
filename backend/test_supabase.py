from app.core.supabase_client import supabase

email = input("Enter test user email: ")
password = input("Enter test user password: ")

# Step 1: Sign in
response = supabase.auth.sign_in_with_password({
    "email": email,
    "password": password
})

user_id = response.user.id

# Step 2: Insert a test document
document = {
    "user_id": user_id,
    "filename": "test_document.pdf",
    "file_size": 1024,
    "total_pages": 2
}

result = supabase.table("documents").insert(document).execute()

print("\nDocument inserted successfully!")
print(result.data)