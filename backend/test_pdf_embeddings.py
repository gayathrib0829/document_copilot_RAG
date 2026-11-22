from pathlib import Path

from app.services.document_processing import process_pdf
from app.services.embedding import generate_embedding

# Read the sample PDF
pdf_path = Path("../data/sample.pdf")
pdf_content = pdf_path.read_bytes()

# Extract and split PDF text
chunks = process_pdf(pdf_content)

print("Total chunks:", len(chunks))

# Generate embeddings for every chunk
for index, chunk in enumerate(chunks, start=1):

    embedding = generate_embedding(chunk["chunk_text"])

    print(f"\nChunk {index}")
    print("Page:", chunk["page_number"])
    print("Embedding dimensions:", len(embedding))
    print("First 5 values:", embedding[:5])