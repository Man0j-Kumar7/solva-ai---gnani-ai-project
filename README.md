# SOLVA — Multilingual, Multimodal AI Assistant

> An original, production-grade multimodal AI companion engineered for natural human communication through **text**, **voice**, and **vision**, natively adapting across India's **22 constitutionally scheduled languages**, colloquial Romanised styles (Tanglish, Hinglish), and global languages.

---

## 🤖 1. SOLVA's Signature Robot Mascot

SOLVA features an original, futuristic 3D-style robot mascot designed from first principles:
- **Interactive Personality**: Features expressive glowing eyes, natural blinking every 3.5s, subtle head tilting, and smooth floating levitation.
- **Visual Feedback**:
  - **Idle / Ready**: Warm cyan-violet pill eyes with sentient micro-blinks and gentle breathing hover.
  - **Listening**: Eyes widen in friendly attention; dual ear antenna pods pulse with live sound wave rings reacting to voice volume.
  - **Thinking / Transcribing**: Eyes shift into an active swirling orbit scanning pattern with ambient lavender illumination.
  - **Speaking**: Eyes curve into happy arches (`^ ^`) while a 4-bar dynamic audio equalizer mouth pulses in rhythm with the voice.
- **Lightweight & Smooth**: Built with 100% hardware-accelerated vector SVG and CSS transforms, ensuring 60fps performance on mobile and desktop without heavy 3D asset downloads.

---

## 🎵 2. SOLVA's Unique Reply Sound

SOLVA includes an original, copyright-free signature audio chime synthesized via the Web Audio API:
- **Acoustic Design**: A soft, futuristic 3-note ascending arpeggio chord (Eb5 &rarr; G5 &rarr; Bb5) with exponential decay and a warm 3200Hz low-pass filter.
- **Non-Intrusive**: Plays once when SOLVA finishes generating a response (never spams on streaming text chunks).
- **Controls**: Includes an on/off toggle, volume slider, and a "Play Sample" preview in **Settings**. Respects browser autoplay restrictions.

---

## 🇮🇳 3. 22 Indian Languages & Colloquial Intelligence

SOLVA features a dedicated language engine supporting all **22 constitutionally scheduled Indian languages** from the Eighth Schedule:

| # | Language | Native Script | Romanised / Colloquial Style | Gnani AI Voice |
|---|----------|---------------|------------------------------|----------------|
| 1 | **Tamil** | தமிழ் | Tanglish (*"Vanakkam, epdi irukinga?"*) | ✅ STT + TTS (`ta-IN`) |
| 2 | **Hindi** | हिन्दी | Hinglish (*"Namaste, kaise ho aap?"*) | ✅ STT + TTS (`hi-IN`) |
| 3 | **Telugu** | తెలుగు | Telugish (*"Ela unnaru?"*) | ✅ STT + TTS (`te-IN`) |
| 4 | **Kannada** | ಕನ್ನಡ | Kanglish (*"Hegiddira?"*) | ✅ STT + TTS (`kn-IN`) |
| 5 | **Malayalam** | മലയാളം | Manglish (*"Engane und?"*) | ✅ STT + TTS (`ml-IN`) |
| 6 | **Bengali** | বাংলা | Benglish | ✅ STT + TTS (`bn-IN`) |
| 7 | **Marathi** | मराठी | Marathish | ✅ STT + TTS (`mr-IN`) |
| 8 | **Gujarati** | ગુજરાતી | Gujaratinglish | ✅ STT + TTS (`gu-IN`) |
| 9 | **Punjabi** | ਪੰਜਾਬੀ | Punjabish | ✅ STT + TTS (`pa-IN`) |
| 10 | **Odia** | ଓଡ଼ିଆ | — | 🌐 Gemini Text Reasoning |
| 11 | **Assamese** | অসমীয়া | — | 🌐 Gemini Text Reasoning |
| 12 | **Urdu** | اردو | — | 🌐 Gemini Text Reasoning |
| 13 | **Sanskrit** | संस्कृतम् | — | 🌐 Gemini Text Reasoning |
| 14 | **Kashmiri** | कॉशुर / کٲشُر | — | 🌐 Gemini Text Reasoning |
| 15 | **Nepali** | नेपाली | — | 🌐 Gemini Text Reasoning |
| 16 | **Konkani** | कोंकणी | — | 🌐 Gemini Text Reasoning |
| 17 | **Maithili** | मैथिली | — | 🌐 Gemini Text Reasoning |
| 18 | **Sindhi** | सिन्धी / سنڌي | — | 🌐 Gemini Text Reasoning |
| 19 | **Dogri** | डोगरी | — | 🌐 Gemini Text Reasoning |
| 20 | **Manipuri** | মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ | — | 🌐 Gemini Text Reasoning |
| 21 | **Bodo** | बड़ो | — | 🌐 Gemini Text Reasoning |
| 22 | **Santali** | ᱥᱟᱱᱛᱟᱲᱤ | — | 🌐 Gemini Text Reasoning |

