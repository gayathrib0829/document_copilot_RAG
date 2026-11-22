
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.question import router as question_router
from app.routes.document import router as document_router
from app.routes.conversation import router as conversation_router

app = FastAPI(
    title="Document Copilot",
    description="AI-powered Financial Research Assistant"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return {
        "message": "Welcome to Document Copilot",
        "status": "Backend is running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(question_router)
app.include_router(document_router)
app.include_router(conversation_router)
