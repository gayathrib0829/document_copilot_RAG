from app.services.chunking import chunk_pages

pages =["company overview."* 50,
        "Finance performance."* 50
        ]
chunks = chunk_pages(pages)
print("Total chunks:",len(chunks))


for index,chunk in enumerate(chunks,start=1):
    print(f"\n Chunk {index}")
    print("Page:",chunk["page_number"])
    print("Text:",chunk["chunk_text"][:80])
    print("Length:",len(chunk["chunk_text"]))