from pathlib import Path
from io import BytesIO
from pypdf import PdfReader

pdf_path = Path("../data/sample.pdf")

pdf = PdfReader(BytesIO(pdf_path.read_bytes()))

print("Total PDF pages:", len(pdf.pages))

for number, page in enumerate(pdf.pages, start=1):
    text = page.extract_text() or ""
    print(f"Page {number}: {len(text)} characters")