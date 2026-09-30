import React from 'react';
import { useMira } from '../../context/MiraContext';
import { FileText, X } from 'lucide-react';

export const DocumentPreviewModal: React.FC = () => {
  const { selectedDocForPreview, setSelectedDocForPreview } = useMira();

  if (!selectedDocForPreview) return null;

  return (
    <div className="mira-modal-backdrop" onClick={() => setSelectedDocForPreview(null)}>
      <div className="mira-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mira-card-header">
          <div className="mira-card-title">
            <FileText size={16} style={{ color: 'var(--brand-primary)' }} />
            <span>Document Inspector: {selectedDocForPreview.name}</span>
          </div>

          <button
            className="mira-btn mira-btn-icon"
            onClick={() => setSelectedDocForPreview(null)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mira-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              background: 'var(--bg-surface-secondary)',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '11.5px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>File Size</span>
              <strong>{Math.round(selectedDocForPreview.size / 1024)} KB</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Context Weight</span>
              <strong>{selectedDocForPreview.tokenCount.toLocaleString()} tokens</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Indexed Chunks</span>
              <strong>{selectedDocForPreview.chunksCount || 1} chunks</strong>
            </div>
          </div>

          {/* Semantic Summary */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              ContextCore Semantic Summary
            </div>
            <div
              style={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {selectedDocForPreview.summary || 'Document parsed into vector embedding store.'}
            </div>
          </div>

          {/* Content Snippet */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Extracted Chunks / Sample Content
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                maxHeight: '200px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {selectedDocForPreview.contentSnippet || 'Loading raw file stream...'}
            </pre>
          </div>
        </div>

        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--bg-surface-secondary)',
          }}
        >
          <button
            className="mira-btn mira-btn-primary"
            onClick={() => setSelectedDocForPreview(null)}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
