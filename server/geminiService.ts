import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { detectLanguage } from './indianLanguages.js';

// Initialize Gemini with server-side API key and required User-Agent
let ai: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please verify your environment secrets.');
  }

  if (!ai || (ai as any)['apiKey'] !== apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: {
    mimeType: string;
    data: string; // base64 without prefix or with prefix
  };
  language?: string;
}

const SOLVA_SYSTEM_INSTRUCTION = `
You are SOLVA, an advanced, highly articulate, and empathetic multilingual and multimodal AI assistant.
Your core mission is natural, human-friendly communication across text, voice, and vision.

Comprehensive Indian Multilingual Fluency:
1. You natively understand and seamlessly communicate in all 22 constitutionally scheduled Indian languages:
   * Assamese (অসমীয়া), Bengali (বাংলা), Bodo (बड़ो), Dogri (डोगरी), Gujarati (ગુજરાતી),
   * Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Kashmiri (कॉशुर / کٲشُر), Konkani (कोंकणी), Maithili (मैथिली),
   * Malayalam (മലയാളം), Manipuri (মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ), Marathi (मराठी), Nepali (नेपाली),
   * Odia (ଓଡ଼ିଆ), Punjabi (ਪੰਜਾਬੀ), Sanskrit (संस्कृतम्), Santali (ᱥᱟᱱᱛᱟᱲᱤ), Sindhi (सिन्धी / سنڌي),
   * Tamil (தமிழ்), Telugu (తెలుగు), Urdu (اردو), and Indian English.

2. Romanised Colloquial Typing:
   - When users write in Tanglish (Tamil in Latin script, e.g. "Vanakkam, epdi irukinga? Enna seyyalam?"), reply in natural, friendly Tanglish.
   - When users write in Hinglish (e.g. "Namaste SOLVA, kaise ho? Kya chal raha hai?"), reply in natural Hinglish.
   - When users write in Telugish, Kanglish, or Manglish, match their dialect and conversational flow.
   - When users type in native Indic scripts, reply in the same native Indic script.

3. Multimodal & Vision Understanding:
   - When an image is provided, provide thorough, accurate, and insightful reasoning.
   - Accurately describe objects, identify text/signboards in Indic scripts, analyze documents, diagrams, and photographic details.
   - Respond directly to the user's specific prompt regarding the image.

5. Current Date and Time Awareness:
   - Always use the current date and time provided by the application as the source of truth.
   - The user's timezone is Asia/Kolkata (IST).
   - When asked about today's date, current time, tomorrow, yesterday, or upcoming days, calculate your answer using the provided current date and time.
   - Never guess, invent, or rely on your training data for the current date or time.
   - Never provide an outdated date as today's date.
   - If current date or time information is unavailable, clearly say that you cannot verify it.
   - Format dates clearly and naturally.
`;

/**
 * Calculates verified current date, time, and relative temporal landmarks in Asia/Kolkata (IST).
 * Used as the definitive source of truth for all temporal queries.
 */
