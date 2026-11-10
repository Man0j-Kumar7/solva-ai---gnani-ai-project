import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Square } from 'lucide-react';
import { speechService } from '../services/speech';

interface AudioPlayerProps {
  text: string;
  audioBase64?: string;
  language?: string;
  provider?: 'gnani.ai' | 'browser' | 'none';
  autoStart?: boolean;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  audioBase64,
  language = 'ta-IN',
  provider = 'gnani.ai',
  autoStart = false,
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  useEffect(() => {
    if (autoStart) {
      handlePlay();
    }
    return () => {
      // Do not stop speaking immediately if component unmounts unless requested
    };
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if (audioBase64 && provider === 'gnani.ai') {
      speechService.playBase64Audio(audioBase64, 'wav', () => {
        setIsPlaying(false);
        onEnded?.();
      });
    } else {
      speechService.speakWithBrowser(
        text,
        language,
        { rate: playbackSpeed },
        () => {
          setIsPlaying(false);
          onEnded?.();
        }
      );
    }
  };

  const handleStop = () => {
    speechService.stopSpeaking();
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    const nextSpeed = playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1.0;
    setPlaybackSpeed(nextSpeed);
    if (isPlaying) {
      // restart with new speed
      speechService.stopSpeaking();
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
        speechService.speakWithBrowser(text, language, { rate: nextSpeed }, () => {
          setIsPlaying(false);
          onEnded?.();
        });
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 transition-all">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={handlePlay}
        className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-all shadow-sm shrink-0"
        aria-label={isPlaying ? 'Pause audio response' : 'Play audio response'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* Stop Button */}
      {isPlaying && (
        <button
          type="button"
          onClick={handleStop}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0"
          title="Stop speech"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      )}

      {/* Sound wave visualizer */}
      <div className="flex items-center gap-0.5 h-4 px-1">
        {[40, 70, 100, 60, 90, 50, 80, 45].map((height, idx) => (
          <span
            key={idx}
            className={`w-0.5 rounded-full transition-all duration-300 ${
              isPlaying
                ? 'bg-purple-600 dark:bg-purple-400 animate-pulse'
                : 'bg-purple-300 dark:bg-purple-700 h-1.5'
            }`}
            style={{
              height: isPlaying ? `${Math.max(4, (height / 100) * 16)}px` : '4px',
              animationDelay: `${idx * 80}ms`,
            }}
          />
        ))}
      </div>

      {/* Provider Info */}
      <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 truncate">
        {provider === 'gnani.ai' ? 'Gnani Indic Voice' : 'Voice Playback'}
      </span>

      {/* Speed control */}
      <button
        type="button"
        onClick={cycleSpeed}
        className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-800 dark:text-purple-200 transition-colors"
      >
        {playbackSpeed}x
      </button>
    </div>
  );
};
