import React, { useRef, useState } from 'react';
import { useMira } from '../context/MiraContext';
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
      Array.from(e.dataTransfer.files).forEach((file) => addDocument(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => addDocument(file));
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTokens = documents.reduce((sum, d) => sum + (d.tokenCount || 0), 0);

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
            className={`documents-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="dropzone-icon-circle">
              <Upload size={24} style={{ color: 'var(--brand-mint)' }} />
            </div>
            <h3 className="dropzone-title">Drop your documents here, or browse</h3>
            <p className="dropzone-sub">
              Supports PDF, Markdown, TXT, JSON, PNG, and JPG. Automatically indexed for ContextCore retrieval.
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
                    onClick={() => removeDocument(doc.id)}
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
