from pydantic import BaseModel, Field
from uuid import UUID

class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)
    document_id: UUID
    conversation_id: UUID | None = None