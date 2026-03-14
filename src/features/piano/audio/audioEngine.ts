const NOTE_FREQUENCIES: Record<string, number> = {
  c4: 261.63,
  c4s: 277.18,
  d4: 293.66,
  d4s: 311.13,
  e4: 329.63,
  f4: 349.23,
  f4s: 369.99,
  g4: 392,
  g4s: 415.3,
  a4: 440,
  a4s: 466.16,
  b4: 493.88,
  c5: 523.25,
  c5s: 554.37,
  d5: 587.33,
  d5s: 622.25,
  e5: 659.25,
  f5: 698.46,
  f5s: 739.99,
  g5: 783.99,
  g5s: 830.61,
  a5: 880,
  a5s: 932.33,
  b5: 987.77,
};

type ActiveTone = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

export class PianoAudioEngine {
  private context: AudioContext | null = null;

  private activeTones = new Map<string, ActiveTone>();

  private async getContext() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
    return this.context;
  }

  async noteOn(noteId: string, volume = 0.8) {
    const frequency = NOTE_FREQUENCIES[noteId];
    if (!frequency) return;

    await this.noteOff(noteId);

    const context = await this.getContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;

    const now = context.currentTime;
    const peakGain = Math.max(0.0001, 0.24 * Math.max(0, Math.min(1, volume)));

    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.015);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);

    this.activeTones.set(noteId, { oscillator, gain });
  }

  async noteOff(noteId: string, releaseMs = 160) {
    const tone = this.activeTones.get(noteId);
    if (!tone || !this.context) return;

    const now = this.context.currentTime;
    const releaseSec = Math.max(0.04, releaseMs / 1000);

    tone.gain.gain.cancelScheduledValues(now);
    tone.gain.gain.setValueAtTime(Math.max(0.0001, tone.gain.gain.value), now);
    tone.gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseSec);

    tone.oscillator.stop(now + releaseSec + 0.02);
    this.activeTones.delete(noteId);
  }

  async playOneShot(noteId: string, durationMs = 260, volume = 0.8) {
    await this.noteOn(noteId, volume);
    window.setTimeout(() => {
      void this.noteOff(noteId, Math.max(120, durationMs * 0.6));
    }, durationMs);
  }

  async dispose() {
    const noteIds = Array.from(this.activeTones.keys());
    await Promise.all(noteIds.map((noteId) => this.noteOff(noteId, 50)));
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }
}
