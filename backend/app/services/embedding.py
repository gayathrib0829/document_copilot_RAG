from sentence_transformers import SentenceTransformer

# Load the model from the local cache
model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2",
    local_files_only=True
)


def generate_embedding(text: str) -> list[float]:
    embedding = model.encode(text)
    return embedding.tolist()