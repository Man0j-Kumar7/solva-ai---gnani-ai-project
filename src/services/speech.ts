/**
 * Speech Audio & Voice Service for SOLVA
 * Supports Web Audio recording, Gnani AI backend integration,
 * and seamless browser SpeechRecognition / SpeechSynthesis fallback.
 */

// Language mappings for browser Web Speech API
export const SPEECH_LANG_MAP: Record<string, string> = {
  ta: 'ta-IN',
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  tanglish: 'ta-IN',
  auto: 'en-IN',
};

class SpeechService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private volumeCallback: ((vol: number) => void) | null = null;
  private animationFrameId: number | null = null;
  private activeAudioElement: HTMLAudioElement | null = null;

  /**
   * Request microphone permission and initialize audio stream
   */
  async requestMicPermission(): Promise<boolean> {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop temporary stream immediately after verification
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err: any) {
      console.warn('Microphone permission not granted or unavailable:', err?.message || err);
      return false;
    }
  }

  /**
   * Start recording user speech with live audio level analysis
   */
  async startRecording(onVolumeChange?: (vol: number) => void): Promise<void> {
    this.stopRecording(); // Reset any existing
    this.audioChunks = [];
    this.volumeCallback = onVolumeChange || null;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Set up AudioContext for real-time waveform / volume meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.micStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!this.analyser || !this.volumeCallback) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Normalize to 0 - 100
          const normalized = Math.min(100, Math.round((average / 128) * 100));
          this.volumeCallback(normalized);
          this.animationFrameId = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      }

      // Check supported recording format
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }

      this.mediaRecorder = new MediaRecorder(this.micStream, mimeType ? { mimeType } : undefined);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
    } catch (err: any) {
      this.cleanupAudio();
      throw new Error(err.message || 'Could not access microphone.');
    }
  }

  /**
   * Stop recording and export recorded audio as base64 string
   */
  async stopRecording(): Promise<{ base64: string; mimeType: string; blob: Blob } | null> {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.cleanupAudio();
      return null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.cleanupAudio();
        resolve(null);
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanupAudio();

        if (audioBlob.size === 0) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1] || '';
          resolve({
            base64: base64Data,
            mimeType,
            blob: audioBlob,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancelRecording(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
    this.cleanupAudio();
  }

  private cleanupAudio(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.volumeCallback = null;
  }

  /**
   * Browser SpeechRecognition listener fallback
   */
  listenWithBrowserSpeech(
    langCode: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void
  ): () => void {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError('Browser SpeechRecognition API is not supported in this browser.');
      return () => {};
    }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANG_MAP[langCode] || langCode || 'en-IN';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onResult(final || interim, Boolean(final));
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition error.');
    };

    try {
      recognition.start();
    } catch (e: any) {
      onError(e.message);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    };
  }

  /**
   * Play base64 audio stream (from Gnani TTS)
   */
  async playBase64Audio(
    base64Data: string,
    format: string = 'wav',
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();

    const audioUrl = `data:audio/${format};base64,${base64Data}`;
    const audio = new Audio(audioUrl);
    this.activeAudioElement = audio;

    if (onEnd) {
      audio.onended = () => {
        this.activeAudioElement = null;
        onEnd();
      };
      audio.onerror = () => {
        this.activeAudioElement = null;
        onEnd();
      };
    }

    await audio.play();
  }

  /**
   * Browser SpeechSynthesis fallback
   */
  speakWithBrowser(
    text: string,
    langCode: string = 'en-IN',
    options?: { rate?: number; pitch?: number },
    onEnd?: () => void
  ): void {
    this.stopSpeaking();

    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    // Clean markdown before speaking
    const cleanText = text
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/```[\s\S]*?```/g, 'Code snippet omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+\s+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 1000); // limit spoken chunk for responsiveness

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = SPEECH_LANG_MAP[langCode] || langCode || 'en-IN';
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.startsWith(utterance.lang) || v.lang.replace('_', '-').startsWith(utterance.lang)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };
    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop all active speech playback
   */
  stopSpeaking(): void {
    if (this.activeAudioElement) {
      this.activeAudioElement.pause();
      this.activeAudioElement.currentTime = 0;
      this.activeAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    const isAudioPlaying = Boolean(
      this.activeAudioElement && !this.activeAudioElement.paused && !this.activeAudioElement.ended
    );
    const isSynthSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
    return isAudioPlaying || isSynthSpeaking;
  }
}

export const speechService = new SpeechService();
