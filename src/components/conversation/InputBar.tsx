import React, { useState, useRef } from 'react';
import { useMira } from '../../context/MiraContext';
import {
  Mic,
  MicOff,
  Send,
  Paperclip,
  X,
} from 'lucide-react';

export const InputBar: React.FC = () => {
  const {
    sendMessage,
    audioStream,
    toggleListening,
    addDocument,
  } = useMira();

  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim() && attachedFiles.length === 0) return;

    sendMessage(text, {
      documents: attachedFiles.length > 0 ? attachedFiles : undefined,
    });

    setText('');
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      addDocument(file);
      setAttachedFiles((prev) => [...prev, file.name]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="input-bar-container">
      {/* File attachments preview */}
      {attachedFiles.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 4 }}>
          {attachedFiles.map((file, idx) => (
            <div
              key={idx}
              className="mira-badge"
              style={{
                background: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Paperclip size={10} />
              <span>{file}</span>
              <X
                size={11}
                style={{ cursor: 'pointer', marginLeft: 2 }}
                onClick={() => removeAttachment(idx)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box matching reference */}
      <div className="input-composer">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Paperclip upload button */}
        <button
          className="mira-btn mira-btn-icon"
          onClick={() => fileInputRef.current?.click()}
          title="Attach Document or Image"
        >
          <Paperclip size={17} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          className="input-field"
          placeholder="Speak or type a message to MIRA..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Big Circular Coral/Rose Mic Button */}
        <button
          className={`mic-toggle-btn ${audioStream.isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title={audioStream.isListening ? 'Stop Listening' : 'Start Voice Streaming'}
        >
          {audioStream.isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Send Button */}
        <button
          className="mira-btn mira-btn-icon send-btn"
          onClick={handleSend}
          disabled={!text.trim() && attachedFiles.length === 0}
          title="Send message"
        >
          <Send size={16} style={{ color: text.trim() ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
        </button>
      </div>
    </div>
  );
};
