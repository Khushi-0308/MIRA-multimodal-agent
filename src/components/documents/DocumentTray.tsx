import React, { useRef, useState } from 'react';
import { useMira } from '../../context/MiraContext';
import {
  Folder,
  Upload,
  FileText,
  FileImage,
  Plus,
  Eye,
  Trash2,
} from 'lucide-react';

export const DocumentTray: React.FC = () => {
  const {
    documents,
    addDocument,
    removeDocument,
    setSelectedDocForPreview,
  } = useMira();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

  const getDocIcon = (name: string) => {
    if (name.endsWith('.pdf')) {
      return (
        <div className="doc-type-icon-box pdf">
          <span>PDF</span>
        </div>
      );
    }
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.webp')) {
      return (
        <div className="doc-type-icon-box image">
          <FileImage size={15} />
        </div>
      );
    }
    return (
      <div className="doc-type-icon-box file">
        <FileText size={15} />
      </div>
    );
  };

  return (
    <div className="mira-card files-companion-card">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="mira-card-header">
        <div className="mira-card-title">
          <div className="icon-circle-badge">
            <Folder size={15} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <span>Files & Documents</span>
        </div>

        <button
          className="mira-btn mira-btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', color: 'var(--brand-primary)', borderColor: 'var(--border-subtle)', fontWeight: 700 }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus size={12} />
          <span>Add</span>
        </button>
      </div>

      <div className="mira-card-body" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Drag & Drop Zone from Reference Image */}
        <div
          className={`files-drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={18} style={{ color: 'var(--brand-primary)', marginBottom: 4 }} />
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Drag & drop files here
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            or click to upload
          </div>
        </div>

        {/* File Items List matching Reference */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {documents.map((doc) => (
            <div key={doc.id} className="file-item-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                {getDocIcon(doc.name)}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span className="file-name-text" title={doc.name}>
                    {doc.name}
                  </span>
                  <span className="file-meta-text">
                    {(doc.size / (1024 * 1024)).toFixed(1)} MB • {doc.name.split('.').pop()?.toUpperCase() || 'DOC'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  className="mira-btn mira-btn-icon"
                  style={{ padding: 4 }}
                  onClick={() => setSelectedDocForPreview(doc)}
                  title="Preview Document"
                >
                  <Eye size={13} />
                </button>
                <button
                  className="mira-btn mira-btn-icon"
                  style={{ padding: 4 }}
                  onClick={() => removeDocument(doc.id)}
                  title="Remove Document"
                >
                  <Trash2 size={13} className="text-slate-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
