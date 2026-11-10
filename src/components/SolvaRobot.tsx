import React, { useState, useEffect } from 'react';
import { AssistantStatus } from '../types';

export interface SolvaRobotProps {
  status: AssistantStatus;
  size?: 'compact' | 'medium' | 'large';
  volume?: number; // 0 to 100 for live mic feedback
  className?: string;
  onClick?: () => void;
  showAura?: boolean;
  sparkle?: boolean;
}

export const SolvaRobot: React.FC<SolvaRobotProps> = ({
  status,
  size = 'medium',
  volume = 0,
  className = '',
  onClick,
  showAura = true,
  sparkle = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappyWink, setIsHappyWink] = useState(false);

  // Natural blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (status === 'thinking' || status === 'speaking') return;
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, [status]);

  const handleClick = () => {
    setIsHappyWink(true);
    setTimeout(() => setIsHappyWink(false), 900);
    onClick?.();
  };

  // Dimensions
  const dim = {
    compact: { w: 'w-10 h-10 sm:w-12 sm:h-12', svgW: 48, svgH: 48, aura: 'w-12 h-12 sm:w-14 sm:h-14' },
    medium: { w: 'w-28 h-32 sm:w-32 sm:h-36 md:w-36 md:h-40', svgW: 130, svgH: 146, aura: 'w-36 h-40 sm:w-40 sm:h-44' },
    large: { w: 'w-36 h-42 sm:w-48 sm:h-54 md:w-60 md:h-68', svgW: 240, svgH: 270, aura: 'w-44 h-50 sm:w-56 sm:h-64 md:w-72 md:h-80' },
  }[size];

  const isListening = status === 'listening';
  const isThinking = status === 'thinking' || status === 'transcribing';
  const isSpeaking = status === 'speaking';
  const isError = status === 'error';

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none group ${dim.w} ${className} ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      }`}
      aria-label={`SOLVA Mascot: ${status}`}
    >
      {/* Dynamic Ambient Aura Lighting */}
      {showAura && (
        <div
          className={`absolute rounded-full blur-2xl transition-all duration-700 pointer-events-none ${dim.aura} ${
            isListening
              ? 'bg-fuchsia-500/40 scale-125 animate-pulse'
              : isThinking
              ? 'bg-indigo-500/40 animate-spin duration-3000'
              : isSpeaking
              ? 'bg-purple-500/45 scale-110'
              : isError
              ? 'bg-rose-500/30'
              : 'bg-purple-500/25 group-hover:bg-purple-500/35'
          }`}
        />
      )}

      {/* SVG 3D-Style Robot Character */}
      <svg
        viewBox="0 0 130 140"
        className="w-full h-full relative z-10 drop-shadow-xl transition-transform duration-500 will-change-transform"
        style={{
          animation:
            isThinking
              ? 'solvaBobFast 2.2s ease-in-out infinite'
              : isSpeaking
              ? 'solvaBobHappy 1.8s ease-in-out infinite'
              : 'solvaFloat 4s ease-in-out infinite',
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="headDome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#EDE9FE" />
            <stop offset="85%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>

          <linearGradient id="visorGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1035" />
            <stop offset="60%" stopColor="#130924" />
            <stop offset="100%" stopColor="#0B0317" />
          </linearGradient>

          <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          <linearGradient id="eyeThinking" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E879F9" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="earPod" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="60%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>

          <linearGradient id="torsoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F3FF" />
            <stop offset="50%" stopColor="#EDE9FE" />
            <stop offset="100%" stopColor="#DDD6FE" />
          </linearGradient>

          <linearGradient id="crestGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F0ABFC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Filters */}
          <filter id="neonBloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Sparkle particles during entrance */}
        {sparkle && (
          <g className="animate-pulse">
            <path
              d="M 22 25 L 24 20 L 26 25 L 31 27 L 26 29 L 24 34 L 22 29 L 17 27 Z"
              fill="url(#sparkleGrad)"
              opacity="0.85"
            />
            <path
              d="M 104 22 L 105.5 18 L 107 22 L 111 23.5 L 107 25 L 105.5 29 L 104 25 L 100 23.5 Z"
              fill="url(#sparkleGrad)"
              opacity="0.9"
            />
            <path
              d="M 108 92 L 109 89 L 110 92 L 113 93 L 110 94 L 109 97 L 108 94 L 105 93 Z"
              fill="url(#sparkleGrad)"
              opacity="0.75"
            />
          </g>
        )}

        {/* Floating Ring halo */}
        <ellipse
          cx="60"
          cy="12"
          rx="26"
          ry="6"
          fill="none"
          stroke="url(#crestGlow)"
          strokeWidth="1.8"
          strokeDasharray={isThinking ? '6 4' : 'none'}
          className={isThinking ? 'animate-spin origin-center' : ''}
          filter="url(#neonBloom)"
          opacity="0.75"
        />

        {/* 1. Ear Audio Antenna Nodes */}
        <g>
          {/* Left Ear Antenna */}
          <path d="M 22 46 Q 16 38 18 30" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="30" r="3.5" fill="#38BDF8" filter="url(#neonBloom)" />

          {/* Right Ear Antenna */}
          <path d="M 98 46 Q 104 38 102 30" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="102" cy="30" r="3.5" fill="#C084FC" filter="url(#neonBloom)" />

          {/* Left Ear Pod */}
          <ellipse cx="22" cy="52" rx="5" ry="9" fill="url(#earPod)" />
          <ellipse cx="22" cy="52" rx="2.5" ry="5" fill="#38BDF8" filter="url(#neonBloom)" />

          {/* Right Ear Pod */}
          <ellipse cx="98" cy="52" rx="5" ry="9" fill="url(#earPod)" />
          <ellipse cx="98" cy="52" rx="2.5" ry="5" fill="#C084FC" filter="url(#neonBloom)" />
        </g>

        {/* 2. Head Dome (Curved porcelain shell) */}
        <path
          d="M 24 52 C 24 24, 96 24, 96 52 C 96 76, 24 76, 24 52 Z"
          fill="url(#headDome)"
          stroke="#C4B5FD"
          strokeWidth="1.5"
        />

        {/* Head Shell Top Highlight */}
        <path
          d="M 32 36 C 45 28, 75 28, 88 36 C 76 33, 44 33, 32 36 Z"
          fill="#FFFFFF"
          opacity="0.65"
        />

        {/* 3. Dark Obsidian Visor Screen */}
        <rect
          x="30"
          y="35"
          width="60"
          height="34"
          rx="14"
          fill="url(#visorGlass)"
          stroke="#4C1D95"
          strokeWidth="1.2"
        />

        {/* Visor internal soft glass sheen */}
        <path
          d="M 33 39 Q 60 37 87 39 Q 75 44 45 44 Z"
          fill="#FFFFFF"
          opacity="0.12"
        />

        {/* 4. Expressive Eyes & Facial Reactions */}
        {isBlinking ? (
          /* Blink State */
          <g stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round">
            <line x1="42" y1="52" x2="52" y2="52" />
            <line x1="68" y1="52" x2="78" y2="52" />
          </g>
        ) : isThinking ? (
          /* Thinking State: Orbiting / Scanning Eyes */
          <g>
            <circle cx="47" cy="51" r="5.5" fill="none" stroke="url(#eyeThinking)" strokeWidth="2" strokeDasharray="6 3" className="animate-spin" />
            <circle cx="73" cy="51" r="5.5" fill="none" stroke="url(#eyeThinking)" strokeWidth="2" strokeDasharray="6 3" className="animate-spin" />
            <circle cx="47" cy="51" r="2.5" fill="#38BDF8" filter="url(#neonBloom)" />
            <circle cx="73" cy="51" r="2.5" fill="#38BDF8" filter="url(#neonBloom)" />
          </g>
        ) : isSpeaking || isHappyWink ? (
          /* Speaking / Happy Arch Eyes (^ ^) */
          <g stroke="url(#eyeGlow)" strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#neonBloom)">
            <path d="M 42 53 Q 47 45 52 53" />
            <path d="M 68 53 Q 73 45 78 53" />
          </g>
        ) : isListening ? (
          /* Listening: Wide Attentive Glowing Orbs */
          <g filter="url(#neonBloom)">
            <ellipse cx="47" cy="51" rx="6" ry="6.5" fill="url(#eyeGlow)" />
            <ellipse cx="73" cy="51" rx="6" ry="6.5" fill="url(#eyeGlow)" />
            <circle cx="49" cy="49" r="2" fill="#FFFFFF" />
            <circle cx="75" cy="49" r="2" fill="#FFFFFF" />
          </g>
        ) : (
          /* Idle / Ready: Warm, Friendly Glowing Eyes */
          <g filter="url(#neonBloom)">
            <rect x="42" y="46" width="10" height="11" rx="5" fill="url(#eyeGlow)" />
            <rect x="68" y="46" width="10" height="11" rx="5" fill="url(#eyeGlow)" />
            <circle cx="45" cy="48" r="1.5" fill="#FFFFFF" />
            <circle cx="71" cy="48" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Cute blush spots on cheeks */}
        <circle cx="37" cy="57" r="3" fill="#F472B6" opacity="0.3" filter="url(#neonBloom)" />
        <circle cx="83" cy="57" r="3" fill="#F472B6" opacity="0.3" filter="url(#neonBloom)" />

        {/* 5. Dynamic Mouth / Voice Equalizer */}
        {isSpeaking ? (
          <g transform="translate(50, 62)">
            <rect x="0" y="-3" width="3" height="7" rx="1.5" fill="#E879F9" className="animate-pulse" />
            <rect x="6" y="-5" width="3" height="10" rx="1.5" fill="#38BDF8" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
            <rect x="12" y="-6" width="3" height="12" rx="1.5" fill="#C084FC" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
            <rect x="18" y="-3" width="3" height="7" rx="1.5" fill="#E879F9" className="animate-pulse" style={{ animationDelay: '0.15s' }} />
          </g>
        ) : (
          /* Warm Friendly Smiling Mouth */
          <path
            d="M 56 63 Q 60 66 64 63"
            stroke="#818CF8"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        )}

        {/* 6. Neck Connector */}
        <path
          d="M 52 78 L 68 78 L 72 84 L 48 84 Z"
          fill="#A78BFA"
        />

        {/* 7. Torso Shell (Porcelain White + Lavender) */}
        <path
          d="M 40 84 C 40 84, 34 116, 42 124 C 46 128, 74 128, 78 124 C 86 116, 80 84, 80 84 Z"
          fill="url(#torsoGrad)"
          stroke="#C4B5FD"
          strokeWidth="1.5"
        />

        {/* Symmetrical Floating Shoulder Joints (Clean, Friendly Rest Pose) */}
        {/* Left Shoulder & Resting Arm */}
        <g>
          <circle cx="34" cy="94" r="6" fill="#DDD6FE" stroke="#A78BFA" strokeWidth="1" />
          <path
            d="M 34 94 Q 28 106 31 116"
            stroke="#DDD6FE"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="31" cy="116" r="3" fill="#C4B5FD" />
        </g>

        {/* Right Shoulder & Resting Arm */}
        <g>
          <circle cx="86" cy="94" r="6" fill="#DDD6FE" stroke="#A78BFA" strokeWidth="1" />
          <path
            d="M 86 94 Q 92 106 89 116"
            stroke="#DDD6FE"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="89" cy="116" r="3" fill="#C4B5FD" />
        </g>

        {/* SOLVA Power Heart / Core Crystal */}
        <g transform="translate(60, 102)">
          <circle cx="0" cy="0" r="7" fill="#1E1035" />
          <circle
            cx="0"
            cy="0"
            r={isThinking ? 5 : isSpeaking ? 4.5 : 4}
            fill="url(#crestGlow)"
            filter="url(#neonBloom)"
            className={isSpeaking ? 'animate-pulse' : ''}
          />
          {/* Subtle 'S' initial in the core */}
          <path
            d="M -1.8 -2.5 Q 1.8 -2.5 1.8 -0.5 Q -1.8 0.5 -1.8 2.5 Q 1.8 2.5 1.8 2.5"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes solvaFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(0.6deg); }
        }
        @keyframes solvaBobHappy {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes solvaBobFast {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
      `}</style>
    </div>
  );
};
