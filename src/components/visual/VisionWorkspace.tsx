import React, { useRef, useState, useEffect } from 'react';
import { useMira } from '../../context/MiraContext';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Eye,
  Camera,
  Monitor,
  Upload,
  Maximize2,
  CameraOff,
} from 'lucide-react';

export const VisionWorkspace: React.FC = () => {
  const {
    visionFeed,
    setVisionSource,
    agentState,
    theme,
    devMode,
    addDocument,
  } = useMira();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);

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
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      addDocument(file);
      setVisionSource('synthetic_test');
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className="mira-card vision-workspace-card">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,.pdf"
        onChange={handleUploadImage}
      />

      {/* Header */}
      <div className="mira-card-header">
        <div className="mira-card-title">
          <div className="icon-circle-badge">
            <Eye size={15} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <span>What MIRA Sees</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 6 }}>
              Camera / Screen / Upload
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {streamActive && (
            <button className="mira-btn mira-btn-sm mira-btn-danger" onClick={stopStream}>
              <CameraOff size={12} />
              <span>Stop</span>
            </button>
          )}
          <button className="mira-btn mira-btn-icon" title="Expand View">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div className="vision-stage-container">
        {streamActive ? (
          <div className="vision-active-video-box">
            <video ref={videoRef} className="vision-video" autoPlay playsInline muted />
            <BoundingBoxOverlay boxes={visionFeed.detectedBoxes} />
          </div>
        ) : (
          /* Dreamy Pastel Placeholder matching reference */
          <div className="vision-pastel-canvas">
            <div className="vision-dashed-box" onClick={() => fileInputRef.current?.click()}>
              <div className="vision-dashed-icon-circle">
                <Camera size={22} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div className="vision-dashed-title">
                Your view will appear here
              </div>
              <p className="vision-dashed-sub">
                Start camera, share your screen or upload a file
              </p>
            </div>

            {/* Peeking Cute Mascot Decor */}
            <div className="vision-peeking-mascot">
              <MiraAvatar size={58} state={agentState} theme={theme} interactive={true} />
            </div>
          </div>
        )}

        {/* Developer Mode HUD overlay */}
        {devMode && (
          <div className="vision-dev-hud">
            <span className="mira-badge mira-badge-mono" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
              ViT-L/14 • {visionFeed.currentFps} FPS • {visionFeed.resolution}
            </span>
          </div>
        )}
      </div>

      {/* Bottom 3 Big Cute Button Pills from Reference */}
      <div className="vision-action-pills-row">
        <button
          className={`vision-pill-action-btn ${visionFeed.sourceType === 'camera' && streamActive ? 'active' : ''}`}
          onClick={() => startMediaStream('camera')}
        >
          <Camera size={16} />
          <span>Camera</span>
        </button>

        <button
          className={`vision-pill-action-btn ${visionFeed.sourceType === 'screen' && streamActive ? 'active' : ''}`}
          onClick={() => startMediaStream('screen')}
        >
          <Monitor size={16} />
          <span>Screen</span>
        </button>

        <button
          className="vision-pill-action-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>
      </div>
    </div>
  );
};
