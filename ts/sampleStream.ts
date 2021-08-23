import { SampleSource } from "./sampleSource";

export class SampleStream {
  private audioCtx: AudioContext;
  private chunks: Float32Array[] = [];
  private endTimeS: number;
  private startTimeS: number;

  constructor(sampleSource: SampleSource, audioContext: AudioContext) {
    this.audioCtx = audioContext;
    sampleSource.setListener((samples: Float32Array, endTimeS: number) => {
      this.handleSamples(samples, endTimeS);
    });
  }

  createAudioBuffer(startS: number, endS: number) {
    console.log(`Chunks: ${this.chunks.length}`);
    const frameCount = (endS - startS) * this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, frameCount, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let framesToSkip = this.audioCtx.sampleRate * (startS - this.startTimeS);
    let framesRemaining = frameCount;
    let chunkIndex = 0;
    let targetOffset = 0;
    while (framesRemaining > 0 && chunkIndex < this.chunks.length) {
      const currentChunkSize = this.chunks[chunkIndex].length;
      if (framesToSkip < currentChunkSize) {
        const frameStart = framesToSkip;
        const frameEnd = Math.min(
          currentChunkSize, framesToSkip + framesRemaining);
        for (let i = frameStart; i < frameEnd; ++i) {
          data[targetOffset++] = this.chunks[chunkIndex][i];
        }
        framesRemaining -= (frameEnd - frameStart);
      }
      framesToSkip = Math.max(0, framesToSkip - currentChunkSize);
      ++chunkIndex;
    }
    console.log(`Using ${targetOffset} frames.  ${framesRemaining} blank.`);
    // TODO: Pad out on next callback
    while (framesRemaining > 0) {
      data[targetOffset++] = 0;
      --framesRemaining;
    }
    return buffer;
  }

  private handleSamples(samples: Float32Array, endTimeS: number) {
    const durationS = samples.length / this.audioCtx.sampleRate;
    if (this.chunks.length === 0) {
      this.startTimeS = endTimeS - durationS;
      this.endTimeS = this.startTimeS;
    }
    this.chunks.push(samples);
    this.endTimeS += durationS;
  }
}