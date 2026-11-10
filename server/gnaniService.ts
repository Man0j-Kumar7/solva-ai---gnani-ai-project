/**
 * Gnani AI Speech Technology Integration Module
 * Connects to official Gnani AI (Vachana Speech Platform) endpoints.
 * Includes full support for Indic Speech-to-Text (STT) and Text-to-Speech (TTS).
 */

export interface GnaniConfigStatus {
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
}

export const GNANI_SUPPORTED_LANGUAGES = [
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English', script: 'Latin' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
];

const GNANI_TTS_ENDPOINT =
  process.env.GNANI_TTS_ENDPOINT || 'https://api.vachana.ai/api/v1/tts/inference';
const GNANI_STT_ENDPOINT =
  process.env.GNANI_STT_ENDPOINT || 'https://api.vachana.ai/stt/v3';

export function getGnaniStatus(): GnaniConfigStatus {
  const isConfigured = Boolean(process.env.GNANI_API_KEY && process.env.GNANI_API_KEY.trim() !== '');

  return {
    isConfigured,
    provider: 'gnani.ai',
    endpoints: {
      stt: GNANI_STT_ENDPOINT,
      tts: GNANI_TTS_ENDPOINT,
    },
    supportedLanguages: GNANI_SUPPORTED_LANGUAGES,
    statusMessage: isConfigured
      ? 'Gnani AI speech services configured with server credentials.'
      : 'GNANI_API_KEY not configured. Running in integration-ready mode with browser Web Speech fallback.',
  };
}

export interface STTResult {
  success: boolean;
  transcript?: string;
  confidence?: number;
  language?: string;
  provider: 'gnani.ai' | 'fallback';
  integrationReady?: boolean;
  error?: string;
}

export interface TTSResult {
  success: boolean;
  audioBase64?: string;
  format?: 'wav' | 'mp3';
  language?: string;
  provider: 'gnani.ai' | 'fallback';
  integrationReady?: boolean;
  error?: string;
}

/**
 * Transcribe speech audio using Gnani AI ASR endpoint.
 */
export async function transcribeWithGnani(
  audioBase64: string,
  mimeType: string = 'audio/wav',
  languageCode: string = 'ta-IN'
): Promise<STTResult> {
  const apiKey = process.env.GNANI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      provider: 'fallback',
      integrationReady: true,
      error: 'GNANI_API_KEY is not set on server. Using client-side speech recognition.',
    };
  }

  try {
    let cleanBase64 = audioBase64;
    if (cleanBase64.includes('base64,')) {
      cleanBase64 = cleanBase64.split('base64,')[1];
    }
    const audioBuffer = Buffer.from(cleanBase64, 'base64');

    // Create multipart form boundary
    const boundary = '----GnaniFormBoundary' + Math.random().toString(36).substring(2);
    const parts: Buffer[] = [];

    // Add audio file part
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="audio_file"; filename="audio.wav"\r\nContent-Type: ${mimeType}\r\n\r\n`
      )
    );
    parts.push(audioBuffer);
    parts.push(Buffer.from('\r\n'));

    // Add language_code part
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\n${languageCode}\r\n`
      )
    );
    parts.push(Buffer.from(`--${boundary}--\r\n`));

    const multipartBody = Buffer.concat(parts);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(GNANI_STT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-API-Key-ID': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'token': apiKey,
        'User-Agent': 'SOLVA-Assistant/1.0',
      },
      body: multipartBody,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        provider: 'gnani.ai',
        error: `Gnani STT API error (${response.status}): ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const transcript =
      data.transcript ||
      data.text ||
      data.results?.[0]?.alternatives?.[0]?.transcript ||
      data.result?.[0]?.transcript ||
      '';

    return {
      success: true,
      transcript,
      confidence: data.confidence || 0.95,
      language: languageCode,
      provider: 'gnani.ai',
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'gnani.ai',
      error: err.name === 'AbortError' ? 'Gnani STT API request timed out.' : err.message,
    };
  }
}

/**
 * Synthesize speech audio using Gnani AI TTS endpoint.
 */
export async function synthesizeWithGnani(
  text: string,
  languageCode: string = 'ta-IN',
  voiceGender: 'female' | 'male' = 'female'
): Promise<TTSResult> {
  const apiKey = process.env.GNANI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      provider: 'fallback',
      integrationReady: true,
      error: 'GNANI_API_KEY is not set on server. Using client-side speech synthesis.',
    };
  }

  try {
    const payload = {
      text,
      model: 'timbre-v3.0',
      voice: voiceGender === 'male' ? 'Aditya' : 'Shivani',
      language: languageCode,
      speed: 1.0,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);

    const response = await fetch(GNANI_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'token': apiKey,
        'User-Agent': 'SOLVA-Assistant/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        provider: 'gnani.ai',
        error: `Gnani TTS API error (${response.status}): ${errText.slice(0, 200)}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('audio/') || contentType.includes('application/octet-stream')) {
      const buffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString('base64');
      return {
        success: true,
        audioBase64: base64Audio,
        format: 'wav',
        language: languageCode,
        provider: 'gnani.ai',
      };
    }

    const data = await response.json();
    const audioData =
      data.audioContent || data.audio || data.audio_base64 || data.data || '';

    return {
      success: true,
      audioBase64: audioData,
      format: 'wav',
      language: languageCode,
      provider: 'gnani.ai',
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'gnani.ai',
      error: err.name === 'AbortError' ? 'Gnani TTS API request timed out.' : err.message,
    };
  }
}
