import React, { useState, useEffect } from 'react';
import { SolvaRobot } from './SolvaRobot';
import { soundEffects } from '../services/soundEffects';

interface WelcomeEntranceProps {
  onComplete: () => void;
}

export const WelcomeEntrance: React.FC<WelcomeEntranceProps> = ({ onComplete }) => {
  // Sequence phases:
  // Phase 0: Ambient purple/fuchsia background glow initializes
  // Phase 1: Robot flies smoothly into the screen from distance towards center (100ms)
  // Phase 2: Settles gently into center, eyes blink, subtle glowing and sparkling effect (800ms)
  // Phase 3: Friendly floating greeting with soft chime (1700ms)
  // Phase 4: Dissolves smoothly into dashboard (2500ms -> 2900ms complete)
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    // Respect reduced motion accessibility setting
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Step 1: Smooth fly-in begins
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 100);

    // Step 2: Settle in center, sparkle and soft chime
    const t2 = setTimeout(() => {
      setPhase(2);
      try {
        soundEffects.playReplyChime();
      } catch (e) {
        // Safe audio catch
      }
    }, 850);

    // Step 3: Gentle float greeting
    const t3 = setTimeout(() => {
      setPhase(3);
    }, 1750);

    // Step 4: Fade out into dashboard
    const t4 = setTimeout(() => {
      setPhase(4);
    }, 2500);

    // Complete transition
    const t5 = setTimeout(() => {
      onComplete();
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 cursor-pointer select-none ${
        phase === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } bg-slate-950/95`}
      aria-label="SOLVA Welcome Introduction"
    >
      {/* 1. Purple, violet & fuchsia ambient gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] sm:blur-[120px] transition-all duration-1000 ${
            phase >= 1
              ? 'w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] md:w-[580px] md:h-[580px] bg-gradient-to-tr from-purple-700/40 via-fuchsia-600/35 to-sky-500/30 scale-100 opacity-100'
              : 'w-[160px] h-[160px] bg-purple-900/20 scale-50 opacity-0'
          }`}
        />
      </div>

      {/* Orbiting cosmic particle rings */}
      <div
        className={`absolute rounded-full border border-purple-500/20 pointer-events-none transition-all duration-1000 ${
          phase >= 2 ? 'w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 scale-100 opacity-60 animate-spin' : 'w-32 h-32 scale-50 opacity-0'
        }`}
        style={{ animationDuration: '20s' }}
      />
      <div
        className={`absolute rounded-full border border-fuchsia-400/20 pointer-events-none transition-all duration-1000 ${
          phase >= 2 ? 'w-64 h-64 sm:w-80 sm:h-80 md:w-[440px] md:h-[440px] scale-100 opacity-40' : 'w-36 h-36 scale-50 opacity-0'
        }`}
      />

      {/* 2. SOLVA Flying Robot (Flies in from distance, settles in center, gentle float) */}
      <div
        className={`relative z-10 transition-all will-change-transform ${
          phase === 0
            ? 'scale-[0.3] -translate-y-20 opacity-0 blur-sm'
            : phase === 1
            ? 'scale-[1.04] translate-y-0 opacity-100 blur-0 duration-700 ease-out'
            : 'scale-100 translate-y-0 opacity-100 duration-500'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <SolvaRobot
          status="ready"
          size="large"
          sparkle={phase >= 2}
          showAura={true}
        />
      </div>

      {/* 3. Text Welcome Banner */}
      <div
        className={`mt-4 sm:mt-6 text-center z-10 transition-all duration-700 px-4 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
          <span className="solva-gradient-text">SOLVA</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-purple-200/80 tracking-wide">
          Your Multilingual AI Companion
        </p>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-200/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md border border-purple-500/20 transition-all cursor-pointer"
      >
        Skip ✕
      </button>
    </div>
  );
};
