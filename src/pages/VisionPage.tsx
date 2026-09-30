import React, { useRef, useState, useEffect } from 'react';
import { useMira } from '../context/MiraContext';
import { BoundingBoxOverlay } from '../components/visual/BoundingBoxOverlay';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import {
  Eye,
  Camera,
  Monitor,
  Upload,
  CameraOff,
  Layers,
  FileSearch,
  Scan,
} from 'lucide-react';

export const VisionPage: React.FC = () => {
  const {
    visionFeed,
    setVisionSource,
    agentState,
    setAgentState,
    theme,
    mascotAccessory,
    devMode,
    addDocument,
    captureSnapshot,
    addAnchor,
  } = useMira();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [selectedOverlay, setSelectedOverlay] = useState<'boxes' | 'ocr' | 'all'>('all');

  const startMediaStream = async (type: 'camera' | 'screen') => {
    try {
      let stream: MediaStream | null = null;
      if (type === 'camera' && navigator.mediaDevices?.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      } else if (type === 'screen' && navigator.mediaDevices?.getDisplayMedia) {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
        setVisionSource(type);
        setAgentState('observing');
      }
    } catch (err) {
      console.warn(`Could not start ${type} stream:`, err);
      setVisionSource('synthetic_test');
      setStreamActive(false);
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setVisionSource('synthetic_test');
    setAgentState('idle');
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      addDocument(file);
      setVisionSource('synthetic_test');
      setAgentState('observing');
    }
  };

  const handleTriggerAnalysis = () => {
    setAgentState('observing');
    captureSnapshot();
    addAnchor({
      modality: 'vision',
      title: 'Visual Snapshot: Screen Context',
      source: 'Vision Sensor (1920x1080)',
      summary: 'Detected UI widgets, code editor, and document notes with 2 bounding anchors.',
      tokenWeight: 280,
      isPinned: false,
    });
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className="page-container vision-page-container">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,.pdf"
        onChange={handleUploadImage}
      />

      {/* Vision Header */}
      <div className="vision-page-header">
        <div className="vision-header-info">
          <div className="icon-circle-badge vision-icon-badge">
            <Eye size={20} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <div className="vision-title-row">
              <h2 className="vision-header-title">What MIRA Sees</h2>
              <span className={`status-pill ${streamActive ? 'active' : 'ready'}`}>
                {streamActive ? `Live ${visionFeed.sourceType}` : 'Vision Ready'}
              </span>
            </div>
            <p className="vision-header-sub">
              Real-time screen understanding, live camera ingestion & visual grounding
            </p>
          </div>
        </div>

        <div className="vision-header-controls">
          <button
            className="mira-btn mira-btn-sm mira-btn-secondary"
            onClick={handleTriggerAnalysis}
            title="Analyze current visual frame"
          >
            <Scan size={14} />
            <span>Scan Scene</span>
          </button>

          {streamActive && (
            <button className="mira-btn mira-btn-sm mira-btn-danger" onClick={stopStream}>
              <CameraOff size={14} />
              <span>Stop Feed</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Vision Layout: Main Viewport (Left) + Mascot Observer & Detections (Right) */}
      <div className="vision-main-grid">
        {/* Left Column: Visual Viewport */}
        <div className="vision-viewport-card">
          <div className="viewport-stage-wrapper">
            {streamActive ? (
              <div className="vision-live-screen">
                <video ref={videoRef} className="vision-video" autoPlay playsInline muted />
                {(selectedOverlay === 'boxes' || selectedOverlay === 'all') && (
                  <BoundingBoxOverlay boxes={visionFeed.detectedBoxes} />
                )}
              </div>
            ) : (
              <div className="vision-empty-canvas" onClick={() => fileInputRef.current?.click()}>
                <div className="vision-canvas-inner">
                  <div className="vision-dashed-icon-circle">
                    <Camera size={26} style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  <h3 className="empty-canvas-title">Visual feed is ready to connect</h3>
                  <p className="empty-canvas-sub">
                    Share your screen, turn on camera, or upload an image to let MIRA perceive in real-time.
                  </p>
                  <div className="canvas-quick-pill-row">
                    <button
                      className="canvas-shortcut-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        startMediaStream('screen');
                      }}
                    >
                      <Monitor size={14} />
                      <span>Share Screen</span>
                    </button>
                    <button
                      className="canvas-shortcut-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        startMediaStream('camera');
                      }}
                    >
                      <Camera size={14} />
                      <span>Start Camera</span>
                    </button>
                    <button
                      className="canvas-shortcut-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Overlays / Dev HUD */}
            {devMode && (
              <div className="vision-hud-badge">
                <span>FPS: {visionFeed.currentFps}</span>
                <span>•</span>
                <span>{visionFeed.resolution}</span>
                <span>•</span>
                <span>ViT Grounding Active</span>
              </div>
            )}
          </div>

          {/* Viewport Control Bar */}
          <div className="viewport-bottom-bar">
            <div className="vision-source-btn-group">
              <button
                className={`vision-bar-btn ${visionFeed.sourceType === 'screen' && streamActive ? 'active' : ''}`}
                onClick={() => startMediaStream('screen')}
              >
                <Monitor size={15} />
                <span>Screen Share</span>
              </button>

              <button
                className={`vision-bar-btn ${visionFeed.sourceType === 'camera' && streamActive ? 'active' : ''}`}
                onClick={() => startMediaStream('camera')}
              >
                <Camera size={15} />
                <span>Camera</span>
              </button>

              <button
                className="vision-bar-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>Upload Image</span>
              </button>
            </div>

            <div className="vision-overlay-toggles">
              <span className="toggle-label">Overlay:</span>
              <button
                className={`overlay-chip ${selectedOverlay === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedOverlay('all')}
              >
                All
              </button>
              <button
                className={`overlay-chip ${selectedOverlay === 'boxes' ? 'active' : ''}`}
                onClick={() => setSelectedOverlay('boxes')}
              >
                Boxes
              </button>
              <button
                className={`overlay-chip ${selectedOverlay === 'ocr' ? 'active' : ''}`}
                onClick={() => setSelectedOverlay('ocr')}
              >
                OCR
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: MIRA Avatar Observing & Visual Insights */}
        <div className="vision-sidebar-panel">
          {/* MIRA Observing Card */}
          <div className="mira-card vision-observer-card">
            <div className="observer-avatar-wrap">
              <MiraAvatar
                size={88}
                state={agentState === 'observing' ? 'observing' : 'idle'}
                theme={theme}
                accessory={mascotAccessory}
                interactive={true}
              />
            </div>
            <div className="observer-status-text">
              <h3 className="observer-status-title">
                {agentState === 'observing' ? 'MIRA is Observing ✨' : 'MIRA Eyes Ready'}
              </h3>
              <p className="observer-status-desc">
                {agentState === 'observing'
                  ? 'Analyzing visual frames and mapping detected objects into ContextCore.'
                  : 'Start a stream or upload an image to begin real-time observation.'}
              </p>
            </div>
          </div>

          {/* Detections & OCR Card */}
          <div className="mira-card vision-detections-card">
            <div className="mira-card-header" style={{ padding: '12px 16px' }}>
              <div className="mira-card-title" style={{ fontSize: '13px' }}>
                <Layers size={15} style={{ color: 'var(--brand-primary)' }} />
                <span>Detected Visual Anchors ({visionFeed.detectedBoxes.length})</span>
              </div>
            </div>

            <div className="detections-list">
              {visionFeed.detectedBoxes.map((box) => (
                <div key={box.id} className="detection-item">
                  <div className="detection-color-dot" style={{ backgroundColor: box.color || 'var(--brand-primary)' }} />
                  <div className="detection-info">
                    <span className="detection-label">{box.label}</span>
                    <span className="detection-sub">Mapped in active canvas</span>
                  </div>
                  <span className="detection-badge">Active</span>
                </div>
              ))}
            </div>

            {/* OCR Snippets */}
            <div className="mira-card-header" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div className="mira-card-title" style={{ fontSize: '13px' }}>
                <FileSearch size={15} style={{ color: '#0284c7' }} />
                <span>Extracted Text Snippets</span>
              </div>
            </div>

            <div className="ocr-snippets-list">
              {visionFeed.ocrSnippets.map((ocr) => (
                <div key={ocr.id} className="ocr-snippet-pill">
                  <span className="ocr-text">"{ocr.text}"</span>
                  <span className="ocr-loc">{ocr.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
