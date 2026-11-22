
import { supabase } from "./supabase";

export interface DocumentItem {
  id: string;
  filename: string;
  file_size: number;
  total_pages: number;
  created_at: string;
}

export async function getDocuments(): Promise<DocumentItem[]> {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session?.access_token) {
    throw new Error("Please sign in to view your documents.");
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id, filename, file_size, total_pages, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load documents: ${error.message}`);
  }

  return (data ?? []) as DocumentItem[];
}
