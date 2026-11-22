
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import Sidebar, { type Section } from "./components/Sidebar";
import Header from "./components/Header";
import UploadPanel from "./components/UploadPanel";
import ChatPanel from "./components/ChatPanel";
import MyDocuments from "./components/MyDocuments";
import Conversations from "./components/Conversations";
import Auth from "./components/Auth";

import { supabase } from "./services/supabase";
import type { UploadResponse } from "./services/api";
import type { DocumentItem } from "./services/documents";

import "./App.css";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeDocument, setActiveDocument] =
    useState<DocumentItem | null>(null);

  const [activeSection, setActiveSection] =
    useState<Section>("dashboard");

  // Check authentication and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Session error:", error.message);
      }

      setSession(data.session);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (!newSession) {
        setActiveDocument(null);
        setActiveSection("dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle successful PDF upload
  function handleUploadSuccess(document: UploadResponse) {
    setActiveDocument({
      id: document.document_id,
      filename: document.filename,
      file_size: document.file_size,
      total_pages: document.total_pages,
      created_at: new Date().toISOString(),
    });
  }

  // Handle document selection
  function handleDocumentSelect(document: DocumentItem) {
    setActiveDocument(document);
    setActiveSection("dashboard");
  }

  // Handle logout
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    setActiveDocument(null);
    setActiveSection("dashboard");
  }

  // Authentication loading screen
  if (checkingAuth) {
    return (
      <div className="auth-loading">
        Loading Document Copilot...
      </div>
    );
  }

  // Show login page when user is not authenticated
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-container">

      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      />

      <main className="main-content">

        <Header />

        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <div className="workspace">

            <UploadPanel
              onUploadSuccess={handleUploadSuccess}
              onDocumentSelect={handleDocumentSelect}
              activeDocumentId={activeDocument?.id ?? null}
            />

            <ChatPanel
              documentId={activeDocument?.id ?? null}
            />

          </div>
        )}

        {/* My Documents */}
        {activeSection === "documents" && (
          <MyDocuments
            activeDocumentId={activeDocument?.id ?? null}
            onDocumentSelect={handleDocumentSelect}
          />
        )}

        {/* Conversations */}
        {activeSection === "conversations" && (
          <Conversations />
        )}

      </main>
    </div>
  );
}

export default App;
