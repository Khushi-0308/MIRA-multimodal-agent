import React, { useState } from 'react';
import { AgentState, MiraThemeId, MascotAccessory, MascotAura } from '../../types/agent';

interface MiraAvatarProps {
  state?: AgentState;
  size?: number;
  theme?: MiraThemeId;
  accessory?: MascotAccessory;
  aura?: MascotAura;
  interactive?: boolean;
  showBadge?: boolean;
}

export const MiraAvatar: React.FC<MiraAvatarProps> = ({
  state = 'idle',
  size = 64,
  theme = 'liquid-rose',
  accessory = 'bunny-ears',
  aura,
  interactive = true,
  showBadge = false,
}) => {
  const [isWaving, setIsWaving] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 900);
  };

  // Color schemes for cloud-companion based on theme
  const getAvatarColors = () => {
    switch (theme) {
      case 'midnight':
        return {
          bodyGrad1: '#8b5cf6',
          bodyGrad2: '#ff5470',
          eyeColor: '#ffffff',
          blush: '#ff8906',
          accessory: '#a78bfa',
          sparkle: '#2cb67d',
          armColor: '#171527',
          shadow: 'rgba(255, 84, 112, 0.35)',
        };
      case 'glitter':
        return {
          bodyGrad1: '#f472b6',
          bodyGrad2: '#c084fc',
          eyeColor: '#3b0764',
          blush: '#ec4899',
          accessory: '#c084fc',
          sparkle: '#38bdf8',
          armColor: '#3b0764',
          shadow: 'rgba(192, 132, 252, 0.3)',
        };
      case 'bold':
        return {
          bodyGrad1: '#fb923c',
          bodyGrad2: '#f43f5e',
          eyeColor: '#18181b',
          blush: '#f97316',
          accessory: '#84cc16',
          sparkle: '#facc15',
          armColor: '#18181b',
          shadow: 'rgba(24, 24, 27, 0.25)',
        };
      case 'edge':
        return {
          bodyGrad1: '#a1a1aa',
          bodyGrad2: '#3f3f46',
          eyeColor: '#bef264',
          blush: '#71717a',
          accessory: '#bef264',
          sparkle: '#22d3ee',
          armColor: '#09090b',
          shadow: 'rgba(190, 242, 100, 0.25)',
        };
      case 'liquid-rose':
      default:
        return {
          bodyGrad1: '#f472b6',
          bodyGrad2: '#fb7185',
          eyeColor: '#3b072b',
          blush: '#fda4af',
          accessory: '#818cf8',
          sparkle: '#fde047',
          armColor: '#4a152d',
          shadow: 'rgba(244, 63, 94, 0.25)',
        };
    }
  };

  const colors = getAvatarColors();

  const getMotionClass = () => {
    if (isWaving) return 'mira-anim-bounce';
    switch (state) {
      case 'idle':
        return 'mira-anim-float';
      case 'listening':
        return 'mira-anim-listening';
      case 'observing':
        return 'mira-anim-observing';
      case 'thinking':
      case 'processing':
      case 'planning':
        return 'mira-anim-thinking';
      case 'speaking':
        return 'mira-anim-speaking';
      case 'waiting for approval':
        return 'mira-anim-waiting';
      case 'executing':
        return 'mira-anim-executing';
      case 'verifying':
        return 'mira-anim-verifying';
      case 'completed':
        return 'mira-anim-completed';
      case 'error':
        return 'mira-anim-error';
      default:
        return 'mira-anim-float';
    }
  };

  return (
    <div
      className={`mira-mascot-wrapper ${getMotionClass()}`}
      style={{
        width: size,
        height: size,
        cursor: interactive ? 'pointer' : 'default',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      onClick={handleClick}
      title={`MIRA: ${state} (Click to giggle!)`}
    >
      {/* Mascot Aura Visual Glow Effects */}
      {aura === 'neon-glow' && (
        <div className="mascot-aura-neon" aria-hidden="true" />
      )}
      {aura === 'celestial-halo' && (
        <div className="mascot-aura-celestial" aria-hidden="true" />
      )}
      {aura === 'pastel-mist' && (
        <div className="mascot-aura-pastel" aria-hidden="true" />
      )}
      {aura === 'pulse-wave' && (
        <div className="mascot-aura-pulse" aria-hidden="true" />
      )}

      <svg
        viewBox="0 0 120 110"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`miraCloudGrad-${theme}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.bodyGrad1} />
            <stop offset="100%" stopColor={colors.bodyGrad2} />
          </linearGradient>
          <linearGradient id="visorShimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* --- SOUND RADAR WAVES (LISTENING) --- */}
        {state === 'listening' && (
          <g opacity="0.8">
            <path d="M 8 40 Q 0 55 8 70" fill="none" stroke={colors.bodyGrad1} strokeWidth="3" strokeLinecap="round" className="mira-pulse-wave" />
            <path d="M 112 40 Q 120 55 112 70" fill="none" stroke={colors.bodyGrad1} strokeWidth="3" strokeLinecap="round" className="mira-pulse-wave" />
          </g>
        )}

        {/* --- ACCESSORIES --- */}
        {accessory === 'bunny-ears' && (
          <g className="mira-ears">
            <path d="M 36 32 C 26 8, 34 0, 44 20 Z" fill={colors.bodyGrad1} />
            <path d="M 38 27 C 32 12, 36 6, 42 19 Z" fill="#ffffff" opacity="0.45" />
            <path d="M 84 32 C 94 8, 86 0, 76 20 Z" fill={colors.bodyGrad2} />
            <path d="M 82 27 C 88 12, 84 6, 78 19 Z" fill="#ffffff" opacity="0.45" />
          </g>
        )}

        {accessory === 'cyber-headphones' && (
          <g className="mira-headphones">
            <path d="M 22 50 A 38 38 0 0 1 98 50" fill="none" stroke={colors.accessory} strokeWidth="6" strokeLinecap="round" />
            <rect x="14" y="46" width="12" height="24" rx="6" fill={colors.accessory} />
            <circle cx="20" cy="58" r="3" fill="#ffffff" />
            <rect x="94" y="46" width="12" height="24" rx="6" fill={colors.accessory} />
            <circle cx="100" cy="58" r="3" fill="#ffffff" />
          </g>
        )}

        {accessory === 'star-clip' && (
          <g transform="translate(86, 18) scale(0.75)">
            <polygon points="10,1 4,19 19,7 1,7 16,19" fill={colors.sparkle} />
          </g>
        )}

        {/* --- MAIN ADORABLE JELLY-CLOUD BODY --- */}
        <path
          d="M 32 38 
             C 18 36, 12 55, 20 68 
             C 14 78, 24 94, 40 92 
             C 48 98, 72 98, 80 92 
             C 96 94, 106 78, 100 68 
             C 108 55, 102 36, 88 38 
             C 80 26, 40 26, 32 38 Z"
          fill={`url(#miraCloudGrad-${theme})`}
          style={{ filter: `drop-shadow(0px 8px 18px ${colors.shadow})` }}
        />

        {/* Highlight sheen for organic jelly texture */}
        <ellipse cx="46" cy="38" rx="16" ry="6" fill="#ffffff" opacity="0.35" />

        {/* Hologram Visor Accessory */}
        {accessory === 'hologram-visor' && (
          <rect
            x="32"
            y="48"
            width="56"
            height="18"
            rx="9"
            fill="url(#visorShimmer)"
            opacity="0.85"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        )}

        {/* --- CUTE ARMS --- */}
        {/* Left Arm */}
        <path
          d="M 18 64 C 8 68, 6 78, 12 82"
          fill="none"
          stroke={colors.armColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Right Arm: Waving if happy/idle/completed */}
        {state === 'completed' || state === 'idle' || isWaving ? (
          <path
            d="M 102 62 C 112 56, 116 44, 110 40"
            fill="none"
            stroke={colors.armColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 102 64 C 112 68, 114 78, 108 82"
            fill="none"
            stroke={colors.armColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )}

        {/* --- DYNAMIC EYES & EXPRESSIONS --- */}
        {/* 1. Idle: cute shiny smiling eyes */}
        {state === 'idle' && (
          <g>
            <circle cx="48" cy="58" r="4.2" fill={colors.eyeColor} />
            <circle cx="50" cy="56" r="1.5" fill="#ffffff" />
            <circle cx="72" cy="58" r="4.2" fill={colors.eyeColor} />
            <circle cx="74" cy="56" r="1.5" fill="#ffffff" />
            <path d="M 56 65 Q 60 70 64 65" fill="none" stroke={colors.eyeColor} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}

        {/* 2. Listening: alert wide eyes + round mouth */}
        {state === 'listening' && (
          <g>
            <circle cx="48" cy="58" r="5.2" fill={colors.eyeColor} />
            <circle cx="50" cy="56" r="1.8" fill="#ffffff" />
            <circle cx="72" cy="58" r="5.2" fill={colors.eyeColor} />
            <circle cx="74" cy="56" r="1.8" fill="#ffffff" />
            <ellipse cx="60" cy="67" rx="3" ry="4" fill={colors.eyeColor} />
          </g>
        )}

        {/* 3. Observing: focused scanning eyes */}
        {state === 'observing' && (
          <g>
            <circle cx="48" cy="58" r="5" fill="none" stroke={colors.sparkle} strokeWidth="1.8" />
            <circle cx="48" cy="58" r="2.5" fill={colors.eyeColor} />
            <circle cx="72" cy="58" r="5" fill="none" stroke={colors.sparkle} strokeWidth="1.8" />
            <circle cx="72" cy="58" r="2.5" fill={colors.eyeColor} />
            <path d="M 57 66 L 63 66" stroke={colors.eyeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* 4. Thinking / Processing: curious upward gaze + floating thought sparkle */}
        {(state === 'thinking' || state === 'processing' || state === 'planning') && (
          <g>
            <circle cx="50" cy="54" r="4.5" fill={colors.eyeColor} />
            <circle cx="52" cy="52" r="1.5" fill="#ffffff" />
            <circle cx="74" cy="54" r="4.5" fill={colors.eyeColor} />
            <circle cx="76" cy="52" r="1.5" fill="#ffffff" />
            <path d="M 57 66 Q 60 63 63 66" fill="none" stroke={colors.eyeColor} strokeWidth="2" strokeLinecap="round" />
            {/* Thought galaxy stars */}
            <circle cx="86" cy="22" r="3" fill={colors.sparkle} className="mira-sparkle-spin" />
            <circle cx="94" cy="14" r="4.5" fill={colors.sparkle} className="mira-sparkle-spin" />
          </g>
        )}

        {/* 5. Speaking: mouth with animated talking waveform */}
        {state === 'speaking' && (
          <g>
            <path d="M 44 58 Q 48 53 52 58" fill="none" stroke={colors.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 68 58 Q 72 53 76 58" fill="none" stroke={colors.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 64 Q 60 74 65 64 Z" fill={colors.eyeColor} />
          </g>
        )}

        {/* 6. Waiting for Approval: sweet pleading eyes + caution badge */}
        {state === 'waiting for approval' && (
          <g>
            <circle cx="48" cy="57" r="5.5" fill={colors.eyeColor} />
            <circle cx="46" cy="55" r="2.2" fill="#ffffff" />
            <circle cx="72" cy="57" r="5.5" fill={colors.eyeColor} />
            <circle cx="70" cy="55" r="2.2" fill="#ffffff" />
            <path d="M 57 67 Q 60 64 63 67" fill="none" stroke={colors.eyeColor} strokeWidth="2" strokeLinecap="round" />
            {/* Caution shield tag */}
            <g transform="translate(86, 52) scale(0.6)">
              <polygon points="12,2 22,20 2,20" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text x="12" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">!</text>
            </g>
          </g>
        )}

        {/* 7. Executing: determined hero gaze */}
        {state === 'executing' && (
          <g>
            <path d="M 44 55 L 53 59" stroke={colors.eyeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 76 55 L 67 59" stroke={colors.eyeColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="49" cy="60" r="2.5" fill={colors.eyeColor} />
            <circle cx="71" cy="60" r="2.5" fill={colors.eyeColor} />
            <path d="M 56 68 L 64 68" stroke={colors.eyeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* 8. Verifying: checkmark overlay */}
        {state === 'verifying' && (
          <g>
            <circle cx="48" cy="58" r="4.2" fill={colors.eyeColor} />
            <circle cx="72" cy="58" r="4.2" fill={colors.eyeColor} />
            <path d="M 55 67 L 58 70 L 66 62" fill="none" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 9. Completed: star eyes celebrating! */}
        {state === 'completed' && (
          <g>
            <polygon points="48,51 50,56 55,56 51,59 53,64 48,61 43,64 45,59 41,56 46,56" fill={colors.sparkle} />
            <polygon points="72,51 74,56 79,56 75,59 77,64 72,61 67,64 69,59 65,56 70,56" fill={colors.sparkle} />
            <path d="M 54 66 Q 60 74 66 66" fill="none" stroke={colors.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* 10. Error: dizzy X eyes + sweatdrop */}
        {state === 'error' && (
          <g>
            <path d="M 45 55 L 51 61 M 51 55 L 45 61" stroke={colors.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 69 55 L 75 61 M 75 55 L 69 61" stroke={colors.eyeColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 56 67 Q 60 64 64 67" fill="none" stroke={colors.eyeColor} strokeWidth="2" strokeLinecap="round" />
            <path d="M 84 42 C 84 42 87 47 87 49 C 87 51 85.5 52.5 84 52.5 C 82.5 52.5 81 51 81 49 C 81 47 84 42 84 42 Z" fill="#38bdf8" />
          </g>
        )}

        {/* --- ROSY CHEEKS --- */}
        <ellipse cx="38" cy="65" rx="5" ry="3" fill={colors.blush} opacity="0.75" />
        <ellipse cx="82" cy="65" rx="5" ry="3" fill={colors.blush} opacity="0.75" />

        {/* --- FLOATING SPARKLE STAR --- */}
        <g transform="translate(98, 28) scale(0.55)">
          <polygon points="10,1 4,19 19,7 1,7 16,19" fill={colors.sparkle} />
        </g>
      </svg>

      {showBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            right: -6,
            background: 'var(--brand-primary)',
            color: 'white',
            borderRadius: '9999px',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            boxShadow: 'var(--shadow-sm)',
            border: '2px solid white',
          }}
        >
          {state}
        </div>
      )}
    </div>
  );
};
