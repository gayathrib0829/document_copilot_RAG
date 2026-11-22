from pathlib import Path
from app.services.document_processing import process_pdf

pdf_path = Path("../data/sample.pdf")

pdf_content = pdf_path.read_bytes()

chunks = process_pdf(pdf_content)

print("Total chunks:", len(chunks))

for index, chunk in enumerate(chunks, start=1):
    print(f"\nChunk {index}")
    print("Page:", chunk["page_number"])
    print("Text:", chunk["chunk_text"][:100])
    print("Length:", len(chunk["chunk_text"]))