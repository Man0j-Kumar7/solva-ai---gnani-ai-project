import { Conversation, ConfigStatusResponse, Message } from '../types';

export async function fetchConfigStatus(): Promise<ConfigStatusResponse> {
  const res = await fetch('/api/config-status');
  if (!res.ok) {
    throw new Error('Failed to retrieve system configuration status.');
  }
  return res.json();
}

export async function sendChatMessage(
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    image?: { mimeType: string; data: string };
  }>,
  preferredLanguage?: string
): Promise<{ text: string; detectedLanguage: string; model: string; isHighDemand?: boolean }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      preferredLanguage,
      clientTime: new Date().toISOString(),
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate response from Gemini.');
  }

  return {
    text: data.text,
    detectedLanguage: data.detectedLanguage || 'English',
    model: data.model || 'gemini-3.5-flash-lite',
    isHighDemand: Boolean(data.isHighDemand),
  };
}

export async function requestGnaniSTT(
  audioBase64: string,
  mimeType: string,
  languageCode: string
): Promise<{ success: boolean; transcript?: string; integrationReady?: boolean; error?: string }> {
  const res = await fetch('/api/voice/stt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, languageCode }),
  });

  return res.json();
}

export async function requestGnaniTTS(
  text: string,
  languageCode: string,
  voiceGender: 'female' | 'male' = 'female'
): Promise<{ success: boolean; audioBase64?: string; format?: string; integrationReady?: boolean; error?: string }> {
  const res = await fetch('/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, languageCode, voiceGender }),
  });

  return res.json();
}

export async function fetchAllConversations(): Promise<Conversation[]> {
  try {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    if (data.success && Array.isArray(data.conversations)) {
      return data.conversations;
    }
  } catch (err) {
    console.warn('Backend conversations fetch failed, fallback to local cache:', err);
  }
  return [];
}

export async function saveConversationToServer(conversation: Conversation): Promise<boolean> {
  try {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversation),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.warn('Failed to save conversation to backend:', err);
    return false;
  }
}

export async function deleteConversationFromServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.warn('Failed to delete conversation on server:', err);
    return false;
  }
}

export async function clearAllConversationsFromServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/conversations', {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.warn('Failed to clear conversations on server:', err);
    return false;
  }
}

export async function toggleBookmarkOnServer(conversationId: string, messageId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/conversations/${encodeURIComponent(conversationId)}/bookmark/${encodeURIComponent(messageId)}`,
      { method: 'POST' }
    );
    const data = await res.json();
    return Boolean(data.isBookmarked);
  } catch (err) {
    console.warn('Failed to toggle bookmark on server:', err);
    return false;
  }
}