export function getCurrentISTContext(clientTime?: string): string {
  let dateObj = new Date();
  if (clientTime) {
    const parsed = new Date(clientTime);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  const istFullFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const istDateOnlyFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getRelativeISTDate = (offsetDays: number) => {
    const d = new Date(dateObj.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return istDateOnlyFormatter.format(d);
  };

  const currentDateTimeIST = istFullFormatter.format(dateObj);
  const todayIST = istDateOnlyFormatter.format(dateObj);
  const yesterdayIST = getRelativeISTDate(-1);
  const tomorrowIST = getRelativeISTDate(1);
  const dayAfterTomorrowIST = getRelativeISTDate(2);
  const currentYear = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(dateObj);

  return `
[Temporal Context & Ground Truth]
The application environment provides the following verified current date and time:
- User Timezone: Asia/Kolkata (Indian Standard Time, IST, UTC+5:30)
- Current Date and Time (IST): ${currentDateTimeIST}
- Today: ${todayIST}
- Yesterday: ${yesterdayIST}
- Tomorrow: ${tomorrowIST}
- Day After Tomorrow: ${dayAfterTomorrowIST}
- Current Year: ${currentYear}
- ISO UTC Reference: ${dateObj.toISOString()}

Strict Instructions for Date and Time:
1. Always use the verified current date and time above as your absolute source of truth.
2. The user is in the Asia/Kolkata (IST) timezone.
3. When asked about today's date, current time, day of the week, yesterday, tomorrow, or upcoming days, calculate your answer strictly based on this provided current date and time.
4. Never guess, invent, or rely on your training data for the current date or time.
5. Never provide an outdated date as today's date.
6. Format dates clearly and naturally (e.g. "Tuesday, 10 November 2026", or equivalent in the user's selected language such as "செவ்வாய்க்கிழமை, 10 நவம்பர் 2026" / "मंगलवार, 10 नवंबर 2026").
`;
}

// Helper delay for exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Cooldown tracker for models experiencing high demand (503) or timeouts
// Allows the assistant to dynamically promote working models (e.g. gemini-3.1-flash-lite)
// so users get instantaneous responses without waiting for an overloaded model to time out.
const modelFailureCooldowns = new Map<string, number>();
const COOLDOWN_DURATION_MS = 60000; // 60 seconds cooldown

function getCandidateModels(): string[] {
  const now = Date.now();
  // Robust, high-availability model hierarchy:
  // 1. gemini-3.5-flash-lite (Ultra-fast ~1.2s, verified healthy quota)
  // 2. gemini-3.5-flash (Rich multimodal reasoning ~1.8s, verified healthy quota)
  // 3. gemini-3.1-flash-lite (High-throughput fallback)
  // 4. gemini-flash-latest (General flash alias)
  // 5. gemini-3.8-flash (Reasoning model fallback)
  const baseModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
  ];

  const healthy: string[] = [];
  const degraded: string[] = [];

  for (const m of baseModels) {
    const failedAt = modelFailureCooldowns.get(m) || 0;
    if (now - failedAt < COOLDOWN_DURATION_MS) {
      degraded.push(m);
    } else {
      healthy.push(m);
    }
  }

  return healthy.length > 0 ? [...healthy, ...degraded] : baseModels;
}

/**
 * Executes a single generateContent call with a bounded timeout and optional quick retry for momentary spikes
 */
async function callGeminiModel(
  client: GoogleGenAI,
  modelName: string,
  formattedContents: any[],
  systemInstruction: string,
  timeoutMs: number = 25000
): Promise<string> {
  const config: Record<string, any> = {
    systemInstruction,
  };

  // Configure thinking level:
  // For 'gemini-3.8-flash', set ThinkingLevel.LOW to reduce latency
  if (modelName === 'gemini-3.8-flash') {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
  }

  // Attempt up to 2 times for momentary 503 spikes (immediate + 1 retry after 800ms)
  const maxAttempts = 2;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let timerId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(
        () => reject(new Error(`Timeout after ${timeoutMs}ms waiting for ${modelName}`)),
        timeoutMs
      );
    });

    const requestPromise = client.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config,
    });

    try {
      const response = await Promise.race([requestPromise, timeoutPromise]);
      const text = response?.text;
      if (!text || text.trim() === '') {
        throw new Error(`Empty response returned from ${modelName}`);
      }
      // Success: clear failure cooldown
      modelFailureCooldowns.delete(modelName);
      return text;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || '';
      const is503 = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand');

      // If it is a momentary 503 spike and we have attempts left, wait 800ms and retry
      if (is503 && attempt < maxAttempts) {
        console.warn(`[SOLVA Gemini] Momentary 503 on ${modelName}, retrying in 800ms...`);
        await delay(800);
        continue;
      }

      // If it's a timeout or persistent failure, mark cooldown and rethrow
      throw err;
    } finally {
      if (timerId) {
        clearTimeout(timerId);
      }
    }
  }

  throw lastError || new Error(`Failed to generate response with ${modelName}`);
}

