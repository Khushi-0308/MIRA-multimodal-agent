import React, { useState, useEffect } from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface MiraLoadingSplashProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

const LOADING_STEPS = [
  { pct: 20, message: 'Initializing MIRA Neural Core...' },
  { pct: 45, message: 'Loading MIRA World & Ambient Atmospheres...' },
  { pct: 70, message: 'Synthesizing ContextCore Working Memory...' },
  { pct: 90, message: 'Connecting Voice & Vision Perception...' },
  { pct: 100, message: 'Welcome to MIRA ✨ Ready to explore!' },
];

export const MiraLoadingSplash: React.FC<MiraLoadingSplashProps> = ({
  onComplete,
  minDurationMs = 1200,
}) => {
  const { theme, mascotAccessory, playWorldSound } = useMira();
  const [progress, setProgress] = useState(15);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const stepTime = minDurationMs / LOADING_STEPS.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current < LOADING_STEPS.length) {
        setStepIndex(current);
        setProgress(LOADING_STEPS[current].pct);
      } else {
        clearInterval(interval);
        setProgress(100);
        playWorldSound('sparkle');

        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDismissed(true);
            onComplete?.();
          }, 450);
        }, 350);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete, playWorldSound]);

  if (isDismissed) {
    return null;
  }

  const currentStep = LOADING_STEPS[stepIndex] || LOADING_STEPS[0];

  return (
    <div
      className={`mira-loading-splash-backdrop theme-${theme} ${isFadingOut ? 'fade-out' : ''}`}
      role="alert"
      aria-busy="true"
    >
      <div className="splash-content-box">
        {/* Animated Mascot Hero */}
        <div className="splash-avatar-wrapper">
          <div className="splash-halo-glow" />
          <MiraAvatar
            size={110}
            state={progress >= 100 ? 'completed' : 'thinking'}
            theme={theme}
            accessory={mascotAccessory}
            interactive={false}
          />
        </div>

        {/* Brand Title */}
        <div className="splash-brand-group">
          <div className="splash-badge">
            <Sparkles size={13} />
            <span>Real-Time Multimodal Companion</span>
          </div>
          <h1 className="splash-title">MIRA</h1>
          <p className="splash-subtitle">AI Build Challenge 2026 PS-05</p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="splash-progress-section">
          <div className="splash-progress-track">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="splash-status-row">
            <span className="splash-status-text font-mono">
              {progress >= 100 ? (
                <CheckCircle2 size={13} style={{ color: '#10b981', display: 'inline', marginRight: 4 }} />
              ) : (
                <Zap size={13} style={{ color: 'var(--brand-primary)', display: 'inline', marginRight: 4 }} />
              )}
              {currentStep.message}
            </span>
            <span className="splash-pct font-mono">{progress}%</span>
          </div>
        </div>

        {/* Security & Reliability Badge */}
        <div className="splash-footer-badge">
          <ShieldCheck size={13} style={{ color: '#10b981' }} />
          <span>Local Context & Safety Gates Active</span>
        </div>
      </div>
    </div>
  );
};
