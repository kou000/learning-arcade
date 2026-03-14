import type { Pitch } from "@/features/piano/domain/score";

const NOTE_FREQUENCIES: Record<Pitch, number> = {
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

type ToneOscillator = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

type ActiveTone = {
  gain: GainNode;
  toneFilter: BiquadFilterNode;
  bodyFilter: BiquadFilterNode;
  pan: StereoPannerNode;
  oscillators: ToneOscillator[];
  noiseSource?: AudioBufferSourceNode;
};

export class PianoAudioEngine {
  private context: AudioContext | null = null;
  private resumePromise: Promise<void> | null = null;

  private activeTones = new Map<Pitch, ActiveTone>();
  private noiseBuffer: AudioBuffer | null = null;
  private reverbBuffer: AudioBuffer | null = null;
  private outputBus: GainNode | null = null;
  private reverbBus: ConvolverNode | null = null;
  private reverbSend: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  private ensureContext() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  private async getContext() {
    const context = this.ensureContext();
    if (context.state === "suspended") {
      if (this.resumePromise) {
        await this.resumePromise;
      } else {
        this.resumePromise = context.resume().finally(() => {
          this.resumePromise = null;
        });
        await this.resumePromise;
      }
    }
    return context;
  }

  async enableAudio() {
    try {
      const context = await this.getContext();
      this.ensureOutputChain(context);
      return context.state === "running";
    } catch {
      return false;
    }
  }

  unlock() {
    const context = this.ensureContext();
    this.ensureOutputChain(context);
  }

  private ensureOutputChain(context: AudioContext) {
    if (this.outputBus && this.reverbBus && this.reverbSend && this.compressor) {
      return;
    }

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, context.currentTime);
    compressor.knee.setValueAtTime(18, context.currentTime);
    compressor.ratio.setValueAtTime(2.5, context.currentTime);
    compressor.attack.setValueAtTime(0.003, context.currentTime);
    compressor.release.setValueAtTime(0.2, context.currentTime);

    const outputBus = context.createGain();
    outputBus.gain.setValueAtTime(0.88, context.currentTime);

    const reverbBus = context.createConvolver();
    reverbBus.buffer = this.getReverbBuffer(context);

    const reverbSend = context.createGain();
    reverbSend.gain.setValueAtTime(0.18, context.currentTime);

    outputBus.connect(compressor);
    compressor.connect(context.destination);
    reverbSend.connect(reverbBus);
    reverbBus.connect(compressor);

    this.outputBus = outputBus;
    this.reverbBus = reverbBus;
    this.reverbSend = reverbSend;
    this.compressor = compressor;
  }

  private getNoiseBuffer(context: AudioContext) {
    if (this.noiseBuffer) return this.noiseBuffer;

    const buffer = context.createBuffer(1, context.sampleRate * 0.08, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.35;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private getReverbBuffer(context: AudioContext) {
    if (this.reverbBuffer) return this.reverbBuffer;

    const length = Math.floor(context.sampleRate * 1.4);
    const buffer = context.createBuffer(2, length, context.sampleRate);

    for (let channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex += 1) {
      const channel = buffer.getChannelData(channelIndex);
      for (let index = 0; index < channel.length; index += 1) {
        const decay = Math.pow(1 - index / channel.length, 2.4);
        channel[index] = (Math.random() * 2 - 1) * decay * 0.2;
      }
    }

    this.reverbBuffer = buffer;
    return buffer;
  }

  async noteOn(noteId: Pitch, volume = 0.8) {
    const frequency = NOTE_FREQUENCIES[noteId];
    if (!frequency) return;

    const context = await this.getContext();
    this.ensureOutputChain(context);
    await this.noteOff(noteId);

    const gain = context.createGain();
    const now = context.currentTime;
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    const peakGain = Math.max(0.0001, 0.26 * normalizedVolume);
    const toneFilter = context.createBiquadFilter();
    const bodyFilter = context.createBiquadFilter();
    const pan = context.createStereoPanner();
    const keyIndex = Object.keys(NOTE_FREQUENCIES).indexOf(noteId);

    toneFilter.type = "lowpass";
    toneFilter.frequency.setValueAtTime(Math.min(7200, frequency * 12), now);
    toneFilter.frequency.exponentialRampToValueAtTime(Math.max(1500, frequency * 3.6), now + 0.22);
    toneFilter.Q.setValueAtTime(0.9, now);

    bodyFilter.type = "peaking";
    bodyFilter.frequency.setValueAtTime(Math.min(520, Math.max(180, frequency * 0.9)), now);
    bodyFilter.Q.setValueAtTime(0.7, now);
    bodyFilter.gain.setValueAtTime(4.5, now);

    pan.pan.setValueAtTime(-0.28 + keyIndex * 0.024, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain * 0.55), now + 0.09);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain * 0.34), now + 0.42);

    const oscillators = [
      { type: "triangle" as OscillatorType, ratio: 1, level: 0.68, detune: -1.5, attackDelay: 0 },
      { type: "sine" as OscillatorType, ratio: 1.002, level: 0.3, detune: 1.8, attackDelay: 0.002 },
      { type: "sine" as OscillatorType, ratio: 2, level: 0.12, detune: -2.2, attackDelay: 0.001 },
      { type: "triangle" as OscillatorType, ratio: 3, level: 0.05, detune: 2.4, attackDelay: 0.003 },
    ].map((partial) => {
      const oscillator = context.createOscillator();
      const partialGain = context.createGain();
      oscillator.type = partial.type;
      oscillator.frequency.setValueAtTime(frequency * partial.ratio, now);
      oscillator.detune.setValueAtTime(partial.detune, now);
      partialGain.gain.setValueAtTime(0.0001, now);
      partialGain.gain.exponentialRampToValueAtTime(partial.level, now + 0.004 + partial.attackDelay);
      partialGain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, partial.level * (partial.ratio === 1 ? 0.8 : 0.45)),
        now + 0.18,
      );
      oscillator.connect(partialGain);
      partialGain.connect(toneFilter);
      oscillator.start(now + partial.attackDelay);
      return { oscillator, gain: partialGain };
    });

    const noiseSource = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noiseSource.buffer = this.getNoiseBuffer(context);
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(Math.min(5200, frequency * 7.5), now);
    noiseFilter.Q.setValueAtTime(0.75, now);
    noiseGain.gain.setValueAtTime(Math.max(0.0001, peakGain * 0.22), now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(toneFilter);
    noiseSource.start(now);
    noiseSource.stop(now + 0.06);

    toneFilter.connect(bodyFilter);
    bodyFilter.connect(gain);
    gain.connect(pan);
    pan.connect(this.outputBus!);
    pan.connect(this.reverbSend!);

    this.activeTones.set(noteId, { gain, toneFilter, bodyFilter, pan, oscillators, noiseSource });
  }

  async noteOff(noteId: Pitch, releaseMs = 160) {
    const tone = this.activeTones.get(noteId);
    if (!tone || !this.context) return;

    const now = this.context.currentTime;
    const releaseSec = Math.max(0.04, releaseMs / 1000);

    tone.gain.gain.cancelScheduledValues(now);
    tone.gain.gain.setValueAtTime(Math.max(0.0001, tone.gain.gain.value), now);
    tone.gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseSec);

    tone.toneFilter.frequency.cancelScheduledValues(now);
    tone.toneFilter.frequency.setValueAtTime(Math.max(500, tone.toneFilter.frequency.value), now);
    tone.toneFilter.frequency.exponentialRampToValueAtTime(380, now + releaseSec);

    tone.oscillators.forEach(({ oscillator, gain }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseSec);
      oscillator.stop(now + releaseSec + 0.03);
    });
    this.activeTones.delete(noteId);
  }

  async playOneShot(noteId: Pitch, durationMs = 260, volume = 0.8) {
    await this.noteOn(noteId, volume);
    window.setTimeout(() => {
      void this.noteOff(noteId, Math.max(120, durationMs * 0.6));
    }, durationMs);
  }

  async playMetronomeClick(accent = false, volume = 0.8) {
    const context = await this.getContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const peakGain = Math.max(0.0001, (accent ? 0.22 : 0.14) * Math.max(0, Math.min(1, volume)));

    oscillator.type = "square";
    oscillator.frequency.value = accent ? 1760 : 1320;

    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  async dispose() {
    const noteIds = Array.from(this.activeTones.keys());
    await Promise.all(noteIds.map((noteId) => this.noteOff(noteId, 50)));
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    this.resumePromise = null;
    this.noiseBuffer = null;
    this.reverbBuffer = null;
    this.outputBus = null;
    this.reverbBus = null;
    this.reverbSend = null;
    this.compressor = null;
  }
}
