import React from 'react';
import { ArrowRight, Languages, Mic, Eye, Sparkles } from 'lucide-react';
import { SolvaRobot } from './SolvaRobot';
import { ALL_22_INDIAN_LANGUAGES } from '../services/indianLanguages';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const languageHighlights = [
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'tanglish', label: 'Tanglish' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'hinglish', label: 'Hinglish' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'en', label: 'English' },
  ];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center px-3 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto text-center w-full">
      {/* SOLVA Signature Robot Mascot */}
      <div className="relative mb-4 sm:mb-6">
        <SolvaRobot status="ready" size="large" />
      </div>

      {/* Main Brand Title & Description with Rich Gradient Styling */}
      <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-tight">
        Meet SOLVA — Your Voice in{' '}
        <span className="solva-gradient-text">
          Every Indian Language
        </span>
      </h1>

      <p className="mt-3 sm:mt-4 text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
        An original multimodal AI assistant combining conversational reasoning, Indic speech powered by Gnani AI, and Gemini vision understanding across India's 22 scheduled languages.
      </p>

      {/* Language Quick-Selector for immediate onboarding */}
      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl">
        {languageHighlights.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelectLanguage(lang.code)}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedLanguage === lang.code
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/30 scale-105'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-purple-200/60 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/50'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Feature Pillars */}
      <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl w-full text-left">
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/50 solva-card-glow backdrop-blur-md">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
            <Languages className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            22 Indian Languages + Colloquial
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Adapts instinctively to Tamil, Hindi, Telugu, Kannada, Bengali, Tanglish, Hinglish, and all Eighth Schedule languages.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/50 solva-card-glow backdrop-blur-md">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-950/80 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 mb-3">
            <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Indic Voice — Gnani AI
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Speech-to-Text and voice generation built specifically for natural pronunciation in Indian tongues.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/50 solva-card-glow backdrop-blur-md">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Multimodal Vision Understanding
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Upload images, read Indic signboards, inspect documents, and understand complex real-world scenes.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-8 sm:mt-10 w-full sm:w-auto">
        <button
          type="button"
          onClick={onGetStarted}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-sky-500 text-white font-bold text-sm sm:text-lg shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
        >
          <span>Get Started with SOLVA</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
