
from app.services.semantic_search import search_similar_chunks
from app.services.llm import groq_client, MODEL_NAME


def generate_answer(
    supabase,
    question: str,
    document_id: str
):
    # Step 1: Retrieve relevant chunks
    retrieved_chunks = search_similar_chunks(
        supabase=supabase,
        question=question,
        document_id=document_id,
        match_count=5
    )

    if not retrieved_chunks:
        return {
            "answer": "No relevant information found in this document.",
            "sources": []
        }

    # Step 2: Prepare document context
    context = ""

    for index, chunk in enumerate(retrieved_chunks, start=1):
        context += (
            f"\nSource {index}\n"
            f"Page: {chunk['page_number']}\n"
            f"Content: {chunk['chunk_text']}\n"
        )

    # Step 3: Send context and question to Groq
    response = groq_client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Document Copilot, a financial research assistant. "
                    "Answer questions using only the provided document context. "
                    "Do not invent facts. "
                    "Cite the source number and page number for each important claim. "
                    "If the answer is not available in the context, say so."
                )
            },
            {
                "role": "user",
                "content": (
                    f"Document Context:\n{context}\n"
                    f"Question: {question}"
                )
            }
        ],
        max_completion_tokens=1000
    )

    # Step 4: Extract AI-generated answer
    answer = response.choices[0].message.content

    # Step 5: Prepare source information
    sources = [
        {
            "chunk_id": chunk["id"],
            "page_number": chunk["page_number"],
            "similarity": chunk["similarity"]
        }
        for chunk in retrieved_chunks
    ]

    return {
        "answer": answer,
        "sources": sources
    }