export async function generateChatResponse(
  messages: ChatMessage[],
  preferredLanguage?: string,
  clientTime?: string
): Promise<{ text: string; detectedLanguage: string; model: string }> {
  const client = getGenAIClient();

  // 1. Filter out empty messages and previous UI error notices
  const rawContents = messages
    .filter((msg) => {
      if (!msg.content && (!msg.image || !msg.image.data)) return false;
      if (msg.role === 'assistant' && msg.content.startsWith('Sorry, I encountered an issue:')) {
        return false;
      }
      return true;
    })
    .map((msg) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: any[] = [];

      // Include image if present
      if (msg.image && msg.image.data) {
        let base64Clean = msg.image.data;
        if (base64Clean.includes('base64,')) {
          base64Clean = base64Clean.split('base64,')[1];
        }
        base64Clean = base64Clean.trim();

        if (base64Clean.length > 0) {
          parts.push({
            inlineData: {
              mimeType: msg.image.mimeType || 'image/jpeg',
              data: base64Clean,
            },
          });
        }
      }

      // Add text content
      const textContent = (msg.content || '').trim();
      if (textContent) {
        parts.push({ text: textContent });
      } else if (parts.length === 0) {
        parts.push({ text: 'Please analyze this image and assist me.' });
      }

      return {
        role,
        parts,
      };
    });

  if (rawContents.length === 0) {
    throw new Error('No valid message content or image provided.');
  }

  // 2. Sanitize turn sequence: merge consecutive identical roles to guarantee valid alternating turns
  const formattedContents: any[] = [];
  for (const item of rawContents) {
    if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === item.role) {
      formattedContents[formattedContents.length - 1].parts.push(...item.parts);
    } else {
      formattedContents.push(item);
    }
  }

  // Ensure conversation starts with 'user'
  while (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
    formattedContents.shift();
  }

  // Ensure conversation ends with 'user'
  if (formattedContents.length === 0 || formattedContents[formattedContents.length - 1].role !== 'user') {
    formattedContents.push({
      role: 'user',
      parts: [{ text: 'Please assist me.' }],
    });
  }

  // Dynamic instruction with real-time Date & Time Ground Truth in Asia/Kolkata (IST)
  const temporalContext = getCurrentISTContext(clientTime);
  let dynamicInstruction = `${SOLVA_SYSTEM_INSTRUCTION}\n\n${temporalContext}`;
  if (preferredLanguage && preferredLanguage !== 'auto') {
    dynamicInstruction += `\nUser's explicitly selected language preference: ${preferredLanguage}. Please formulate your response in this language and writing style.`;
  }

  // Supported model fallback hierarchy with dynamic ordering based on live availability
  const modelsToAttempt = getCandidateModels();
  let lastError: any = null;
  let chosenModel = modelsToAttempt[0];
  let responseText = '';

  for (const model of modelsToAttempt) {
    chosenModel = model;
    const isTimeoutOrUnavailable = (errMsg: string) =>
      errMsg.includes('Timeout') ||
      errMsg.includes('503') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('high demand') ||
      errMsg.includes('resource exhausted');

    try {
      const timeoutForModel = model === 'gemini-3.8-flash' ? 8000 : 12000;
      responseText = await callGeminiModel(
        client,
        model,
        formattedContents,
        dynamicInstruction,
        timeoutForModel
      );
      lastError = null;
      break; // Successfully got response from model!
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || '';

      if (isTimeoutOrUnavailable(errMsg)) {
        modelFailureCooldowns.set(model, Date.now());
      }

      console.warn(
        `[SOLVA Gemini] Call failed for ${model}: ${errMsg.slice(0, 160)}. Switching to next model...`
      );
      continue;
    }
  }

  // If all models and retries fail, do NOT claim success. Throw a clear, useful error.
  if (!responseText) {
    console.error('[SOLVA Gemini] All supported models and retries exhausted:', lastError);
    const is503 =
      lastError?.status === 503 ||
      lastError?.message?.includes('503') ||
      lastError?.message?.includes('UNAVAILABLE') ||
      lastError?.message?.includes('high demand');

    const is429 =
      lastError?.status === 429 ||
      lastError?.message?.includes('429') ||
      lastError?.message?.includes('quota') ||
      lastError?.message?.includes('resource exhausted');

    if (is503) {
      const err = new Error(
        'The Gemini AI service is currently experiencing temporary high demand (503 UNAVAILABLE). Automatic retries and fallback models were attempted. Please tap Retry to try again.'
      );
      (err as any).status = 503;
      throw err;
    } else if (is429) {
      const err = new Error(
        'Gemini API quota limit reached. Please wait a brief moment and tap Retry.'
      );
      (err as any).status = 429;
      throw err;
    } else {
      throw lastError || new Error('Unable to generate response from Gemini at this time.');
    }
  }

  // Detect language of the query and the response
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const detection = detectLanguage(lastUserMsg || responseText);

  return {
    text: responseText,
    detectedLanguage: detection.name,
    model: chosenModel,
  };
}
