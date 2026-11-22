from io import BytesIO
from pypdf import PdfReader

from app.services.chunking import chunk_pages


def process_pdf(pdf_content: bytes):

    # Step 1: Read the PDF
    pdf = PdfReader(BytesIO(pdf_content))

    # Step 2: Extract text page by page
    pages = []

    for page in pdf.pages:
        page_text = page.extract_text() or ""
        pages.append(page_text)

    # Step 3: Check whether text was extracted
    if not any(page.strip() for page in pages):
        raise ValueError("No extractable text found in PDF")

    # Step 4: Split the extracted text into chunks
    chunks = chunk_pages(pages)

    return chunks