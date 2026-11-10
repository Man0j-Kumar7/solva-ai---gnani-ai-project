import React, { useState, useEffect } from 'react';
import {
  ScreenMode,
  AssistantStatus,
  Message,
  Conversation,
  ChatImage,
  VoiceSettings,
  ConfigStatusResponse,
} from './types';
import {
  sendChatMessage,
  fetchConfigStatus,
  fetchAllConversations,
  saveConversationToServer,
  deleteConversationFromServer,
  clearAllConversationsFromServer,
  toggleBookmarkOnServer,
  requestGnaniTTS,
} from './services/api';
import { speechService } from './services/speech';
import { soundEffects } from './services/soundEffects';
import { notificationService } from './services/notificationService';

import { Navbar } from './components/Navbar';
import { WelcomeEntrance } from './components/WelcomeEntrance';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ConversationFeed } from './components/ConversationFeed';
import { MessageComposer } from './components/MessageComposer';
import { HistoryView } from './components/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  // Navigation & Screen state (Default directly to clean assistant dashboard)
  const [screen, setScreen] = useState<ScreenMode>('assistant');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Signature Entrance Animation state (Plays once per browser session)
  const [showEntranceAnimation, setShowEntranceAnimation] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('solva_intro_seen');
      return !seen;
    }
    return false;
  });

  // Conversations & Chat
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string>('');
  const [status, setStatus] = useState<AssistantStatus>('ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Playback state
  const [currentAudioPlayingId, setCurrentAudioPlayingId] = useState<string | null>(null);

  // User Preferences
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    autoPlay: false,
    rate: 1.0,
    pitch: 1.0,
    gender: 'female',
  });

  // System & API Configuration Status
  const [configStatus, setConfigStatus] = useState<ConfigStatusResponse | null>(null);

  // ----------------------------------------------------
  // Initial Boot & Hydration
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Fetch system config status
    fetchConfigStatus()
      .then(setConfigStatus)
      .catch((err) => console.warn('Could not load config status:', err));

    // 2. Fetch conversations from server or local - strictly genuine user conversations
    fetchAllConversations().then((serverConvs) => {
      const genuineServerConvs = (serverConvs || []).filter(
        (c) => c && c.id && !c.id.startsWith('seed-conv-')
      );
      if (genuineServerConvs.length > 0) {
        setConversations(genuineServerConvs);
        localStorage.setItem('solva_conversations', JSON.stringify(genuineServerConvs));
      } else {
        const cached = localStorage.getItem('solva_conversations');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const genuineLocal = (Array.isArray(parsed) ? parsed : []).filter(
              (c: any) => c && c.id && !c.id.startsWith('seed-conv-')
            );
            setConversations(genuineLocal);
            localStorage.setItem('solva_conversations', JSON.stringify(genuineLocal));
          } catch (e) {
            setConversations([]);
            localStorage.removeItem('solva_conversations');
          }
        } else {
          setConversations([]);
        }
      }
    });

    // 3. Load preferences
    const savedTheme = localStorage.getItem('solva_theme') as any;
    if (savedTheme) setTheme(savedTheme);

    const savedLang = localStorage.getItem('solva_lang');
    if (savedLang) setSelectedLanguage(savedLang);

    const savedVoice = localStorage.getItem('solva_voice');
    if (savedVoice) {
      try {
        setVoiceSettings(JSON.parse(savedVoice));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // ----------------------------------------------------
  // Theme Synchronizer
  // ----------------------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('solva_theme', theme);
  }, [theme]);

  // Current active messages
  const activeConversation = conversations.find((c) => c.id === currentConvId);
  const activeMessages = activeConversation?.messages || [];

  // Helper to persist conversation updates
  const updateConversationState = (updatedConv: Conversation) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedConv.id);
      let next: Conversation[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updatedConv;
      } else {
        next = [updatedConv, ...prev];
      }
      localStorage.setItem('solva_conversations', JSON.stringify(next));
      return next;
    });
    saveConversationToServer(updatedConv);
  };

  // ----------------------------------------------------
  // Actions
  // ----------------------------------------------------
  const handleStartNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language: selectedLanguage === 'auto' ? 'English' : selectedLanguage,
      preview: '',
      messages: [],
    };

    updateConversationState(newConv);
    setCurrentConvId(newId);
    setScreen('assistant');
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConvId(id);
    setScreen('assistant');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem('solva_conversations', JSON.stringify(next));
      return next;
    });
    deleteConversationFromServer(id);
    if (currentConvId === id) {
      setCurrentConvId('');
    }
  };

  const handleClearAllConversations = () => {
    setConversations([]);
    setCurrentConvId('');
    localStorage.removeItem('solva_conversations');
    clearAllConversationsFromServer();
  };

  const handleToggleBookmark = (conversationId: string, messageId: string) => {
    setConversations((prev) => {
      const next = prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, isBookmarked: !m.isBookmarked } : m
            ),
          };
        }
        return c;
      });
      localStorage.setItem('solva_conversations', JSON.stringify(next));
      return next;
    });
    toggleBookmarkOnServer(conversationId, messageId);
  };

  const handleBookmarkCurrentMessage = (messageId: string) => {
    if (currentConvId) {
      handleToggleBookmark(currentConvId, messageId);
    }
  };

  // ----------------------------------------------------
  // Send Message Flow (Text, Vision, Multimodal)
  // ----------------------------------------------------
  const handleSendMessage = async (text: string, image?: ChatImage) => {
    setErrorMessage(null);
    let convId = currentConvId;
    let targetConv = conversations.find((c) => c.id === convId);

    // If no active conversation, create one
    if (!convId || !targetConv) {
      convId = `conv-${Date.now()}`;
      targetConv = {
        id: convId,
        title: text.slice(0, 36) || (image ? 'Image Analysis' : 'New Chat'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        language: selectedLanguage === 'auto' ? 'English' : selectedLanguage,
        preview: text.slice(0, 90),
        messages: [],
      };
      setCurrentConvId(convId);
    }

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      language: selectedLanguage,
      image,
    };

    const updatedMessages = [...targetConv.messages, userMessage];
    const updatedConv: Conversation = {
      ...targetConv,
      title: targetConv.messages.length === 0 ? text.slice(0, 36) || targetConv.title : targetConv.title,
      preview: text.slice(0, 90),
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    };

    updateConversationState(updatedConv);
    setStatus('thinking');

    try {
      // Prepare payload for Gemini API
      const historyPayload = updatedMessages.map((m, idx) => ({
        role: m.role,
        content: m.content,
        image:
          m.image && (idx === updatedMessages.length - 1 || idx >= updatedMessages.length - 2)
            ? { mimeType: m.image.mimeType, data: m.image.data }
            : undefined,
      }));

      const result = await sendChatMessage(historyPayload, selectedLanguage);

      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: result.text,
        timestamp: new Date().toISOString(),
        language: result.detectedLanguage,
        model: result.model,
        isHighDemand: result.isHighDemand,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConv: Conversation = {
        ...updatedConv,
        language: result.detectedLanguage,
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      };

      updateConversationState(finalConv);
      setStatus('ready');

      // 1. Play SOLVA's signature reply chime
      soundEffects.playReplyChime();

      // 2. Dispatch browser notification if user tab is in background
      notificationService.notifyReplyCompleted(result.text, result.detectedLanguage);

      // 3. Auto-play voice if enabled
      if (voiceSettings.autoPlay) {
        handlePlayVoiceResponse(assistantMessage);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setStatus('error');
      const friendlyError = err.message || 'Failed to generate response. Please try again.';
      setErrorMessage(friendlyError);

      const errMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an issue: ${friendlyError}`,
        timestamp: new Date().toISOString(),
        error: friendlyError,
      };

      const withErrConv: Conversation = {
        ...updatedConv,
        messages: [...updatedMessages, errMessage],
      };
      updateConversationState(withErrConv);
    } finally {
      setTimeout(() => {
        setStatus((prev) => (prev === 'thinking' || prev === 'transcribing' ? 'ready' : prev));
      }, 300);
    }
  };

  const handleRetryLastMessage = () => {
    if (!currentConvId) return;
    const currentConv = conversations.find((c) => c.id === currentConvId);
    if (!currentConv || currentConv.messages.length === 0) return;

    // Filter out trailing error messages
    const msgs = [...currentConv.messages];
    while (msgs.length > 0 && msgs[msgs.length - 1].error) {
      msgs.pop();
    }
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove the last user message because handleSendMessage will append it freshly
    const lastUserIdx = msgs.lastIndexOf(lastUserMsg);
    const cleanedMessages = msgs.slice(0, lastUserIdx);

    const updatedConv: Conversation = {
      ...currentConv,
      messages: cleanedMessages,
      updatedAt: new Date().toISOString(),
    };
    updateConversationState(updatedConv);

    handleSendMessage(lastUserMsg.content, lastUserMsg.image);
  };

  // ----------------------------------------------------
  // Voice Output Playback Handler
  // ----------------------------------------------------
  const handlePlayVoiceResponse = async (message: Message) => {
    setStatus('speaking');
    setCurrentAudioPlayingId(message.id);

    const langMap: Record<string, string> = {
      'Tamil (தமிழ்)': 'ta-IN',
      'Tanglish (Tamil)': 'ta-IN',
      'Tanglish': 'ta-IN',
      'Hindi (हिन्दी)': 'hi-IN',
      'Hinglish (Hindi)': 'hi-IN',
      'Hinglish': 'hi-IN',
      'Telugu (తెలుగు)': 'te-IN',
      'Malayalam (മലയാളം)': 'ml-IN',
      'Kannada (ಕನ್ನಡ)': 'kn-IN',
      'Marathi (मराठी)': 'mr-IN',
      'Gujarati (ગુજરાતી)': 'gu-IN',
      'Bengali (বাংলা)': 'bn-IN',
      'Punjabi (ਪੰਜਾਬੀ)': 'pa-IN',
      'English': 'en-IN',
    };
    const gnaniLangCode = langMap[message.language || ''] || 'ta-IN';

    try {
      const ttsResult = await requestGnaniTTS(
        message.content,
        gnaniLangCode,
        voiceSettings.gender
      );

      if (ttsResult.success && ttsResult.audioBase64) {
        await speechService.playBase64Audio(ttsResult.audioBase64, 'wav', () => {
          setStatus('ready');
          setCurrentAudioPlayingId(null);
        });

        if (currentConvId) {
          const conv = conversations.find((c) => c.id === currentConvId);
          if (conv) {
            const updated = {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === message.id
                  ? {
                      ...m,
                      audioBase64: ttsResult.audioBase64,
                      audioProvider: 'gnani.ai' as const,
                    }
                  : m
              ),
            };
            updateConversationState(updated);
          }
        }
        return;
      }
    } catch (err) {
      console.warn('Gnani TTS backend note:', err);
    }

    // High fidelity browser speech synthesis fallback
    speechService.speakWithBrowser(
      message.content,
      gnaniLangCode,
      { rate: voiceSettings.rate, pitch: voiceSettings.pitch },
      () => {
        setStatus('ready');
        setCurrentAudioPlayingId(null);
      }
    );
  };

  const handleIntroComplete = () => {
    setShowEntranceAnimation(false);
    sessionStorage.setItem('solva_intro_seen', 'true');
  };

  const handleReplayIntro = () => {
    setIsSettingsOpen(false);
    setShowEntranceAnimation(true);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 solva-ambient-bg transition-colors overflow-x-hidden w-full max-w-full">
      {/* Signature Introduction Animation on Opening */}
      {showEntranceAnimation && (
        <WelcomeEntrance onComplete={handleIntroComplete} />
      )}

      {/* Universal Top Navigation */}
      <Navbar
        currentScreen={screen}
        onNavigate={(targetScreen) => {
          setScreen(targetScreen);
          if (targetScreen === 'assistant' && !currentConvId && conversations.length > 0) {
            setCurrentConvId(conversations[0].id);
          }
        }}
        onNewChat={handleStartNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="w-full bg-rose-600 text-white text-sm py-2.5 px-4 flex items-center justify-between shadow-lg z-30">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-700 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col relative overflow-x-hidden w-full">
        {screen === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => {
              setScreen('assistant');
              handleStartNewChat();
            }}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={(lang) => {
              setSelectedLanguage(lang);
              localStorage.setItem('solva_lang', lang);
            }}
          />
        )}

        {screen === 'assistant' && (
          <div className="flex-1 min-h-0 flex flex-col relative w-full h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4.5rem)] overflow-x-hidden">
            {/* Clean Conversation Feed / Dashboard */}
            <ConversationFeed
              messages={activeMessages}
              status={status}
              currentAudioPlayingId={currentAudioPlayingId}
              onBookmarkMessage={handleBookmarkCurrentMessage}
              onPlayVoiceResponse={handlePlayVoiceResponse}
              onRetryLastMessage={handleRetryLastMessage}
              onSelectPromptStarter={(promptText) => handleSendMessage(promptText)}
            />

            {/* Floating Message Composer pinned at bottom with breathing space */}
            <div className="sticky bottom-0 z-20 w-full pt-1 sm:pt-2 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 pointer-events-auto shrink-0">
              <MessageComposer
                status={status}
                selectedLanguage={selectedLanguage}
                onSendMessage={handleSendMessage}
                onVoiceTranscription={(transcript) => handleSendMessage(transcript)}
                onStatusChange={setStatus}
                onError={(err) => setErrorMessage(err)}
              />
            </div>
          </div>
        )}

        {screen === 'history' && (
          <HistoryView
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleStartNewChat}
            onDeleteConversation={handleDeleteConversation}
            onClearAll={handleClearAllConversations}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          localStorage.setItem('solva_lang', lang);
        }}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={(settings) => {
          setVoiceSettings(settings);
          localStorage.setItem('solva_voice', JSON.stringify(settings));
        }}
        theme={theme}
        onUpdateTheme={setTheme}
        configStatus={configStatus}
        conversations={conversations}
        onClearAllData={handleClearAllConversations}
        onReplayIntro={handleReplayIntro}
      />
    </div>
  );
}
