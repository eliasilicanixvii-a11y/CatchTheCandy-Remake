/**
 * Sound & Music Engine for Catch the Candy.
 * Uses the real MP3 track ("Catch the Candy Remastered Music.mp3") via HTML5 Audio (<audio> / HTMLAudioElement),
 * and procedural Web Audio API sound effects for tactile gameplay feedback.
 */

export const MAIN_MUSIC_TRACK = {
  title: 'Catch the Candy Remastered Music',
  url: '/Catch%20the%20Candy%20Remastered%20Music.mp3',
} as const;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private isPaused: boolean = false;
  private bgMusic: HTMLAudioElement | null = null;
  private currentTrackUrl: string = '';
  private currentTrackTitle: string = MAIN_MUSIC_TRACK.title;
  private pendingPlay: boolean = false;

  constructor() {
    // HTMLAudioElement initialized lazily on client
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private ensureAudioElement(url: string) {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;

    if (!this.bgMusic) {
      this.bgMusic = new Audio();
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.4;
      this.bgMusic.preload = 'auto';
    }

    if (this.currentTrackUrl !== url) {
      this.currentTrackUrl = url;
      this.bgMusic.src = url;
      this.bgMusic.load();
    }
  }

  public getCurrentTrackTitle(): string {
    return this.currentTrackTitle;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      this.bgMusic?.pause();
    } else if (this.isMusicEnabled && !this.isMuted) {
      this.startMusic();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.bgMusic?.pause();
    } else if (this.isMusicEnabled && !this.isPaused) {
      this.startMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (enabled && !this.isMuted && !this.isPaused) {
      this.startMusic();
    } else {
      this.pendingPlay = false;
      this.bgMusic?.pause();
    }
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public unlockAndStartMusic() {
    if (this.isMusicEnabled && !this.isMuted && !this.isPaused) {
      if (!this.bgMusic || this.bgMusic.paused || this.pendingPlay) {
        this.startMusic();
      }
    }
  }

  private playMusicElement() {
    if (!this.bgMusic) return;
    const playPromise = this.bgMusic.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          this.pendingPlay = false;
        })
        .catch(() => {
          // Browser blocked autoplay before user gesture; retry on next interaction
          this.pendingPlay = true;
        });
    }
  }

  /**
   * Tongue shoot: rubbery twang sound
   */
  public playTongueShoot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Sticky suction latch: satisfying "plop"
   */
  public playLatchNormal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Ice slip: slippery rubber squeak
   */
  public playIceSlip() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(850, now);
    osc.frequency.linearRampToValueAtTime(1300, now + 0.06);
    osc.frequency.linearRampToValueAtTime(600, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Life lost / hurt sound: cartoon ouch wobble
   */
  public playHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Candy reached: happy munch & bright chimes
   */
  public playCandyEat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      const noteTime = now + idx * 0.08;
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  /**
   * Victory fanfare: triumphant chords
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { t: 0.0, freqs: [440, 554.37, 659.25] },     // A major
      { t: 0.18, freqs: [493.88, 622.25, 739.99] }, // B major
      { t: 0.36, freqs: [587.33, 739.99, 880.0] },  // D major
      { t: 0.58, freqs: [659.25, 830.61, 987.77] }, // E major fanfare
    ];

    chords.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';

        const startTime = now + chord.t;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.46);
      });
    });
  }

  /**
   * Gentle collision / bounce
   */
  public playBounce(intensity = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    const baseFreq = 160 + Math.min(intensity * 30, 180);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

    const vol = Math.min(0.25 * intensity, 0.35);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * UI button click blip
   */
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Background music via HTMLAudioElement ("Catch the Candy Remastered Music.mp3")
   */
  private startMusic() {
    if (this.isMuted || !this.isMusicEnabled || this.isPaused) return;
    this.currentTrackTitle = MAIN_MUSIC_TRACK.title;
    this.ensureAudioElement(MAIN_MUSIC_TRACK.url);
    this.playMusicElement();
  }
}

export const sound = new SoundEngine();
