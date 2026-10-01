/**
 * Web Audio API Visualizer & Microphone capture utility
 */

export class AudioVisualizerController {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private isSynthetic: boolean = false;
  private syntheticPhase: number = 0;

  async startListening(
    onSpectrumUpdate: (spectrum: number[], volume: number, vadActive: boolean) => void
  ): Promise<boolean> {
    this.stopListening();

    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;

        this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
        this.sourceNode.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const loop = () => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          const spectrum: number[] = [];
          for (let i = 0; i < dataArray.length; i++) {
            const val = dataArray[i];
            sum += val;
            spectrum.push(val / 255);
          }

          const avg = sum / dataArray.length;
          const volume = Math.min(100, Math.round((avg / 255) * 100 * 2));
          const vadActive = volume > 12;

          onSpectrumUpdate(spectrum, volume, vadActive);
          this.animFrameId = requestAnimationFrame(loop);
        };

        this.animFrameId = requestAnimationFrame(loop);
        return true;
      }
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable, switching to synthetic visualizer mode:', err);
    }

    // Fallback synthetic spectrum for demo & test environments
    this.isSynthetic = true;
    const syntheticLoop = () => {
      this.syntheticPhase += 0.05;
      const spectrum: number[] = [];
      let sum = 0;
      for (let i = 0; i < 32; i++) {
        const val = Math.max(0, Math.sin(this.syntheticPhase + i * 0.25) * 0.45 + 0.45 + Math.random() * 0.1);
        spectrum.push(val);
        sum += val;
      }
      const avg = sum / 32;
      const volume = Math.round(avg * 60);
      const vadActive = volume > 20;

      onSpectrumUpdate(spectrum, volume, vadActive);
      this.animFrameId = requestAnimationFrame(syntheticLoop);
    };

    this.animFrameId = requestAnimationFrame(syntheticLoop);
    return false;
  }

  stopListening(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyser = null;
    this.isSynthetic = false;
  }

  getIsSynthetic(): boolean {
    return this.isSynthetic;
  }
}

/**
 * Speech-to-Text Recognition Controller using Web Speech API
 */
export class SpeechRecognitionController {
  private recognition: any = null;
  private isRunning: boolean = false;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (this.onTranscriptCallback) {
            if (finalTranscript.trim()) {
              this.onTranscriptCallback(finalTranscript.trim(), true);
            } else if (interimTranscript.trim()) {
              this.onTranscriptCallback(interimTranscript.trim(), false);
            }
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('[SpeechRecognition] Error event:', event.error);
          if (this.onErrorCallback && event.error !== 'no-speech') {
            this.onErrorCallback(event.error);
          }
        };

        this.recognition.onend = () => {
          this.isRunning = false;
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isRunning) {
      this.stop();
    }

    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    try {
      this.recognition.start();
      this.isRunning = true;
      return true;
    } catch (err) {
      console.warn('[SpeechRecognition] Start error:', err);
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('[SpeechRecognition] Stop error:', err);
      }
      this.isRunning = false;
    }
  }
}

/**
 * Text-to-Speech Synthesis Controller using Web Speech API
 */
export class SpeechSynthesisController {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  cleanTextForSpeech(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~#>-]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\s+/g, ' ')
      .trim();
  }

  speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    if (!this.synth) return;

    this.stop();

    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = options?.rate ?? 1.05;
    utterance.pitch = options?.pitch ?? 1.1;

    // Pick natural voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Jenny') ||
          v.name.includes('Zira')) &&
        v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      if (options?.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      if (options?.onError) options.onError(e);
      if (options?.onEnd) options.onEnd();
    };

    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechRecognizer = new SpeechRecognitionController();
export const speechSynthesizer = new SpeechSynthesisController();

