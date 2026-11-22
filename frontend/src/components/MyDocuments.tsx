
import { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  HardDrive,
  RefreshCw,
  FolderOpen
} from "lucide-react";

import {
  getDocuments,
  type DocumentItem
} from "../services/documents";

interface MyDocumentsProps {
  activeDocumentId: string | null;
  onDocumentSelect: (document: DocumentItem) => void;
}

function MyDocuments({
  activeDocumentId,
  onDocumentSelect
}: MyDocumentsProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const result = await getDocuments();
      setDocuments(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load documents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  function formatFileSize(size: number) {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  return (
    <section className="my-documents-page">
      <div className="documents-page-heading">
        <div>
          <h2>My Documents</h2>
          <p>View and manage your uploaded PDF documents.</p>
        </div>

        <button
          className="refresh-documents"
          onClick={loadDocuments}
          disabled={loading}
          title="Refresh documents"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="documents-summary">
        <FolderOpen size={22} />
        <div>
          <strong>{documents.length} Documents</strong>
          <small>Your uploaded PDF library</small>
        </div>
      </div>

      {loading && (
        <p className="document-status">Loading your documents...</p>
      )}

      {error && (
        <p className="document-error">{error}</p>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="document-empty">
          <FileText size={35} />
          <h3>No documents yet</h3>
          <p>Upload a PDF from your Dashboard to see it here.</p>
        </div>
      )}

      {!loading && documents.length > 0 && (
        <div className="my-documents-grid">
          {documents.map((document) => (
            <button
              type="button"
              key={document.id}
              className={`my-document-card ${
                activeDocumentId === document.id ? "active" : ""
              }`}
              onClick={() => onDocumentSelect(document)}
            >
              <div className="my-document-icon">
                <FileText size={28} />
              </div>

              <strong className="my-document-name">
                {document.filename}
              </strong>

              <div className="my-document-details">
                <span>
                  <FileText size={14} />
                  {document.total_pages} pages
                </span>

                <span>
                  <HardDrive size={14} />
                  {formatFileSize(document.file_size)}
                </span>

                <span>
                  <Calendar size={14} />
                  {formatDate(document.created_at)}
                </span>
              </div>

              <span className="my-document-action">
                {activeDocumentId === document.id
                  ? "Selected"
                  : "Open document"}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyDocuments;
