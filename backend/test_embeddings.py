from app.services.embedding import generate_embedding

text = "The company reported an increase in revenue."

embedding = generate_embedding(text)

print("Embedding dimensions:", len(embedding))
print("First 5 values:", embedding[:5])