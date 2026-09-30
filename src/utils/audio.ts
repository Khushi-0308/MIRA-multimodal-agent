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