- **Confidence-Aware Detection**: Combines Unicode script range analysis with colloquial vocabulary matchers and Gemini metadata.
- **Graceful Speech Fallback**: If a language does not have a native voice model in Gnani AI, SOLVA explains the limitation gracefully and carries out reasoning via Gemini text.

---

## 🎙️ 4. Real Gnani AI Voice Integration

- **Speech-to-Text (ASR)**: Endpoint `https://asr.gnani.ai/v1/recognize`.
  - Captures microphone audio using the Web Audio API with live volume monitoring.
  - Automatically sends base64 audio and language code securely through the backend.
- **Text-to-Speech (TTS)**: Endpoint `https://tts.gnani.ai/v1/synthesize`.
  - Sends clean text to Gnani TTS and returns native Indic voice audio for in-app playback.
- **Zero Exposed Secrets**: `GNANI_API_KEY` is kept exclusively on the server side.
- **Integration Ready**: If `GNANI_API_KEY` is not present, SOLVA transparently operates with browser Web Speech fallbacks while indicating integration status.

---

## 🖼️ 5. Fixed & Optimized Multimodal Vision

- **Client-Side Canvas Downscaling**: Automatically optimizes large smartphone photos to a maximum dimension of 1600px before base64 encoding. Reduces payload size from 10MB+ down to ~300KB, preventing network timeouts.
- **Robust Multi-Turn Context**: Images are retained on their corresponding turn without duplicating multi-megabyte payloads in subsequent turns.
- **Timeout Protection**: Strict 35-second promise race ensures the UI never hangs indefinitely on `thinking`.

---

## 🔔 6. Browser Notifications

- **Privacy-Respecting Opt-in**: Prompts for permission in **Settings** rather than spamming on first page load.
- **Background Only**: Dispatches notifications (`SOLVA has replied...`) only when the window is in the background (`document.hidden`), keeping the user informed without distraction.

---

## 🚀 7. Vercel Deployment Guide

SOLVA is structured for 1-click deployment on **Vercel** with full serverless backend functionality:

### Vercel Architecture
- `vercel.json`: Rewrites `/api/(.*)` to serverless endpoint `/api/index.ts` and routes everything else to Vite SPA (`dist`).
- `api/index.ts`: Serverless function exporting the Express application.
- `server/storageService.ts`: Automatically detects Vercel environments (`process.env.VERCEL`) and uses `/tmp` with in-memory caching to prevent read-only filesystem errors.

### Step-by-Step Vercel Deployment
1. Import the repository into **Vercel Dashboard**.
2. Set **Framework Preset** to **Vite** (Build Command: `npm run build`, Output Directory: `dist`).
3. Add the following **Environment Variables** in Vercel Project Settings:
   - `GEMINI_API_KEY`: Your Gemini API Key from Google AI Studio.
   - `GNANI_API_KEY`: Your Gnani AI Indic speech API Key.
4. Click **Deploy**. Both the Vite frontend and the `/api/*` serverless backend endpoints will be live immediately!

---

## 🧪 8. Quality Assurance & Feature Testing Checklist

- [x] **Robot Mascot**: Open the dashboard or welcome screen; observe blinking, floating motion, and reactions to listening/thinking/speaking.
- [x] **Signature Reply Sound**: Send any text or prompt starter; hear the pleasant 3-tone chime upon completion. Test the preview in Settings.
- [x] **22 Indian Languages**: Send prompts in Tamil (`வணக்கம்`), Tanglish (`epdi irukinga?`), Hindi (`नमस्ते`), Hinglish (`kya chal raha hai?`), or Kannada (`ಹೇಗಿದ್ದೀರಾ`). Verify language badges.
- [x] **Image Reasoning**: Upload an image with a prompt or click send; verify the image renders in the message bubble, loading indicator finishes, and Gemini returns visual analysis.
- [x] **Voice STT & TTS**: Click the microphone, speak, hit Done; verify transcription and listen to audio playback with the custom audio player.
- [x] **Notifications**: Open Settings &rarr; enable Notifications; tab away while asking a question; receive notification upon reply.
- [x] **Data Persistence**: Refresh the browser; verify conversations and bookmarks remain intact.
- [x] **Production Build**: Verify `npm run build` and `tsc --noEmit` pass with zero errors.
