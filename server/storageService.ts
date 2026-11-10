import fs from 'fs';
import path from 'path';

export interface StoredConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  preview: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    language?: string;
    image?: {
      mimeType: string;
      data: string;
      fileName?: string;
    };
    audioUrl?: string;
    isBookmarked?: boolean;
    provider?: string;
  }>;
}

// In-memory fallback in case of read-only environments (such as Vercel serverless)
let inMemoryConversations: StoredConversation[] | null = null;

// Determine storage path (prefer ./data, fallback to /tmp or in-memory)
function getStorageFilePath(): string {
  if (process.env.VERCEL) {
    return path.resolve('/tmp', 'solva-conversations.json');
  }
  return path.resolve(process.cwd(), 'data', 'conversations.json');
}

function getInitialSeed(): StoredConversation[] {
  // Only real user-created conversations are preserved. No sample or dummy conversations.
  return [];
}

function ensureStorage(): string {
  const filePath = getStorageFilePath();
  const dirPath = path.dirname(filePath);

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
      inMemoryConversations = [];
    }
  } catch (err) {
    // If filesystem write fails, fallback to in-memory store
    if (!inMemoryConversations) {
      inMemoryConversations = [];
    }
  }
  return filePath;
}

export function getAllConversations(): StoredConversation[] {
  try {
    const filePath = ensureStorage();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      // Clean chat history: display strictly genuine user-created conversations
      const genuine = Array.isArray(parsed)
        ? parsed.filter((c: StoredConversation) => c && c.id && !c.id.startsWith('seed-conv-'))
        : [];
      inMemoryConversations = genuine;
      return genuine;
    }
  } catch (err) {
    // fallback
  }
  if (!inMemoryConversations) {
    inMemoryConversations = [];
  }
  return inMemoryConversations.filter((c) => c && c.id && !c.id.startsWith('seed-conv-'));
}

export function saveConversation(conversation: StoredConversation): StoredConversation {
  const list = getAllConversations();
  const idx = list.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...conversation, updatedAt: new Date().toISOString() };
  } else {
    list.unshift({ ...conversation, updatedAt: new Date().toISOString() });
  }

  inMemoryConversations = list;

  try {
    const filePath = ensureStorage();
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // Safe fallback to inMemoryConversations
  }
  return conversation;
}

export function deleteConversation(id: string): boolean {
  const list = getAllConversations();
  const filtered = list.filter((c) => c.id !== id);
  inMemoryConversations = filtered;

  try {
    const filePath = ensureStorage();
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (err) {
    // Safe fallback
  }
  return true;
}

export function clearAllConversations(): boolean {
  inMemoryConversations = [];
  try {
    const filePath = ensureStorage();
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Safe fallback
  }
  return true;
}

export function toggleMessageBookmark(conversationId: string, messageId: string): boolean {
  const list = getAllConversations();
  const conv = list.find((c) => c.id === conversationId);
  if (!conv) return false;
  const msg = conv.messages.find((m) => m.id === messageId);
  if (!msg) return false;
  msg.isBookmarked = !msg.isBookmarked;
  inMemoryConversations = list;

  try {
    const filePath = ensureStorage();
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // Safe fallback
  }
  return msg.isBookmarked;
}
