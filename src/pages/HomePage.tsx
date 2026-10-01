import React from 'react';
import { useMira } from '../context/MiraContext';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import {
  MessageSquare,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  Mic,
  Eye,
  Clock,
  Sun,
} from 'lucide-react';


export const HomePage: React.FC = () => {
  const {
    agentState,
    theme,
    mascotAccessory,
    setActiveNavTab,
    toggleListening,
  } = useMira();

  return (
    <div className="page-container home-page">
      {/* Hero Welcome Card */}
      <div className="home-hero-card">
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <Sparkles size={13} />
            <span>AI Companion • AI Build Challenge 2026 PS-05</span>
          </div>

          <h1 className="home-hero-title">
            Hi, I'm MIRA ✨ What's up?
          </h1>

          <p className="home-hero-desc">
            Your real-time multimodal assistant. I hear your voice, see your screen, understand your documents, and help you take safe, verified actions.
          </p>

          <div className="home-hero-actions">
            <button
              className="mira-btn mira-btn-primary home-primary-btn"
              onClick={() => {
                setActiveNavTab('Chat');
                toggleListening();
              }}
            >
              <Mic size={16} />
              <span>Talk to MIRA</span>
            </button>

            <button
              className="mira-btn home-secondary-btn"
              onClick={() => setActiveNavTab('MyDay')}
            >
              <Sun size={16} style={{ color: '#f59e0b' }} />
              <span>My Day Dashboard</span>
            </button>

            <button
              className="mira-btn home-secondary-btn"
              onClick={() => setActiveNavTab('Vision')}
            >
              <Camera size={16} />
              <span>Show something</span>
            </button>
          </div>
        </div>


        {/* Hero Mascot Avatar */}
        <div className="home-hero-mascot-box">
          <MiraAvatar
            size={130}
            state={agentState}
            theme={theme}
            accessory={mascotAccessory}
            interactive={true}
          />
          <div className="mascot-touch-hint">Click me! 💖</div>
        </div>
      </div>

      {/* 4 Quick Action Cards */}
      <div className="home-quick-actions-grid">
        {/* Action 1: Talk to MIRA */}
        <div
          className="quick-action-card card-talk"
          onClick={() => setActiveNavTab('Chat')}
        >
          <div className="action-card-icon-box" style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
            <MessageSquare size={22} />
          </div>
          <div className="action-card-text">
            <h3>Talk to MIRA</h3>
            <p>Start voice dialogue or text chat with live audio streaming.</p>
          </div>
          <div className="action-card-arrow">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Action 2: Show Something */}
        <div
          className="quick-action-card card-vision"
          onClick={() => setActiveNavTab('Vision')}
        >
          <div className="action-card-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Camera size={22} />
          </div>
          <div className="action-card-text">
            <h3>Show something</h3>
            <p>Share your screen or turn on camera for real-time visual perception.</p>
          </div>
          <div className="action-card-arrow">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Action 3: Upload a Document */}
        <div
          className="quick-action-card card-docs"
          onClick={() => setActiveNavTab('Documents')}
        >
          <div className="action-card-icon-box" style={{ background: 'var(--brand-mint-light)', color: 'var(--brand-mint)' }}>
            <FileText size={22} />
          </div>
          <div className="action-card-text">
            <h3>Upload a document</h3>
            <p>Drop PDFs, images, or notes to index into ContextCore memory.</p>
          </div>
          <div className="action-card-arrow">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Action 4: Explore MIRA Studio */}
        <div
          className="quick-action-card card-studio"
          onClick={() => setActiveNavTab('Studio')}
        >
          <div className="action-card-icon-box" style={{ background: 'var(--brand-lavender-light)', color: 'var(--brand-lavender)' }}>
            <Sparkles size={22} />
          </div>
          <div className="action-card-text">
            <h3>Explore MIRA Studio</h3>
            <p>Switch between 5 Gen-Z themes and personalize mascot accessories.</p>
          </div>
          <div className="action-card-arrow">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* ContextCore Active Status Strip */}
      <div className="home-status-strip">
        <div className="status-strip-title">
          <span>Active Modalities & ContextCore</span>
        </div>

        <div className="status-strip-items">
          <div className="status-item">
            <Mic size={14} className="text-rose-500" />
            <span className="status-item-label">Voice:</span>
            <span className="status-item-badge ready">Ready</span>
          </div>

          <div className="status-item">
            <Eye size={14} className="text-sky-500" />
            <span className="status-item-label">Vision:</span>
            <span className="status-item-badge ready">Ready</span>
          </div>

          <div className="status-item">
            <FileText size={14} className="text-emerald-500" />
            <span className="status-item-label">Documents:</span>
            <span className="status-item-badge ready">Ready</span>
          </div>

          <div className="status-item">
            <Clock size={14} className="text-purple-500" />
            <span className="status-item-label">Session:</span>
            <span className="status-item-badge active">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
