import React from 'react';
import { AssistantStatus } from '../types';

interface SolvaOrbProps {
  status: AssistantStatus;
  size?: 'compact' | 'medium' | 'large';
  volume?: number; // 0 to 100 for live voice reaction
  className?: string;
  onClick?: () => void;
}

export const SolvaOrb: React.FC<SolvaOrbProps> = ({
  status,
  size = 'medium',
  volume = 0,
  className = '',
  onClick,
}) => {
  // Size dimensions
  const dimensions = {
    compact: {
      wrapper: 'w-10 h-10',
      core: 'w-7 h-7',
      glow: 'w-10 h-10',
      ring: 'w-9 h-9',
    },
    medium: {
      wrapper: 'w-24 h-24 md:w-28 md:h-28',
      core: 'w-16 h-16 md:w-20 md:h-20',
      glow: 'w-24 h-24 md:w-28 md:h-28',
      ring: 'w-22 h-22 md:w-26 md:h-26',
    },
    large: {
      wrapper: 'w-48 h-48 md:w-60 md:h-60',
      core: 'w-32 h-32 md:w-40 md:h-40',
      glow: 'w-48 h-48 md:w-60 md:h-60',
      ring: 'w-44 h-44 md:w-56 md:h-56',
    },
  }[size];

  // Dynamic volume scale for listening / speaking
  const volScale = status === 'listening' ? 1 + (volume / 100) * 0.25 : 1;

  // Status visual attributes
  const getStatusGlow = () => {
    switch (status) {
      case 'listening':
        return 'from-fuchsia-500/50 via-purple-500/40 to-transparent animate-pulse';
      case 'thinking':
      case 'transcribing':
        return 'from-purple-400/60 via-indigo-500/40 to-fuchsia-500/30 animate-spin duration-3000';
      case 'speaking':
        return 'from-purple-500/60 via-fuchsia-500/40 to-violet-600/30 animate-pulse';
      case 'error':
        return 'from-rose-500/40 via-purple-500/30 to-transparent';
      case 'ready':
      default:
        return 'from-purple-500/30 via-indigo-500/20 to-transparent animate-pulse duration-2000';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${dimensions.wrapper} ${className} ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      }`}
      aria-label={`SOLVA Status: ${status}`}
    >
      {/* Outer ambient glow halo */}
      <div
        className={`absolute rounded-full blur-xl bg-radial transition-all duration-700 pointer-events-none ${
          dimensions.glow
        } ${getStatusGlow()}`}
        style={{
          transform: `scale(${volScale})`,
        }}
      />

      {/* Orbiting harmonic ring (Subtle geometric aura) */}
      <div
        className={`absolute rounded-full border border-purple-400/30 dark:border-purple-300/20 transition-all duration-500 pointer-events-none ${
          dimensions.ring
        } ${status === 'thinking' || status === 'transcribing' ? 'animate-spin' : ''}`}
        style={{
          animationDuration: status === 'thinking' ? '3s' : '14s',
          borderStyle: status === 'speaking' ? 'dashed' : 'solid',
        }}
      />

      {/* Second outer ring for depth */}
      {size !== 'compact' && (
        <div
          className={`absolute rounded-full border border-fuchsia-400/20 dark:border-fuchsia-300/10 pointer-events-none ${
            size === 'large' ? 'w-52 h-52 md:w-68 md:h-68' : 'w-24 h-24'
          } ${status === 'listening' ? 'scale-110 opacity-70' : 'opacity-40'} transition-all duration-500`}
        />
      )}

      {/* Living Core Sphere */}
      <div
        className={`relative rounded-full shadow-lg transition-transform duration-200 flex items-center justify-center overflow-hidden ${
          dimensions.core
        }`}
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #f3e8ff 0%, #d8b4fe 25%, #a855f7 60%, #6b21a8 100%)',
          boxShadow:
            status === 'speaking' || status === 'listening'
              ? '0 0 35px rgba(168, 85, 247, 0.65), inset 0 0 15px rgba(255, 255, 255, 0.6)'
              : '0 0 25px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.4)',
          transform: `scale(${volScale})`,
        }}
      >
        {/* Internal refractive highlight */}
        <div className="absolute top-1.5 left-2 w-1/3 h-1/3 rounded-full bg-white/50 blur-[1px] pointer-events-none" />

        {/* Dynamic Abstract Core Wave / Iris / Indicator */}
        {status === 'listening' ? (
          <div className="flex items-center gap-0.5 md:gap-1">
            <span className="w-1 bg-white rounded-full animate-bounce h-3 md:h-4" style={{ animationDelay: '0ms' }} />
            <span className="w-1 bg-white rounded-full animate-bounce h-5 md:h-6" style={{ animationDelay: '150ms' }} />
            <span className="w-1 bg-white rounded-full animate-bounce h-3 md:h-4" style={{ animationDelay: '300ms' }} />
          </div>
        ) : status === 'thinking' || status === 'transcribing' ? (
          <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
        ) : status === 'speaking' ? (
          <div className="flex items-center gap-1">
            <span className="w-1 bg-white/90 rounded-full animate-pulse h-3 md:h-5" style={{ animationDuration: '0.4s' }} />
            <span className="w-1 bg-white/90 rounded-full animate-pulse h-6 md:h-7" style={{ animationDuration: '0.6s' }} />
            <span className="w-1 bg-white/90 rounded-full animate-pulse h-4 md:h-5" style={{ animationDuration: '0.5s' }} />
          </div>
        ) : (
          /* Subtle sentient light spark in idle */
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/80 shadow-[0_0_8px_#fff]" />
        )}
      </div>
    </div>
  );
};
