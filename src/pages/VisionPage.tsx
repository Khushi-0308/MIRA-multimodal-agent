import React, { useRef, useState, useEffect } from 'react';
import { useMira } from '../context/MiraContext';
import { BoundingBoxOverlay } from '../components/visual/BoundingBoxOverlay';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import { apiClient, wsClient } from '../services';
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
    setLoopStage,
    theme,
    mascotAccessory,
    devMode,
    addDocument,
    captureSnapshot,
    addAnchor,
    addBoundingBox,
    clearBoundingBoxes,
  } = useMira();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<'boxes' | 'ocr' | 'all'>('all');
  const [observationText, setObservationText] = useState<string>('');
  const sessionIdRef = useRef<string>(`mira-vision-${Date.now().toString(36)}`);

  // Connect to Phase 3 WebSocket on mount and synchronize session
  useEffect(() => {
    const sessionId = sessionIdRef.current;
    wsClient.connect(sessionId).catch((err) => {
      console.warn('[VisionPage] WebSocket initial connect:', err);
    });

    const unsubscribe = wsClient.onMessage((payload) => {
      if (payload.type === 'vision_scan' || (payload.echo && (payload.echo as Record<string, unknown>).type === 'vision_scan')) {
        const reply = payload.response || payload.message;
        if (reply) {
          setObservationText(reply);
        }
      }
    });

    return () => {
      unsubscribe();
      wsClient.disconnect();
    };
  }, []);

  const captureFrameBase64 = (): string => {
    if (uploadedImageBase64) return uploadedImageBase64;
    if (videoRef.current && streamActive) {
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(1280, video.videoWidth);
        canvas.height = Math.min(720, video.videoHeight);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.85);
        }
      }
    }
    // High-res synthetic workspace frame if no video or upload is active
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('MIRA Multimodal Vision Workspace', 80, 120);
      ctx.fillStyle = '#a78bfa';
      ctx.font = '22px sans-serif';
      ctx.fillText('Visual Grounding Target: Design System Notes & UI Canvas', 80, 180);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(80, 220, 360, 240);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('OCR Document Block #1', 110, 280);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(480, 220, 420, 240);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillText('UI Component Canvas #2', 510, 280);
      return canvas.toDataURL('image/jpeg', 0.85);
    }
    return '';
  };

  const startMediaStream = async (type: 'camera' | 'screen') => {
    setUploadedImageBase64(null);
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
        setLoopStage('SEES');

        // Notify backend ContextCore of active stream
        apiClient.saveContext({
          session_id: sessionIdRef.current,
          modalities: {
            vision: {
              source: type,
              status: 'active',
              resolution: visionFeed.resolution,
              updated_at: new Date().toISOString(),
            },
          },
        }).catch((err) => console.warn('[VisionPage] Context save error:', err));
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
    setUploadedImageBase64(null);
    setVisionSource('synthetic_test');
    setAgentState('idle');
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setUploadedImageBase64(b64);
        setStreamActive(false);
        setVisionSource('upload' as any);
        setAgentState('observing');
        setLoopStage('SEES');
        setObservationText(`Uploaded image "${file.name}". Click "Scan Scene" to analyze with Gemini Multimodal Vision.`);
      };
      reader.readAsDataURL(file);
      addDocument(file);
    }
  };

  const handleTriggerAnalysis = async () => {
    const frameB64 = captureFrameBase64();
    if (!frameB64) {
      setObservationText('Please start camera, share screen, or upload an image first.');
      return;
    }

    setAgentState('observing');
    setLoopStage('SEES');
    captureSnapshot();
    setObservationText('Analyzing real visual pixels with Gemini Multimodal Vision...');

    try {
      setLoopStage('UNDERSTANDS');
      const response = await apiClient.analyzeVision(
        frameB64,
        'image/jpeg',
        'Analyze this screen/camera visual frame in detail. Extract detected UI objects and visible text.',
        sessionIdRef.current
      );

      setLoopStage('REASONS');
      setObservationText(response.description);

      // Inject real detected boxes from Gemini
      clearBoundingBoxes();
      if (response.detected_objects && response.detected_objects.length > 0) {
        response.detected_objects.forEach((obj, idx) => {
          addBoundingBox({
            id: obj.id || `box-${idx + 1}`,
            label: obj.label,
            confidence: obj.confidence || 95,
            box: obj.box || [10, 10, 80, 80],
            category: (obj.category as any) || 'ui_element',
            color: idx % 2 === 0 ? '#f43f5e' : '#a855f7',
          });
        });
      }

      addAnchor({
        modality: 'vision',
        title: `Visual Grounding (${visionFeed.sourceType})`,
        source: `Vision Sensor (${visionFeed.resolution})`,
        summary: response.description.slice(0, 140),
        tokenWeight: 350,
        isPinned: false,
      });

      setLoopStage('VERIFIES');
      setTimeout(() => {
        setAgentState(streamActive || uploadedImageBase64 ? 'observing' : 'idle');
      }, 2000);
    } catch (err) {
      console.error('[VisionPage] Scan analysis error:', err);
      setObservationText(`Vision analysis error: ${(err as Error).message}`);
      setAgentState('error');
      setTimeout(() => {
        setAgentState(streamActive ? 'observing' : 'idle');
      }, 2500);
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const formatObservationText = (text: string) => {
    if (!text) return '';
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => item.label || JSON.stringify(item)).join(' • ');
      }
    } catch {
      // plain text fallback
    }
    return cleaned;
  };

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
            ) : uploadedImageBase64 ? (
              <div className="vision-live-screen" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={uploadedImageBase64}
                  alt="Uploaded Frame"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                />
                {(selectedOverlay === 'boxes' || selectedOverlay === 'all') && (
                  <BoundingBoxOverlay boxes={visionFeed.detectedBoxes} />
                )}
              </div>
            ) : (
              <div className="vision-empty-canvas" onClick={() => fileInputRef.current?.click()}>
                <div className="vision-canvas-inner">
                  <div style={{ marginBottom: 14 }}>
                    <MiraAvatar size={68} state="idle" theme={theme} accessory={mascotAccessory} interactive={false} />
                  </div>
                  <h3 className="empty-canvas-title">No vision input yet</h3>
                  <p className="empty-canvas-sub">
                    Show me something! Share your screen, turn on camera, or upload an image to let MIRA perceive in real-time.
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
                {formatObservationText(observationText) ||
                  (agentState === 'observing'
                    ? 'Analyzing visual frames and mapping detected objects into ContextCore.'
                    : 'Start a stream or upload an image to begin real-time observation.')}
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
