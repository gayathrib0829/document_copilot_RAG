
import { supabase } from "./supabase";

const API_BASE_URL = "http://localhost:8000";

export interface UploadResponse {
  document_id: string;
  filename: string;
  file_size: number;
  total_pages: number;
  total_chunks: number;
  message: string;
}

export interface Source {
  chunk_id: string;
  page_number: number;
  similarity: number;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
  conversation_id: string;
}

async function getAccessToken(): Promise<string> {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please sign in to continue.");
  }

  return session.access_token;
}

export async function uploadPDF(
  file: File
): Promise<UploadResponse> {
  const token = await getAccessToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "PDF upload failed.");
  }

  return response.json();
}

export async function askQuestion(
  question: string,
  documentId: string,
  conversationId?: string
): Promise<AskResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      question,
      document_id: documentId,
      conversation_id: conversationId ?? null
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get an answer.");
  }

  return response.json();
}
