def chunk_pages(
    pages: list[str],
    chunk_size: int = 500,
    chunk_overlap: int = 50
):
    chunks = []
    for page_number,page_text in enumerate(pages,start=1):
        start = 0
        while start <len(page_text):
            end = start + chunk_size
            chunk_text = page_text[start:end]
            if chunk_text.strip():
                chunks.append({"page_number":page_number,
                               "chunk_text":chunk_text})
            start += chunk_size - chunk_overlap
    return chunks
        