
import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw, Calendar, FileText } from "lucide-react";

import {
  getConversations,
  type Conversation
} from "../services/conversations";

function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadConversations() {
    try {
      setLoading(true);
      setError("");

      const result = await getConversations();
      setConversations(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  return (
    <section className="conversations-page">
      <div className="conversations-page-heading">
        <div>
          <h2>Conversations</h2>
          <p>View your previous AI conversations.</p>
        </div>

        <button
          className="refresh-documents"
          onClick={loadConversations}
          disabled={loading}
          title="Refresh conversations"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {loading && <p>Loading conversations...</p>}

      {error && (
        <div className="document-error">
          {error}
          <button onClick={loadConversations}>Try again</button>
        </div>
      )}

      {!loading && !error && conversations.length === 0 && (
        <div className="document-empty">
          <MessageSquare size={30} />
          <h3>No conversations yet</h3>
          <p>Ask questions about your uploaded PDFs to start a conversation.</p>
        </div>
      )}

      {!loading && !error && conversations.length > 0 && (
        <div className="conversations-list">
          {conversations.map((conversation) => (
            <div className="conversation-card" key={conversation.id}>
              <div className="conversation-card-icon">
                <MessageSquare size={22} />
              </div>

              <div className="conversation-card-info">
                <h3>{conversation.title}</h3>

                <div className="conversation-card-meta">
                  <span>
                    <FileText size={14} />
                    Document conversation
                  </span>

                  <span>
                    <Calendar size={14} />
                    {formatDate(conversation.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Conversations;
