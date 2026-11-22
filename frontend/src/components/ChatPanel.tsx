
import { useEffect, useState } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  Loader2
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  askQuestion,
  type Source
} from "../services/api";

interface ChatPanelProps {
  documentId: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

function ChatPanel({ documentId }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm Document Copilot. Upload a PDF and ask me questions about its contents."
    }
  ]);

  // Reset conversation when the selected document changes
  useEffect(() => {
    setConversationId(null);
    setQuestion("");

    setMessages([
      {
        role: "assistant",
        content: documentId
          ? "Document selected! Ask me questions about its contents."
          : "Hello! I'm Document Copilot. Upload a PDF and ask me questions about its contents."
      }
    ]);
  }, [documentId]);

  async function handleSend() {
    const userQuestion = question.trim();

    if (!userQuestion || loading) return;

    if (!documentId) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "Please upload a PDF before asking questions."
        }
      ]);
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userQuestion
      }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const result = await askQuestion(
        userQuestion,
        documentId,
        conversationId ?? undefined
      );

      // Save conversation ID for subsequent questions
      setConversationId(result.conversation_id);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources
        }
      ]);

    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again."
        }
      ]);

    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-panel">

      <div className="chat-heading">
        <div>
          <h3>AI Research Assistant</h3>

          <p>
            <span className="online-dot"></span>
            {documentId
              ? "Document ready"
              : "Upload a document to begin"}
          </p>
        </div>

        <Bot size={25} />
      </div>

      <div className="messages">
        {messages.map((message, index) => (
          <div
            className={`message ${message.role}`}
            key={index}
          >
            <div className="message-icon">
              {message.role === "assistant" ? (
                <Bot size={18} />
              ) : (
                <User size={18} />
              )}
            </div>

            <div className="message-content">
              <strong>
                {message.role === "assistant"
                  ? "Copilot"
                  : "You"}
              </strong>

              <div className="markdown-content">
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>

              {message.sources &&
                message.sources.length > 0 && (
                  <div className="message-sources">
                    <strong>
                      <FileText size={15} />
                      Sources
                    </strong>

                    {message.sources.map(
                      (source, sourceIndex) => (
                        <div key={source.chunk_id}>
                          Source {sourceIndex + 1}
                          {" — Page "}
                          {source.page_number}
                          {" · "}
                          Similarity:{" "}
                          {(source.similarity * 100).toFixed(1)}%
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-icon">
              <Bot size={18} />
            </div>

            <div className="message-content">
              <strong>Copilot</strong>

              <p>
                <Loader2
                  size={16}
                  className="loading-spinner"
                />
                Analyzing your document...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder={
            documentId
              ? "Ask a question about your PDF..."
              : "Upload a PDF to start chatting..."
          }
          value={question}
          disabled={loading || !documentId}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          disabled={
            loading || !question.trim() || !documentId
          }
        >
          {loading ? (
            <Loader2
              size={18}
              className="loading-spinner"
            />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      <small className="chat-note">
        AI responses are grounded in your uploaded documents.
      </small>

    </section>
  );
}

export default ChatPanel;
