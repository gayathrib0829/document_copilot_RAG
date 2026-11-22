# 📄 Document Copilot – AI-Powered PDF Research Assistant

An AI-powered document research assistant that allows users to upload PDF documents, ask questions in natural language, and receive context-aware answers with source references.

Document Copilot uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant information from uploaded documents and generate accurate, document-grounded responses.

## 🚀 Features

- **PDF Upload:** Upload and process PDF documents securely.
- **AI-Powered Question Answering:** Ask natural-language questions about uploaded documents.
- **Retrieval-Augmented Generation (RAG):** Retrieve relevant document chunks using semantic similarity search.
- **Semantic Search:** Generate embeddings using Sentence Transformers and search with Supabase pgvector.
- **Source References:** Display relevant source pages alongside AI-generated answers.
- **Conversation History:** Save and retrieve previous conversations.
- **User Authentication:** Secure authentication using Supabase Auth.
- **Document Management:** View and manage uploaded documents.
- **Logout:** Securely sign out of your account.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI | CSS, Lucide React |
| Backend | Python, FastAPI |
| AI Model | Groq Cloud – `openai/gpt-oss-120b` |
| Embeddings | Sentence Transformers – `all-MiniLM-L6-v2` |
| Database | Supabase PostgreSQL |
| Vector Search | pgvector |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| API Communication | REST API |

## 🧠 RAG Architecture

Document Copilot follows a Retrieval-Augmented Generation pipeline.

### Document Processing Workflow

1. User uploads a PDF document.
2. FastAPI receives and validates the uploaded file.
3. Text is extracted from the PDF.
4. Extracted text is divided into smaller chunks.
5. Sentence Transformers generate embeddings for each chunk.
6. Document metadata, chunks, and embeddings are stored in Supabase.
7. The user asks a question about the uploaded document.
8. The question is converted into an embedding.
9. Semantic search retrieves the most relevant document chunks.
10. The retrieved context is passed to the Groq LLM.
11. The LLM generates an answer based on the retrieved context.
12. The answer and source references are saved in conversation history.

### Architecture Overview

```text
             User
              |
              v
       React Frontend
              |
              v
        FastAPI Backend
              |
       PDF Processing
              |
       Text Extraction
              |
          Chunking
              |
         Embeddings
              |
              v
      Supabase + pgvector
              |
        Semantic Search
              |
       Relevant Chunks
              |
              v
          Groq LLM
              |
        Generated Answer
              |
              v
       Answer + Sources
              |
              v
        React Frontend
```

## 📁 Project Structure

```text
document_copilot/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── .env
│
├── data/
├── docs/
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.12+
- Node.js
- npm
- Git
- Supabase account
- Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/gayathrib0829/document_copilot_RAG.git

cd document_copilot_RAG
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_publishable_or_anon_key
GROQ_API_KEY=your_groq_api_key
```

Run the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend API:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔐 Environment Variables

The application requires Supabase and Groq credentials.

| Variable | Purpose |
|---|---|
| SUPABASE_URL | Supabase project URL |
| SUPABASE_KEY | Backend Supabase publishable/anon key |
| GROQ_API_KEY | Groq API authentication |
| VITE_SUPABASE_URL | Frontend Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Frontend Supabase publishable key |

**Security:** Never commit `.env` files, API keys, or private credentials to GitHub.

## 🗄️ Database

The application uses Supabase PostgreSQL with pgvector for storing and retrieving document embeddings.

Main database tables:

- `documents` – Stores uploaded document metadata.
- `document_chunks` – Stores extracted text chunks and vector embeddings.
- `conversations` – Stores conversation details.
- `conversation_messages` – Stores user questions and AI-generated answers.

Row Level Security (RLS) is used to protect user-specific records.

## 🔮 Future Enhancements

- Support for multiple document formats.
- Advanced document summarization.
- Improved citation and source highlighting.
- Multi-document question answering.
- Financial report analysis for SEC 10-K and 10-Q filings.
- Cloud deployment and performance optimization.

## 👩‍💻 Author

**Gayathri B**

GitHub: [@gayathrib0829](https://github.com/gayathrib0829)

---

⭐ If you find this project interesting, consider giving the repository a star.