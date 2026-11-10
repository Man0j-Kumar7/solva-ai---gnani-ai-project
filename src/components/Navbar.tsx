import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Menu,
  X,
  MessageSquare,
  Clock,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';
import { ScreenMode } from '../types';

interface NavbarProps {
  currentScreen: ScreenMode;
  onNavigate: (screen: ScreenMode) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onNewChat,
  onOpenSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Esc key or window resize to desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavClick = (screen: ScreenMode) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    setMobileMenuOpen(false);
  };

  const handleNewChatClick = () => {
    onNewChat();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-purple-200/50 dark:border-purple-800/40 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16 md:h-18">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('assistant')}
            className="text-xl sm:text-2xl font-black tracking-tight solva-gradient-text whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] flex items-center"
            aria-label="SOLVA Home"
          >
            SOLVA
          </button>

          {/* Zone 2 (DESKTOP): 4 concise single-line text links */}
          <nav className="hidden md:flex items-center gap-7 text-base font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 dark:hover:text-purple-400 py-1 cursor-pointer min-h-[44px] flex items-center ${
                currentScreen === 'assistant'
                  ? 'text-purple-600 dark:text-purple-400 underline underline-offset-8 decoration-2 decoration-purple-600 font-bold'
                  : ''
              }`}
            >
              Assistant
            </button>

            <button
              type="button"
              onClick={() => onNavigate('history')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 dark:hover:text-purple-400 py-1 cursor-pointer min-h-[44px] flex items-center ${
                currentScreen === 'history'
                  ? 'text-purple-600 dark:text-purple-400 underline underline-offset-8 decoration-2 decoration-purple-600 font-bold'
                  : ''
              }`}
            >
              History
            </button>

            <button
              type="button"
              onClick={() => onNavigate('welcome')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 dark:hover:text-purple-400 py-1 cursor-pointer min-h-[44px] flex items-center ${
                currentScreen === 'welcome'
                  ? 'text-purple-600 dark:text-purple-400 underline underline-offset-8 decoration-2 decoration-purple-600 font-bold'
                  : ''
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 dark:hover:text-purple-400 py-1 cursor-pointer min-h-[44px] flex items-center"
            >
              Settings
            </button>
          </nav>

          {/* Zone 3 (DESKTOP): Primary CTA */}
          <div className="hidden md:flex items-center shrink-0">
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-sky-500 hover:opacity-95 rounded-2xl shadow-md shadow-purple-500/25 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* MOBILE CONTROLS: Compact New Chat button + Hamburger Menu */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleNewChatClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-sky-500 hover:opacity-95 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer min-h-[40px]"
              aria-label="Start new chat"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-purple-100/60 dark:hover:bg-purple-950/60 active:scale-95 transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER & BACKDROP */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 sm:top-16 z-40 md:hidden flex flex-col justify-start">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-14 sm:top-16 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative z-10 w-full bg-white dark:bg-slate-900 border-b border-purple-200/70 dark:border-purple-800/60 shadow-2xl px-4 py-4 max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <div className="space-y-1.5">
              {/* Destination 1: Assistant */}
              <button
                type="button"
                onClick={() => handleNavClick('assistant')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer min-h-[48px] ${
                  currentScreen === 'assistant'
                    ? 'bg-purple-500/10 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-300/40 dark:border-purple-800/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    currentScreen === 'assistant'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">Assistant</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Voice, multimodal & Indic chat
                  </div>
                </div>
              </button>

              {/* Destination 2: History */}
              <button
                type="button"
                onClick={() => handleNavClick('history')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer min-h-[48px] ${
                  currentScreen === 'history'
                    ? 'bg-purple-500/10 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-300/40 dark:border-purple-800/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    currentScreen === 'history'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-600 dark:text-fuchsia-400'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">History</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Saved conversations & bookmarks
                  </div>
                </div>
              </button>

              {/* Destination 3: Overview */}
              <button
                type="button"
                onClick={() => handleNavClick('welcome')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer min-h-[48px] ${
                  currentScreen === 'welcome'
                    ? 'bg-purple-500/10 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-300/40 dark:border-purple-800/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    currentScreen === 'welcome'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">Overview</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    22 Indian languages & features
                  </div>
                </div>
              </button>

              {/* Destination 4: Settings */}
              <button
                type="button"
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer min-h-[48px]"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">Settings</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Language, speech, voice & theme
                  </div>
                </div>
              </button>
            </div>

            {/* Bottom Action in Drawer */}
            <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/50">
              <button
                type="button"
                onClick={handleNewChatClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-sky-500 shadow-md shadow-purple-500/25 active:scale-[0.99] transition-all cursor-pointer min-h-[48px]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start New Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
