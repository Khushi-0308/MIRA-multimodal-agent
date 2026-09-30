import React from 'react';
import { useMira } from '../../context/MiraContext';

export const AnimatedThemeBackground: React.FC = () => {
  const { theme } = useMira();

  return (
    <div className={`theme-animated-bg theme-bg-${theme}`} aria-hidden="true">
      {/* Liquid Rose: Floating organic blush petals */}
      {theme === 'liquid-rose' && (
        <div className="bg-particles-container">
          <div className="rose-petal petal-1" />
          <div className="rose-petal petal-2" />
          <div className="rose-petal petal-3" />
          <div className="rose-petal petal-4" />
          <div className="rose-petal petal-5" />
          <div className="rose-petal petal-6" />
        </div>
      )}

      {/* Midnight: Slow glowing stars & orbit dust */}
      {theme === 'midnight' && (
        <div className="bg-particles-container">
          <div className="midnight-star star-1" />
          <div className="midnight-star star-2" />
          <div className="midnight-star star-3" />
          <div className="midnight-star star-4" />
          <div className="midnight-star star-5" />
          <div className="midnight-star star-6" />
        </div>
      )}

      {/* Glitter: Y2K twinkle sparkle diamonds */}
      {theme === 'glitter' && (
        <div className="bg-particles-container">
          <div className="glitter-sparkle sparkle-1">✦</div>
          <div className="glitter-sparkle sparkle-2">✧</div>
          <div className="glitter-sparkle sparkle-3">✦</div>
          <div className="glitter-sparkle sparkle-4">✧</div>
          <div className="glitter-sparkle sparkle-5">✦</div>
        </div>
      )}

      {/* Bold: Pop-art geometric circles & squares */}
      {theme === 'bold' && (
        <div className="bg-particles-container">
          <div className="bold-shape shape-1" />
          <div className="bold-shape shape-2" />
          <div className="bold-shape shape-3" />
          <div className="bold-shape shape-4" />
        </div>
      )}

      {/* Edge: Clean technical grid & minimal pulse line */}
      {theme === 'edge' && (
        <div className="bg-particles-container">
          <div className="edge-scan-line" />
        </div>
      )}
    </div>
  );
};
