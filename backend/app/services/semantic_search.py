
from app.services.embedding import generate_embedding


def search_similar_chunks(
    supabase,
    question: str,
    document_id: str,
    match_count: int = 5
):
    # Step 1: Convert the question into an embedding
    question_embedding = generate_embedding(question)

    # Step 2: Search Supabase using the PostgreSQL function
    response = supabase.rpc(
        "match_document_chunks",
        {
            "query_embedding": question_embedding,
            "match_document_id": document_id,
            "match_count": match_count
        }
    ).execute()

    # Step 3: Return matching chunks
    return response.data
