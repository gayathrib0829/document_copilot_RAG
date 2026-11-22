
import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  RefreshCw,
  CheckCircle,
  Calendar,
  HardDrive
} from "lucide-react";

import {
  uploadPDF,
  type UploadResponse
} from "../services/api";

import {
  getDocuments,
  type DocumentItem
} from "../services/documents";

interface UploadPanelProps {
  onUploadSuccess: (document: UploadResponse) => void;
  onDocumentSelect: (document: DocumentItem) => void;
  activeDocumentId: string | null;
}

function UploadPanel({
  onUploadSuccess,
  onDocumentSelect,
  activeDocumentId
}: UploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [error, setError] = useState("");

  async function loadDocuments() {
    try {
      setFetching(true);
      setError("");

      const result = await getDocuments();
      setDocuments(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load documents."
      );
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("Please select a PDF first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading and processing PDF...");

      const result = await uploadPDF(selectedFile);

      onUploadSuccess(result);

      setMessage(
        `Success! ${result.total_pages} pages and ${result.total_chunks} chunks processed.`
      );

      setSelectedFile(null);

      await loadDocuments();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage("Please select a PDF file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setMessage("");
  }

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
    <section className="upload-panel">

      <div className="section-heading">
        <h3>Your Documents</h3>
        <span className="count">{documents.length} PDFs</span>
      </div>

      {/* Upload Area */}
      <label className="upload-box">
        <Upload size={30} />

        <strong>Upload your document</strong>

        <p>Choose a PDF file to start researching</p>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          hidden
        />

        <span className="upload-button">Browse PDF</span>
      </label>

      {/* Selected File */}
      {selectedFile && (
        <div className="selected-file">
          <FileText size={20} />

          <div>
            <strong>{selectedFile.name}</strong>
            <small>{formatFileSize(selectedFile.size)}</small>
          </div>
        </div>
      )}

      <button
        className="new-chat"
        onClick={handleUpload}
        disabled={loading || !selectedFile}
      >
        {loading ? "Processing..." : "Upload Document"}
      </button>

      {message && <p className="upload-message">{message}</p>}

      {/* Document List */}
      <div className="document-list-section">

        <div className="document-list-heading">
          <h4>Uploaded Documents</h4>

          <button
            className="refresh-documents"
            onClick={loadDocuments}
            disabled={fetching}
            title="Refresh documents"
          >
            <RefreshCw
              size={16}
              className={fetching ? "loading-spinner" : ""}
            />
          </button>
        </div>

        {fetching && (
          <p className="document-status">Loading documents...</p>
        )}

        {error && (
          <p className="document-error">{error}</p>
        )}

        {!fetching && !error && documents.length === 0 && (
          <div className="document-empty">
            <FileText size={25} />
            <p>No documents uploaded yet.</p>
          </div>
        )}

        {documents.map((document) => (
          <button
            type="button"
            key={document.id}
            className={`document-card ${
              activeDocumentId === document.id ? "active" : ""
            }`}
            onClick={() => onDocumentSelect(document)}
          >
            <div className="document-card-icon">
              <FileText size={21} />
            </div>

            <div className="document-card-info">
              <strong>{document.filename}</strong>

              <small>
                <span>
                  <FileText size={12} />
                  {document.total_pages} pages
                </span>

                <span>
                  <HardDrive size={12} />
                  {formatFileSize(document.file_size)}
                </span>
              </small>

              <small className="document-date">
                <Calendar size={12} />
                {formatDate(document.created_at)}
              </small>
            </div>

            {activeDocumentId === document.id && (
              <CheckCircle
                size={17}
                className="document-selected-icon"
              />
            )}
          </button>
        ))}

      </div>

    </section>
  );
}

export default UploadPanel;
