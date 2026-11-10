import React, { useRef, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Volume2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Message, AssistantStatus } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AudioPlayer } from './AudioPlayer';
import { SolvaRobot } from './SolvaRobot';

interface ConversationFeedProps {
  messages: Message[];
  status: AssistantStatus;
  currentAudioPlayingId: string | null;
  onBookmarkMessage: (messageId: string) => void;
  onPlayVoiceResponse: (message: Message) => void;
  onSelectPromptStarter?: (text: string) => void;
  onRetryLastMessage?: () => void;
}

export const ConversationFeed: React.FC<ConversationFeedProps> = ({
  messages,
  status,
  currentAudioPlayingId,
  onBookmarkMessage,
  onPlayVoiceResponse,
  onRetryLastMessage,
  onSelectPromptStarter,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [modalImage, setModalImage] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
      {/* Clean, Responsive Dashboard (When no messages yet) */}
      {messages.length === 0 ? (
        <div className="min-h-[46vh] sm:min-h-[54vh] flex flex-col items-center justify-center text-center px-2 sm:px-4 py-6 sm:py-10 md:py-14">
          {/* Main Visual Focus: SOLVA Robot Mascot */}
          <div className="mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
            <SolvaRobot status={status} size="large" showAura={true} />
          </div>

          {/* Welcoming Greeting with Balanced Mobile Typography */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Hi, I'm <span className="solva-gradient-text">SOLVA</span>
          </h2>

          <p className="mt-2.5 sm:mt-3.5 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-md sm:max-w-lg mx-auto leading-relaxed font-normal">
            Your personal companion for natural communication. Speak, type, or share an image in any Indian language or English.
          </p>

          {/* Responsive Status Marker */}
          <div className="mt-4 sm:mt-6 inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-950/40 border border-purple-300/30 dark:border-purple-800/40 text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 max-w-full text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate sm:whitespace-normal">Ready · 22 Indian Languages · Vision & Indic Voice</span>
          </div>

          {/* Quick Starter Prompts for Mobile & Desktop */}
          {onSelectPromptStarter && (
            <div className="mt-5 sm:mt-7 flex flex-wrap items-center justify-center gap-2 max-w-lg">
              {[
                "What is today's date and time?",
                'Translate to Tamil & speak',
                'Explain in Hindi / Hinglish',
                'Help me plan a trip to Kerala',
              ].map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => onSelectPromptStarter(promptText)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-purple-200/60 dark:border-purple-800/50 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 pb-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
              >
                {/* Meta header (Sender name and language badge) */}
                <div className="flex items-center gap-2 px-1 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {!isUser && <SolvaRobot status={status} size="compact" showAura={false} className="w-5 h-5 inline-block mr-0.5" />}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isUser ? 'You' : 'SOLVA'}
                  </span>
                  {msg.language && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        {msg.language}
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Bubble Card */}
                <div
                  className={`relative max-w-[94%] sm:max-w-[88%] rounded-3xl p-4 sm:p-5 text-base sm:text-lg leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-700 via-fuchsia-700 to-indigo-700 text-white shadow-purple-500/20 rounded-br-xs'
                      : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border border-purple-200/70 dark:border-purple-800/60 shadow-purple-500/10 rounded-bl-xs'
                  }`}
                >
                  {/* Uploaded Image preview inside message */}
                  {msg.image && (
                    <div className="mb-3.5 rounded-2xl overflow-hidden border border-purple-300/50 dark:border-purple-700/50 shadow-md">
                      <img
                        src={msg.image.previewUrl || msg.image.data}
                        alt="Uploaded scene or document"
                        onClick={() => setModalImage(msg.image?.previewUrl || msg.image?.data || null)}
                        className="max-h-72 w-full object-cover rounded-2xl cursor-zoom-in hover:opacity-95 transition-opacity"
                      />
                      {msg.image.fileName && (
                        <div className="px-3 py-1.5 text-xs bg-slate-900/90 text-white flex items-center justify-between">
                          <span className="truncate font-medium">{msg.image.fileName}</span>
                          <span className="text-fuchsia-300 font-semibold text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Multimodal Analysis</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Content or Error Card */}
                  {msg.error ? (
                    <div className="rounded-2xl p-4 bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-800 dark:text-rose-200">
                      <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>AI Response Not Available</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {msg.error}
                      </p>
                      {onRetryLastMessage && (
                        <button
                          type="button"
                          onClick={onRetryLastMessage}
                          className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Tap to Retry</span>
                        </button>
                      )}
                    </div>
                  ) : isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}

                  {/* Audio Player for Voice Responses */}
                  {!isUser && !msg.error && msg.audioBase64 && (
                    <div className="mt-3.5">
                      <AudioPlayer
                        text={msg.content}
                        audioBase64={msg.audioBase64}
                        language={msg.language}
                        provider={msg.audioProvider || 'gnani.ai'}
                      />
                    </div>
                  )}

                  {/* Assistant Message Actions Toolbar */}
                  {!isUser && !msg.error && (
                    <div className="mt-3.5 pt-2.5 border-t border-purple-100/60 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {!msg.audioBase64 && (
                          <button
                            type="button"
                            onClick={() => onPlayVoiceResponse(msg)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-purple-100/70 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium min-h-[36px] cursor-pointer"
                            title="Listen to spoken response"
                          >
                            <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>Listen</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors font-medium min-h-[36px] cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bookmark / Save Response Action */}
                      <button
                        type="button"
                        onClick={() => onBookmarkMessage(msg.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors font-medium min-h-[36px] cursor-pointer ${
                          msg.isBookmarked
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                        }`}
                        title={msg.isBookmarked ? 'Saved to bookmarks' : 'Save useful response'}
                      >
                        {msg.isBookmarked ? (
                          <>
                            <BookmarkCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Transcribing State indicator */}
          {(status === 'thinking' || status === 'transcribing') && (
            <div className="flex items-start gap-3 transition-opacity">
              <SolvaRobot status={status} size="compact" showAura={false} />
              <div className="p-4 rounded-3xl rounded-bl-xs bg-white/95 dark:bg-slate-900/95 border border-purple-200/60 dark:border-purple-800/50 shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {status === 'transcribing'
                      ? 'Transcribing Indic speech with Gnani AI...'
                      : 'SOLVA is reasoning in your language...'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Image inspection modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={modalImage}
            alt="Expanded visual scene"
            className="max-h-[92vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-purple-500/30"
          />
        </div>
      )}
    </div>
  );
};
