
import { supabase } from "./supabase";

export interface Conversation {
  id: string;
  user_id: string;
  document_id: string;
  title: string;
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
}

const API_BASE_URL = "http://localhost:8000";

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

export async function getConversations(): Promise<Conversation[]> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Unable to load conversations.");
  }

  const result = await response.json();
  return result.conversations;
}

export async function getConversationMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  const token = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Unable to load messages.");
  }

  const result = await response.json();
  return result.messages;
}
