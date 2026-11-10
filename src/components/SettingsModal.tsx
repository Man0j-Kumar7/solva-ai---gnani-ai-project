import React, { useState, useEffect } from 'react';
import {
  X,
  Languages,
  Volume2,
  Cpu,
  Moon,
  Sun,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Bell,
  BellOff,
  Music,
} from 'lucide-react';
import { VoiceSettings, ConfigStatusResponse, Conversation } from '../types';
import { ALL_22_INDIAN_LANGUAGES } from '../services/indianLanguages';
import { soundEffects } from '../services/soundEffects';
import { notificationService } from '../services/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: VoiceSettings) => void;
  theme: 'light' | 'dark' | 'system';
  onUpdateTheme: (theme: 'light' | 'dark' | 'system') => void;
  configStatus: ConfigStatusResponse | null;
  conversations: Conversation[];
  onClearAllData: () => void;
  onReplayIntro?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  voiceSettings,
  onUpdateVoiceSettings,
  theme,
  onUpdateTheme,
  configStatus,
  conversations,
  onClearAllData,
  onReplayIntro,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.getEnabled());
  const [soundVolume, setSoundVolume] = useState(soundEffects.getVolume());
  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  useEffect(() => {
    if (isOpen) {
      setSoundEnabled(soundEffects.getEnabled());
      setSoundVolume(soundEffects.getVolume());
      setNotificationStatus(notificationService.getPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundEffects.setEnabled(enabled);
    if (enabled) {
      soundEffects.playReplyChime();
    }
  };

  const handleVolumeChange = (vol: number) => {
    setSoundVolume(vol);
    soundEffects.setVolume(vol);
  };

  const handleTestChime = () => {
    soundEffects.playReplyChime();
  };

  const handleRequestNotification = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationStatus(notificationService.getPermissionStatus());
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `solva-conversations-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-5">
      <div className="w-full max-w-2xl max-h-[90dvh] sm:max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-purple-200/80 dark:border-purple-800/70 flex flex-col overflow-hidden">
        {/* Header with Rich Gradient Accent */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Settings & Preferences
            </h2>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold">
              SOLVA
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-7 text-xs sm:text-sm">
          {/* Section 1: Indian Language Support (All 22 Scheduled + Colloquial) */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>22 Scheduled Indian Languages</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              SOLVA automatically detects your language, or you can fix your conversation in a chosen Indian tongue or Romanised style (e.g. Tanglish, Hinglish).
            </p>

            {/* Quick Modes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => onSelectLanguage('auto')}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedLanguage === 'auto'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="font-bold text-xs sm:text-sm truncate">Auto-Detect</p>
                <p className="text-[11px] text-slate-400 truncate">All 22 Languages</p>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage('tanglish')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedLanguage === 'tanglish'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="font-bold text-sm">Tanglish</p>
                <p className="text-xs text-slate-400">Tamil (Latin)</p>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage('hinglish')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedLanguage === 'hinglish'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="font-bold text-sm">Hinglish</p>
                <p className="text-xs text-slate-400">Hindi (Latin)</p>
              </button>

              {ALL_22_INDIAN_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedLanguage === lang.code
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-bold text-sm truncate">{lang.name}</p>
                  <p className="text-xs text-slate-400 truncate">{lang.nativeName}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: SOLVA Signature Reply Sound */}
          <section className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <Music className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                <span>SOLVA's Signature Reply Chime</span>
              </div>
              <button
                type="button"
                onClick={handleTestChime}
                className="px-3 py-1 rounded-xl text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/60 hover:bg-fuchsia-100 transition-colors"
              >
                Play Sample
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5 leading-relaxed">
              An original, soft futuristic chime that plays once when SOLVA finishes generating a response.
            </p>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Play reply sound effect
                  </p>
                  <p className="text-xs text-slate-400">
                    Plays subtly upon answer completion.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => handleToggleSound(e.target.checked)}
                  className="w-5 h-5 accent-fuchsia-600 rounded cursor-pointer"
                />
              </div>

              {soundEnabled && (
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Chime Volume</span>
                    <span className="font-mono text-fuchsia-600">{Math.round(soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-600"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Section 3: User Notifications */}
          <section className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Background Reply Notifications</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                notificationStatus === 'granted'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {notificationStatus === 'granted' ? 'Enabled' : notificationStatus === 'denied' ? 'Blocked' : 'Off'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5 leading-relaxed">
              Notifies you only when you tab away from SOLVA while a long reasoning task or translation completes.
            </p>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Browser push alerts
                </p>
                <p className="text-xs text-slate-400">
                  {notificationStatus === 'granted'
                    ? 'Active when this window is in the background.'
                    : 'Click to grant notification permission.'}
                </p>
              </div>

              {notificationStatus === 'granted' ? (
                <button
                  type="button"
                  onClick={() => notificationService.setOptedIn(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Turn Off
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestNotification}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Enable Alerts
                </button>
              )}
            </div>
          </section>

          {/* Section 4: Voice Speech Controls */}
          <section className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 font-bold text-base text-slate-900 dark:text-white">
              <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Speech & Spoken Replies</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Auto-play voice responses
                  </p>
                  <p className="text-xs text-slate-400">
                    Immediately speak assistant answers using Indic TTS.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSettings.autoPlay}
                  onChange={(e) =>
                    onUpdateVoiceSettings({ ...voiceSettings, autoPlay: e.target.checked })
                  }
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Speech Speed</span>
                  <span className="font-mono font-bold text-purple-600">{voiceSettings.rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={voiceSettings.rate}
                  onChange={(e) =>
                    onUpdateVoiceSettings({
                      ...voiceSettings,
                      rate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </section>

          {/* Section 5: Real Gnani AI & Gemini Status */}
          <section className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Speech Provider — Gnani AI</span>
              </div>
              {configStatus?.gnani.isConfigured ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Integration Ready</span>
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 space-y-2 text-xs">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {configStatus?.gnani.statusMessage ||
                  'Gnani AI powers speech recognition (STT) and voice synthesis (TTS) for Indian languages.'}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-purple-200/50 dark:border-purple-900/50 space-y-1">
                <p><strong>STT API Endpoint:</strong> <code>https://asr.gnani.ai/v1/recognize</code></p>
                <p><strong>TTS API Endpoint:</strong> <code>https://tts.gnani.ai/v1/synthesize</code></p>
                <p><strong>Secret Key:</strong> <code>GNANI_API_KEY</code> (configured securely on backend)</p>
              </div>
            </div>
          </section>

          {/* Section 6: Theme Appearance */}
          <section className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2.5 font-bold text-base text-slate-900 dark:text-white">
              <Moon className="w-5 h-5 text-purple-600" />
              <span>Theme Appearance</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onUpdateTheme('light')}
                className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-sm font-bold cursor-pointer ${
                  theme === 'light'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateTheme('dark')}
                className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-sm font-bold cursor-pointer ${
                  theme === 'dark'
                    ? 'border-purple-600 bg-purple-950 text-purple-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateTheme('system')}
                className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-sm font-bold cursor-pointer ${
                  theme === 'system'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>

            {onReplayIntro && (
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Signature Intro Animation
                  </p>
                  <p className="text-xs text-slate-400">
                    Watch the 3D robot fly-in and greeting sequence.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onReplayIntro}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors cursor-pointer"
                >
                  Replay Intro ✌🏼
                </button>
              </div>
            )}
          </section>

          {/* Section 7: Data Management */}
          <section className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 font-bold text-base text-slate-900 dark:text-white">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Data & Privacy</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Your conversations are stored securely. No tracking, telemetry, or external ad scripts.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Chat History (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={onClearAllData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Stored Data</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
