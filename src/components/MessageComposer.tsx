import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Image as ImageIcon,
  Send,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { AssistantStatus, ChatImage } from '../types';
import { speechService } from '../services/speech';

interface MessageComposerProps {
  status: AssistantStatus;
  selectedLanguage: string;
  onSendMessage: (text: string, image?: ChatImage) => void;
  onVoiceTranscription: (transcript: string) => void;
  onStatusChange: (status: AssistantStatus) => void;
  onError: (msg: string) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  status,
  selectedLanguage,
  onSendMessage,
  onVoiceTranscription,
  onStatusChange,
  onError,
}) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<ChatImage | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);
  const speechFallbackStopperRef = useRef<(() => void) | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [text]);

  // Support paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          handleProcessImageFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechFallbackStopperRef.current) speechFallbackStopperRef.current();
    };
  }, []);

  /**
   * Client-side image optimizer: Resizes high-res images to max 1600px width/height
   * Prevents large base64 strings from choking network or causing upload timeouts
   */
  const handleProcessImageFile = (file: File) => {
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessingImage(false);
          onError('Failed to initialize image processor.');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setSelectedImage({
          mimeType: 'image/jpeg',
          data: optimizedDataUrl,
          fileName: file.name,
          previewUrl: optimizedDataUrl,
        });
        setIsProcessingImage(false);
      };

      img.onerror = () => {
        setIsProcessingImage(false);
        onError('Could not load image format.');
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessingImage(false);
      onError('Failed to read image file.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessImageFile(e.target.files[0]);
    }
  };

  // ----------------------------------------------------
  // Voice Recording & Gnani AI / Web Speech Handler
  // ----------------------------------------------------
  const startVoiceRecording = async () => {
    try {
      setIsRecording(true);
      setRecordDuration(0);
      onStatusChange('listening');

      await speechService.startRecording((vol) => {
        setAudioVolume(vol);
      });

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      // Browser live speech stream
      const stopFallback = speechService.listenWithBrowserSpeech(
        selectedLanguage,
        (liveTranscript) => {
          if (liveTranscript) {
            setText(liveTranscript);
          }
        },
        (err) => {
          console.debug('Browser speech stream note:', err);
        }
      );
      speechFallbackStopperRef.current = stopFallback;
    } catch (err: any) {
      stopVoiceRecording(true);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.message?.includes('Permission denied') ||
        err?.message?.includes('denied');

      if (isDenied) {
        onError('Microphone access was not granted. Please allow microphone permission in your browser address bar to speak with SOLVA.');
      } else {
        onError(err?.message || 'Could not access microphone.');
      }
    }
  };

  const stopVoiceRecording = async (cancel = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (speechFallbackStopperRef.current) {
      speechFallbackStopperRef.current();
      speechFallbackStopperRef.current = null;
    }

    setIsRecording(false);
    setAudioVolume(0);

    if (cancel) {
      speechService.cancelRecording();
      onStatusChange('ready');
      return;
    }

    onStatusChange('transcribing');

    try {
      const audioResult = await speechService.stopRecording();

      if (!audioResult || !audioResult.base64) {
        onStatusChange('ready');
        return;
      }

      const langMapping: Record<string, string> = {
        ta: 'ta-IN',
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        bn: 'bn-IN',
        pa: 'pa-IN',
        tanglish: 'ta-IN',
        hinglish: 'hi-IN',
        auto: 'ta-IN',
      };
      const gnaniCode = langMapping[selectedLanguage] || 'ta-IN';

      const res = await fetch('/api/voice/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioResult.base64,
          mimeType: audioResult.mimeType,
          languageCode: gnaniCode,
        }),
      });

      const sttData = await res.json();

      if (sttData.success && sttData.transcript) {
        setText(sttData.transcript);
        onVoiceTranscription(sttData.transcript);
      } else if (text.trim()) {
        onVoiceTranscription(text.trim());
      } else if (sttData.error && !sttData.integrationReady) {
        onError(`Gnani STT: ${sttData.error}`);
      }
    } catch (err: any) {
      console.warn('STT request error:', err);
      if (text.trim()) {
        onVoiceTranscription(text.trim());
      }
    } finally {
      onStatusChange('ready');
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !selectedImage) return;

    if (isRecording) {
      stopVoiceRecording(true);
    }

    const imageToSend = selectedImage ? { ...selectedImage } : undefined;
    const promptToSend = trimmed || (selectedImage ? 'Please analyze this image in detail and describe its contents.' : '');

    setText('');
    setSelectedImage(null);
    onSendMessage(promptToSend, imageToSend);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2.5 sm:px-4 md:px-6 pb-2.5 sm:pb-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Floating Main Box with Rich Gradients & Lighting */}
      <div className="relative rounded-2xl md:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-purple-200/80 dark:border-purple-800/60 shadow-xl shadow-purple-500/15 p-2 sm:p-2.5 md:p-3.5 transition-all">
        {/* Selected Image Thumbnail preview banner */}
        {selectedImage && (
          <div className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-2.5 mb-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-purple-300/60 dark:border-purple-700/60">
            <img
              src={selectedImage.previewUrl || selectedImage.data}
              alt="Uploaded visual context"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover border border-purple-300 dark:border-purple-600 shadow-sm shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {selectedImage.fileName || 'Attached Image'}
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-fuchsia-500 shrink-0" />
                <span className="truncate">Ready for Gemini vision</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Recording HUD */}
        {isRecording && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 mb-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-fuchsia-600/15 via-purple-600/15 to-sky-600/15 border border-fuchsia-400/50 dark:border-fuchsia-700/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-ping shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-fuchsia-900 dark:text-fuchsia-100">
                Listening ({formatTimer(recordDuration)})
              </span>
              <div className="hidden sm:flex items-center gap-0.5 ml-2">
                {[30, 80, 50, 100, 60, 40, 90, 70].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-fuchsia-500 to-sky-400 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(6, (audioVolume / 100) * (h / 3.2))}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => stopVoiceRecording(true)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-h-[36px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => stopVoiceRecording(false)}
                className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-95 transition-colors shadow-sm min-h-[36px] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-1.5 sm:gap-2.5">
          {/* Image Upload Trigger */}
          <button
            type="button"
            disabled={isProcessingImage}
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] cursor-pointer"
            title="Upload an image to ask questions"
            aria-label="Upload image"
          >
            {isProcessingImage ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
          </button>

          {/* Text Area with Enhanced Readability & No iOS Zoom */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedLanguage === 'ta'
                ? 'SOLVAவிடம் கேளுங்கள் (தமிழ்)...'
                : selectedLanguage === 'tanglish'
                ? 'Ask in Tanglish (e.g. Ooty trip plan panlam)...'
                : selectedLanguage === 'hi' || selectedLanguage === 'hinglish'
                ? 'SOLVA से कुछ भी पूछें (हिन्दी / Hinglish)...'
                : selectedLanguage === 'te'
                ? 'SOLVAని ఏదైనా అడగండి (తెలుగు)...'
                : selectedLanguage === 'kn'
                ? 'SOLVA ಬಳಿ ಏನಾದರೂ ಕೇಳಿ (ಕನ್ನಡ)...'
                : selectedLanguage === 'ml'
                ? 'SOLVAയോട് എന്തും ചോദിക്കൂ (മലയാളം)...'
                : 'Ask SOLVA anything in any language...'
            }
            className="flex-1 min-w-0 max-h-36 sm:max-h-40 py-2 px-1.5 sm:px-2 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent resize-none focus:outline-none leading-relaxed"
          />

          {/* Voice Microphone Trigger */}
          <button
            type="button"
            onClick={isRecording ? () => stopVoiceRecording(false) : startVoiceRecording}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] cursor-pointer ${
              isRecording
                ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/40 animate-pulse'
                : 'text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60'
            }`}
            title={isRecording ? 'Stop recording voice' : 'Speak with Gnani AI voice recognition'}
            aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Trigger */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && !selectedImage) || status === 'thinking'}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] ${
              (text.trim() || selectedImage) && status !== 'thinking'
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-sky-500 text-white shadow-lg shadow-purple-500/30 hover:opacity-95 active:scale-95 cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
