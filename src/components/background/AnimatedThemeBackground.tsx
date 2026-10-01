import React from 'react';
import { useMira } from '../../context/MiraContext';

export const AnimatedThemeBackground: React.FC = () => {
  const { theme, worldSettings } = useMira();
  const { atmosphere, particle, intensity, reducedMotion } = worldSettings;

  return (
    <div
      className={`theme-animated-bg theme-bg-${theme} atmosphere-${atmosphere} anim-intensity-${intensity} ${reducedMotion ? 'reduced-motion' : ''}`}
      aria-hidden="true"
    >
      {/* =========================================================================
          1. ATMOSPHERE BACKGROUND LAYERS
          ========================================================================= */}
      
      {/* A. Blossom Breeze Atmosphere */}
      {atmosphere === 'blossom-breeze' && (
        <div className="atmosphere-layer blossom-breeze-layer">
          <div className="rose-ambient-glow glow-top" />
          <div className="rose-ambient-glow glow-bottom" />
          <div className="ambient-blossom-ray ray-1" />
          <div className="ambient-blossom-ray ray-2" />
        </div>
      )}

      {/* B. Deep Nebula Atmosphere */}
      {atmosphere === 'deep-nebula' && (
        <div className="atmosphere-layer deep-nebula-layer">
          <div className="midnight-orbit-glow orbit-1" />
          <div className="midnight-orbit-glow orbit-2" />
          <div className="nebula-cloud cloud-1" />
          <div className="nebula-cloud cloud-2" />
        </div>
      )}

      {/* C. Aurora Dream Atmosphere */}
      {atmosphere === 'aurora-dream' && (
        <div className="atmosphere-layer aurora-dream-layer">
          <div className="glitter-shimmer-sweep" />
          <div className="glitter-ambient-spot spot-1" />
          <div className="glitter-ambient-spot spot-2" />
          <div className="aurora-curtain curtain-1" />
          <div className="aurora-curtain curtain-2" />
        </div>
      )}

      {/* D. Cyber Grid Atmosphere */}
      {atmosphere === 'cyber-grid' && (
        <div className="atmosphere-layer cyber-grid-layer">
          <div className="cyber-perspective-grid" />
          <div className="cyber-horizon-glow" />
          <div className="bold-dot-matrix" />
        </div>
      )}

      {/* E. Retro Scanlines Atmosphere */}
      {atmosphere === 'retro-scanlines' && (
        <div className="atmosphere-layer retro-scanlines-layer">
          <div className="edge-hud-grid" />
          <div className="edge-scan-line" />
          <div className="edge-tactical-corner corner-top-left">┌</div>
          <div className="edge-tactical-corner corner-top-right">┐</div>
          <div className="edge-tactical-corner corner-bottom-left">└</div>
          <div className="edge-tactical-corner corner-bottom-right">┘</div>
          <div className="edge-tactical-reticle reticle-1">
            <span className="reticle-bracket">[</span>
            <span className="reticle-cross">+</span>
            <span className="reticle-bracket">]</span>
            <span className="reticle-label">WORLD // MIRA.V3</span>
          </div>
          <div className="edge-tactical-reticle reticle-2">
            <span className="reticle-label">SEC.GRID // 44.12</span>
          </div>
        </div>
      )}

      {/* F. Minimal Zen Atmosphere */}
      {atmosphere === 'minimal-zen' && (
        <div className="atmosphere-layer minimal-zen-layer">
          <div className="zen-radial-glow glow-center" />
          <div className="zen-subtle-wave wave-1" />
        </div>
      )}

      {/* =========================================================================
          2. PARTICLE & EFFECT LAYERS (Customizable & Independent)
          ========================================================================= */}
      
      {!reducedMotion && particle !== 'none' && (
        <div className="particles-stage-container">
          {/* Petals / Confetti */}
          {particle === 'petals-confetti' && (
            <div className="particle-layer petals-layer">
              <div className="rose-petal petal-1" />
              <div className="rose-petal petal-2" />
              <div className="rose-petal petal-3" />
              <div className="rose-petal petal-4" />
              <div className="rose-petal petal-5" />
              <div className="rose-petal petal-6" />
              <div className="rose-petal petal-7" />
              <div className="rose-petal petal-8" />
              <div className="bold-shape memphis-circle-dashed" style={{ opacity: 0.2 }} />
            </div>
          )}

          {/* Stardust Sparkles */}
          {particle === 'stardust-sparkles' && (
            <div className="particle-layer stardust-layer">
              <div className="midnight-star star-1" />
              <div className="midnight-star star-2" />
              <div className="midnight-star star-3" />
              <div className="midnight-star star-4" />
              <div className="midnight-star star-5" />
              <div className="midnight-star star-6" />
              <div className="midnight-star star-7" />
              <div className="midnight-star star-8" />
              <div className="midnight-cosmic-cross cross-1">✦</div>
              <div className="midnight-cosmic-cross cross-2">✧</div>
              <div className="midnight-cosmic-cross cross-3">✦</div>
              <div className="glitter-sparkle sparkle-1">✦</div>
              <div className="glitter-sparkle sparkle-2">✧</div>
              <div className="glitter-sparkle sparkle-3">✦</div>
            </div>
          )}

          {/* Floating Orbs */}
          {particle === 'floating-orbs' && (
            <div className="particle-layer orbs-layer">
              <div className="floating-orb orb-1" />
              <div className="floating-orb orb-2" />
              <div className="floating-orb orb-3" />
              <div className="floating-orb orb-4" />
              <div className="floating-orb orb-5" />
            </div>
          )}

          {/* Digital Matrix Rain */}
          {particle === 'matrix-rain' && (
            <div className="particle-layer matrix-rain-layer">
              <div className="matrix-streak streak-1" />
              <div className="matrix-streak streak-2" />
              <div className="matrix-streak streak-3" />
              <div className="matrix-streak streak-4" />
              <div className="matrix-streak streak-5" />
              <div className="matrix-streak streak-6" />
              <div className="bold-shape memphis-cross cross-a" />
              <div className="bold-shape memphis-cross cross-b" />
            </div>
          )}

          {/* Constellations */}
          {particle === 'constellations' && (
            <div className="particle-layer constellations-layer">
              <svg className="constellation-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                <circle cx="150" cy="120" r="3" className="const-node" />
                <circle cx="320" cy="80" r="2.5" className="const-node" />
                <circle cx="480" cy="180" r="3.5" className="const-node" />
                <circle cx="700" cy="130" r="2.5" className="const-node" />
                <circle cx="850" cy="220" r="3" className="const-node" />
                <circle cx="260" cy="340" r="3" className="const-node" />
                <circle cx="620" cy="420" r="2.5" className="const-node" />
                <circle cx="820" cy="480" r="3" className="const-node" />

                <line x1="150" y1="120" x2="320" y2="80" className="const-line" />
                <line x1="320" y1="80" x2="480" y2="180" className="const-line" />
                <line x1="480" y1="180" x2="700" y2="130" className="const-line" />
                <line x1="700" y1="130" x2="850" y2="220" className="const-line" />
                <line x1="150" y1="120" x2="260" y2="340" className="const-line" />
                <line x1="480" y1="180" x2="620" y2="420" className="const-line" />
                <line x1="620" y1="420" x2="820" y2="480" className="const-line" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
