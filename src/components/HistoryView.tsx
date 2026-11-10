import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Bookmark,
  Trash2,
  ArrowRight,
  Clock,
  Copy,
  Check,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import { Conversation } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SolvaRobot } from './SolvaRobot';

interface HistoryViewProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  onToggleBookmark: (conversationId: string, messageId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all bookmarked messages across conversations
  const bookmarkedItems = conversations.flatMap((conv) =>
    conv.messages
      .filter((m) => m.isBookmarked && m.role === 'assistant')
      .map((m) => ({
        conversationId: conv.id,
        conversationTitle: conv.title,
        message: m,
      }))
  );

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage =
      selectedLanguageFilter === 'all' ||
      c.language.toLowerCase().includes(selectedLanguageFilter.toLowerCase());

    return matchesSearch && matchesLanguage;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
      {/* Top Header & New Chat CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-purple-200/60 dark:border-purple-900/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Conversations & Saved Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real persisted history stored locally and synchronized across your sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[40px] sm:min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewChat}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-95 shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all cursor-pointer min-h-[40px] sm:min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clear History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-purple-200/60 dark:border-purple-800/60">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Clear All Conversation History?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              This will permanently delete all stored chat sessions and bookmarked responses from this device.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm min-h-[44px] cursor-pointer"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search Filter Bar */}
      <div className="mt-5 sm:mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Segmented control */}
        <div className="grid grid-cols-2 p-1 bg-purple-100/60 dark:bg-purple-950/50 rounded-2xl border border-purple-200/50 dark:border-purple-900/40 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-purple-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">All ({conversations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-purple-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Saved ({bookmarkedItems.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-purple-200/60 dark:border-purple-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Tab 1: All Conversations */}
      {activeTab === 'all' && (
        <div className="mt-6 space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="p-14 text-center rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-purple-200 dark:border-purple-900">
              <SolvaRobot status="ready" size="compact" showAura={false} className="mx-auto mb-3" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                No conversations found
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Start a new conversation with SOLVA to see it recorded here.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200/60 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 solva-card-glow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div
                  onClick={() => onSelectConversation(conv.id)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {conv.language}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(conv.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium">{conv.messages.length} messages</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {conv.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mt-1 leading-relaxed">
                    {conv.preview || 'No messages yet'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onDeleteConversation(conv.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer min-w-[40px] min-h-[40px]"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectConversation(conv.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors cursor-pointer min-h-[40px]"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Saved / Bookmarked Responses */}
      {activeTab === 'saved' && (
        <div className="mt-6 space-y-5">
          {bookmarkedItems.length === 0 ? (
            <div className="p-14 text-center rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-purple-200 dark:border-purple-900">
              <Bookmark className="w-8 h-8 mx-auto text-purple-400 mb-2.5" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                No saved responses yet
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Click the Save icon on any SOLVA response to store it here for rapid reference.
              </p>
            </div>
          ) : (
            bookmarkedItems.map(({ conversationId, conversationTitle, message }) => (
              <div
                key={message.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200/60 dark:border-purple-800/50 solva-card-glow"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">
                    From: {conversationTitle}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopy(message.id, message.content)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-purple-600 transition-colors font-medium cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
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

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(conversationId, message.id)}
                      className="text-purple-600 hover:text-slate-400 transition-colors cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="text-base text-slate-800 dark:text-slate-200">
                  <MarkdownRenderer content={message.content} />
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(message.timestamp).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conversationId)}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in conversation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
