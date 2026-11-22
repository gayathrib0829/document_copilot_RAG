from pydantic import BaseModel

class DocumentRespose(BaseModel):
    filename: str
    content_type : str
    file_size : int
    extracted_text: str
    page_count : int
    message : str