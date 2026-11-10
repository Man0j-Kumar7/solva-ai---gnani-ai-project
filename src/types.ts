export type ScreenMode = 'welcome' | 'assistant' | 'history' | 'settings';

export type AssistantStatus = 'ready' | 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'error';

export interface ChatImage {
  mimeType: string;
  data: string; // base64
  fileName?: string;
  previewUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
  image?: ChatImage;
  audioUrl?: string;
  audioBase64?: string;
  audioProvider?: 'gnani.ai' | 'browser' | 'none';
  isBookmarked?: boolean;
  model?: string;
  isStreaming?: boolean;
  error?: string;
  isHighDemand?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  preview: string;
  messages: Message[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  gnaniCode?: string;
  flag?: string;
}

export interface VoiceSettings {
  autoPlay: boolean;
  rate: number;
  pitch: number;
  gender: 'female' | 'male';
  voiceURI?: string;
}

export interface ConfigStatusResponse {
  gemini: {
    configured: boolean;
    model: string;
    multimodal: boolean;
  };
  gnani: {
    isConfigured: boolean;
    provider: 'gnani.ai';
    endpoints: {
      stt: string;
      tts: string;
    };
    supportedLanguages: Array<{
      code: string;
      name: string;
      nativeName: string;
      script: string;
    }>;
    statusMessage: string;
  };
  environment: string;
}
