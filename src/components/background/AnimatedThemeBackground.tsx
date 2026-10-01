import React from 'react';
import { useMira } from '../../context/MiraContext';

export const AnimatedThemeBackground: React.FC = () => {
  const { theme } = useMira();

  return (
    <div className={`theme-animated-bg theme-bg-${theme}`} aria-hidden="true">
      {/* 1. Liquid Rose: Floating organic blush petals with gentle sway & rotation */}
      {theme === 'liquid-rose' && (
        <div className="bg-particles-container rose-theme-container">
          <div className="rose-ambient-glow glow-top" />
          <div className="rose-ambient-glow glow-bottom" />
          <div className="rose-petal petal-1" />
          <div className="rose-petal petal-2" />
          <div className="rose-petal petal-3" />
          <div className="rose-petal petal-4" />
          <div className="rose-petal petal-5" />
          <div className="rose-petal petal-6" />
          <div className="rose-petal petal-7" />
          <div className="rose-petal petal-8" />
        </div>
      )}

      {/* 2. Midnight: Twinkling stars, subtle cosmic particles & slow orbit glow */}
      {theme === 'midnight' && (
        <div className="bg-particles-container midnight-theme-container">
          <div className="midnight-orbit-glow orbit-1" />
          <div className="midnight-orbit-glow orbit-2" />
          <div className="midnight-star star-1" />
          <div className="midnight-star star-2" />
          <div className="midnight-star star-3" />
          <div className="midnight-star star-4" />
          <div className="midnight-star star-5" />
          <div className="midnight-star star-6" />
          <div className="midnight-star star-7" />
          <div className="midnight-star star-8" />
          <div className="midnight-star star-9" />
          <div className="midnight-star star-10" />
          <div className="midnight-cosmic-cross cross-1">✦</div>
          <div className="midnight-cosmic-cross cross-2">✧</div>
          <div className="midnight-cosmic-cross cross-3">✦</div>
          <div className="midnight-stardust dust-1" />
          <div className="midnight-stardust dust-2" />
          <div className="midnight-stardust dust-3" />
        </div>
      )}

      {/* 3. Glitter: Y2K pearlescent sparkles and soft shimmering light */}
      {theme === 'glitter' && (
        <div className="bg-particles-container glitter-theme-container">
          <div className="glitter-shimmer-sweep" />
          <div className="glitter-ambient-spot spot-1" />
          <div className="glitter-ambient-spot spot-2" />
          <div className="glitter-sparkle sparkle-1">✦</div>
          <div className="glitter-sparkle sparkle-2">✧</div>
          <div className="glitter-sparkle sparkle-3">✦</div>
          <div className="glitter-sparkle sparkle-4">✧</div>
          <div className="glitter-sparkle sparkle-5">✦</div>
          <div className="glitter-sparkle sparkle-6">✧</div>
          <div className="glitter-sparkle sparkle-7">✦</div>
        </div>
      )}

      {/* 4. Bold: Slow Memphis-style geometric shapes, crosses and dotted patterns */}
      {theme === 'bold' && (
        <div className="bg-particles-container bold-theme-container">
          <div className="bold-dot-matrix" />
          <div className="bold-shape memphis-circle-dashed" />
          <div className="bold-shape memphis-ring" />
          <div className="bold-shape memphis-square" />
          <div className="bold-shape memphis-cross cross-a">
            <span className="cross-bar-h" />
            <span className="cross-bar-v" />
          </div>
          <div className="bold-shape memphis-cross cross-b">
            <span className="cross-bar-h" />
            <span className="cross-bar-v" />
          </div>
          <svg className="bold-shape memphis-squiggle squiggle-1" viewBox="0 0 80 24" fill="none">
            <path d="M4 12 Q20 2 36 12 T68 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <svg className="bold-shape memphis-squiggle squiggle-2" viewBox="0 0 80 24" fill="none">
            <path d="M4 12 Q20 2 36 12 T68 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* 5. Edge: Subtle cyberpunk HUD grid, scan lines and tactical corner markers */}
      {theme === 'edge' && (
        <div className="bg-particles-container edge-theme-container">
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
            <span className="reticle-label">HUD // MIRA.V3</span>
          </div>
          <div className="edge-tactical-reticle reticle-2">
            <span className="reticle-label">SEC.GRID // 44.12</span>
          </div>
        </div>
      )}
    </div>
  );
};
