/**
 * SOLVA Signature Audio Engine
 * Generates an original, harmonic, futuristic sound effect using the Web Audio API.
 * 100% original, copyright-free, pleasant, and responsive.
 */

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.6; // 0.0 to 1.0

  constructor() {
    // Read persisted sound preferences
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('solva_sound_enabled');
      if (savedEnabled !== null) {
        this.isEnabled = savedEnabled === 'true';
      }
      const savedVol = localStorage.getItem('solva_sound_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.6;
      }
    }
  }

  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('solva_sound_enabled', String(enabled));
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('solva_sound_volume', String(this.volume));
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Play SOLVA's signature reply chime
   * A 3-tone ascending futuristic harmonic arpeggio (Eb5 -> G5 -> Bb5)
   */
  public playReplyChime(): void {
    if (!this.isEnabled || this.volume <= 0) return;

    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.4, now);

      // Low-pass filter for silky soft warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(1.2, now);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Arpeggio notes in Hertz
      const notes = [
        { freq: 622.25, time: 0.0, dur: 0.18 }, // Eb5
        { freq: 783.99, time: 0.05, dur: 0.22 }, // G5
        { freq: 932.33, time: 0.11, dur: 0.35 }, // Bb5
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Blend sine with subtle triangle for futuristic clarity
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Soft attack and smooth exponential decay
        noteGain.gain.setValueAtTime(0.0001, now + time);
        noteGain.gain.linearRampToValueAtTime(0.4, now + time + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch (e) {
      console.debug('Autoplay or audio context prevented sound:', e);
    }
  }
}

export const soundEffects = new SoundEffectsService();
