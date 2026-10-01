import React, { useRef, useState, useEffect } from 'react';
import { useMira } from '../context/MiraContext';
import { apiClient, wsClient } from '../services';
import {
  FileText,
  Upload,
  Plus,
  Eye,
  Trash2,
  FileImage,
  Database,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    addDocument,
    removeDocument,
    setSelectedDocForPreview,
    contextCore,
  } = useMira();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sessionIdRef = useRef<string>(`mira-docs-${Date.now().toString(36)}`);

  const totalTokens = documents.reduce((sum, d) => sum + (d.tokenCount || 0), 0);

  // Connect WebSocket and sync ContextCore on mount
  useEffect(() => {
    const sessionId = sessionIdRef.current;
    wsClient.connect(sessionId).catch((err) => {
      console.warn('[DocumentsPage] WebSocket initial connect:', err);
    });

    // Synchronize initial document collection with backend ContextCore
    apiClient.saveContext({
      session_id: sessionId,
      modalities: {
        documents: {
          count: documents.length,
          total_tokens: totalTokens,
          status: 'ready',
          updated_at: new Date().toISOString(),
        },
      },
      active_anchors: documents.map((doc) => ({
        modality: 'documents',
        title: `Doc: ${doc.name}`,
        source: `Uploaded: ${doc.name}`,
        summary: doc.summary || `Indexed ${doc.tokenCount} tokens.`,
        token_weight: doc.tokenCount || 120,
      })),
    }).catch((err) => console.warn('[DocumentsPage] Initial context sync error:', err));

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const syncDocumentsToBackend = (updatedDocs: typeof documents, eventMsg?: string) => {
    const sessionId = sessionIdRef.current;
    const tokens = updatedDocs.reduce((sum, d) => sum + (d.tokenCount || 0), 0);

    apiClient.saveContext({
      session_id: sessionId,
      modalities: {
        documents: {
          count: updatedDocs.length,
          total_tokens: tokens,
          status: 'ready',
          updated_at: new Date().toISOString(),
        },
      },
      active_anchors: updatedDocs.map((doc) => ({
        modality: 'documents',
        title: `Doc: ${doc.name}`,
        source: `Uploaded: ${doc.name}`,
        summary: doc.summary || `Indexed ${doc.tokenCount} tokens.`,
        token_weight: doc.tokenCount || 120,
      })),
    }).catch((err) => console.warn('[DocumentsPage] Save context error:', err));

    if (wsClient.getStatus() === 'connected' && eventMsg) {
      wsClient.sendMessage({
        type: 'document_event',
        message: eventMsg,
        documents_count: updatedDocs.length,
        total_tokens: tokens,
      });
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadStatusMsg(`Parsing and embedding ${files.length} document(s)...`);

    for (const file of files) {
      try {
        const res = await apiClient.uploadDocument(file, sessionIdRef.current);
        const docItem = {
          id: res.document_id,
          name: res.filename,
          size: res.file_size,
          type: file.type || 'text/plain',
          uploadedAt: 'Just now',
          tokenCount: res.token_count,
          status: 'ready' as const,
          chunksCount: res.chunks_count,
          summary: res.summary,
          contentSnippet: res.content_snippet,
        };
        addDocument(docItem);

        if (wsClient.getStatus() === 'connected') {
          wsClient.sendMessage({
            type: 'document_uploaded',
            filename: res.filename,
            filesize: res.file_size,
            token_count: res.token_count,
            message: `MIRA parsed document: ${res.filename} (${res.chunks_count} semantic chunks, ~${res.token_count} tokens). Stored in ContextCore.`,
          });
        }
      } catch (err) {
        console.warn('[DocumentsPage] Backend upload fallback:', err);
        addDocument(file);
      }
    }

    setIsUploading(false);
    setUploadStatusMsg(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveDocument = (docId: string, docName: string) => {
    removeDocument(docId);
    apiClient.deleteDocument(sessionIdRef.current, docId).catch(() => {});
    const remaining = documents.filter((d) => d.id !== docId);
    syncDocumentsToBackend(remaining, `MIRA removed document: ${docName} from ContextCore semantic store.`);
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const getDocIcon = (name: string) => {
    if (name.endsWith('.pdf')) {
      return (
        <div className="doc-icon-badge pdf">
          <span>PDF</span>
        </div>
      );
    }
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.webp')) {
      return (
        <div className="doc-icon-badge image">
          <FileImage size={18} />
        </div>
      );
    }
    return (
      <div className="doc-icon-badge file">
        <FileText size={18} />
      </div>
    );
  };

  return (
    <div className="page-container documents-page-container">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleFileChange}
      />

      {/* Documents Header */}
      <div className="documents-page-header">
        <div className="documents-header-info">
          <div className="icon-circle-badge docs-icon-badge">
            <FileText size={20} style={{ color: 'var(--brand-mint)' }} />
          </div>
          <div>
            <div className="documents-title-row">
              <h2 className="documents-header-title">Document Workspace</h2>
              <span className="status-pill ready">Documents Ready</span>
            </div>
            <p className="documents-header-sub">
              Upload notes, PDFs, code files and images into ContextCore semantic memory
            </p>
          </div>
        </div>

        <div className="documents-header-actions">
          <button
            className="mira-btn mira-btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={15} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Drop Zone + Document Library (Left) & ContextCore Memory Summary (Right) */}
      <div className="documents-main-grid">
        {/* Left Column: Dropzone and File Cards */}
        <div className="documents-left-column">
          {/* Drag & Drop Hero Zone */}
          <div
            className={`documents-dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{ cursor: isUploading ? 'wait' : 'pointer' }}
          >
            <div className="dropzone-icon-circle">
              {isUploading ? (
                <Sparkles size={24} style={{ color: 'var(--brand-mint)', animation: 'spin 2s linear infinite' }} />
              ) : (
                <Upload size={24} style={{ color: 'var(--brand-mint)' }} />
              )}
            </div>
            <h3 className="dropzone-title">
              {isUploading ? (uploadStatusMsg || 'Ingesting document...') : 'Drop your documents here, or browse'}
            </h3>
            <p className="dropzone-sub">
              Supports PDF, DOCX, Markdown, TXT, JSON, and images. Automatically parsed and anchored for ContextCore RAG grounding.
            </p>
          </div>


          {/* Search & Filter Bar */}
          <div className="docs-search-filter-bar">
            <div className="docs-search-input-box">
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search uploaded documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="docs-count-pill">{filteredDocs.length} files</span>
          </div>

          {/* Documents Cards Grid */}
          <div className="docs-cards-grid">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="doc-workspace-card">
                <div className="doc-card-top">
                  {getDocIcon(doc.name)}
                  <div className="doc-card-name-group">
                    <h4 className="doc-card-name" title={doc.name}>
                      {doc.name}
                    </h4>
                    <span className="doc-card-meta">
                      {Math.round(doc.size / 1024)} KB • {doc.uploadedAt}
                    </span>
                  </div>
                </div>

                <p className="doc-card-summary">
                  {doc.summary || 'Indexed in ContextCore semantic store.'}
                </p>

                <div className="doc-card-tags">
                  <span className="doc-tag token-tag">
                    {doc.tokenCount} tokens
                  </span>
                  <span className="doc-tag status-tag">
                    <CheckCircle2 size={11} /> Ready
                  </span>
                </div>

                <div className="doc-card-actions">
                  <button
                    className="doc-action-btn"
                    onClick={() => setSelectedDocForPreview(doc)}
                    title="Preview Document"
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>
                  <button
                    className="doc-action-btn delete"
                    onClick={() => handleRemoveDocument(doc.id, doc.name)}
                    title="Remove from ContextCore"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: ContextCore Document Memory Integration */}
        <div className="documents-right-column">
          <div className="mira-card contextcore-docs-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Database size={16} style={{ color: 'var(--brand-mint)' }} />
                <span>ContextCore Memory</span>
              </div>
              <span className="mira-badge" style={{ background: 'var(--brand-mint-light)', color: 'var(--brand-mint)', fontWeight: 700 }}>
                ACTIVE
              </span>
            </div>

            <div className="contextcore-stats-box">
              <div className="c-stat-row">
                <span className="c-stat-label">Total Indexed Documents:</span>
                <span className="c-stat-val">{documents.length}</span>
              </div>
              <div className="c-stat-row">
                <span className="c-stat-label">Document Tokens in Memory:</span>
                <span className="c-stat-val font-mono">{totalTokens.toLocaleString()} tokens</span>
              </div>
              <div className="c-stat-row">
                <span className="c-stat-label">Active Document Anchors:</span>
                <span className="c-stat-val">
                  {contextCore.activeAnchors.filter((a) => a.modality === 'documents').length} anchors
                </span>
              </div>
              <div className="c-stat-row">
                <span className="c-stat-label">Semantic Ingestion State:</span>
                <span className="c-stat-val" style={{ color: '#10b981', fontWeight: 700 }}>
                  Synchronized
                </span>
              </div>
            </div>

            <div className="contextcore-docs-explainer">
              <Sparkles size={14} style={{ color: 'var(--brand-mint)', flexShrink: 0, marginTop: 2 }} />
              <p>
                All documents are embedded and accessible in the real-time dialogue loop. When you speak or ask questions, MIRA grounds answers directly using these anchors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
