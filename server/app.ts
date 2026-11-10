import express from 'express';
import dotenv from 'dotenv';
import { generateChatResponse, ChatMessage } from './geminiService.js';
import {
  transcribeWithGnani,
  synthesizeWithGnani,
  getGnaniStatus,
} from './gnaniService.js';
import {
  getAllConversations,
  saveConversation,
  deleteConversation,
  clearAllConversations,
  toggleMessageBookmark,
  StoredConversation,
} from './storageService.js';

dotenv.config();

export const app = express();

// Middleware with generous payload limits for audio and images
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// ----------------------------------------------------
// System Health & Configuration Inspection
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SOLVA Full-Stack Engine',
    timestamp: new Date().toISOString(),
  });
});


app.get('/api/config-status', (req, res) => {
  const geminiAvailable = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  const gnaniStatus = getGnaniStatus();

  res.json({
    gemini: {
      configured: geminiAvailable,
      model: 'gemini-3.5-flash-lite',
      multimodal: true,
    },
    gnani: gnaniStatus,
    environment: process.env.NODE_ENV || 'development',
  });
});


// ----------------------------------------------------
// Gemini Multilingual & Multimodal Reasoning
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, preferredLanguage, clientTime } = req.body as {
      messages: ChatMessage[];
      preferredLanguage?: string;
      clientTime?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const result = await generateChatResponse(messages, preferredLanguage, clientTime);

    res.json({
      success: true,
      text: result.text,
      detectedLanguage: result.detectedLanguage,
      model: result.model,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    const statusCode = err.status || (err.message?.includes('503') ? 503 : err.message?.includes('429') ? 429 : 500);
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to generate response from Gemini.',
      statusCode,
    });
  }
});

// ----------------------------------------------------
// Gnani AI Speech-to-Text (STT)
// ----------------------------------------------------
app.post('/api/voice/stt', async (req, res) => {
  try {
    const { audioBase64, mimeType, languageCode } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        error: 'Audio content (audioBase64) is required for transcription.',
      });
    }

    const result = await transcribeWithGnani(audioBase64, mimeType || 'audio/wav', languageCode || 'ta-IN');

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/voice/stt:', err);
    res.status(500).json({
      success: false,
      provider: 'gnani.ai',
      error: err.message || 'Internal error during speech transcription.',
    });
  }
});

// ----------------------------------------------------
// Gnani AI Text-to-Speech (TTS)
// ----------------------------------------------------
app.post('/api/voice/tts', async (req, res) => {
  try {
    const { text, languageCode, voiceGender } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Text is required for speech synthesis.',
      });
    }

    const result = await synthesizeWithGnani(
      text,
      languageCode || 'ta-IN',
      voiceGender || 'female'
    );

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/voice/tts:', err);
    res.status(500).json({
      success: false,
      provider: 'gnani.ai',
      error: err.message || 'Internal error during speech synthesis.',
    });
  }
});

// ----------------------------------------------------
// Conversation & Bookmark Persistent Storage
// ----------------------------------------------------
app.get('/api/conversations', (req, res) => {
  try {
    const list = getAllConversations();
    res.json({ success: true, conversations: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/conversations', (req, res) => {
  try {
    const conversation = req.body as StoredConversation;
    if (!conversation || !conversation.id) {
      return res.status(400).json({ error: 'Valid conversation payload is required.' });
    }
    const saved = saveConversation(conversation);
    res.json({ success: true, conversation: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/conversations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ok = deleteConversation(id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/conversations', (req, res) => {
  try {
    const ok = clearAllConversations();
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/conversations/:id/bookmark/:messageId', (req, res) => {
  try {
    const { id, messageId } = req.params;
    const isBookmarked = toggleMessageBookmark(id, messageId);
    res.json({ success: true, isBookmarked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
