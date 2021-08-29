import { SampleSource } from "./sampleSource";

class PendingWork {
  buffer: Float32Array;
  startOffset: number;
  constructor(buffer: Float32Array, startOffset: number) {
    this.buffer = buffer;
    this.startOffset = startOffset;
  }
}

export class SampleStream {
  private audioCtx: AudioContext;
  private chunks: Float32Array[] = [];
  private endTimeS: number;
  private startTimeS: number;

  private pending: PendingWork[] = [];

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
    if (framesRemaining > 0) {
      this.pending.push(new PendingWork(data, data.length - framesRemaining));
    }
    while (framesRemaining > 0) {
      data[targetOffset++] = 0;
      --framesRemaining;
    }
    return buffer;
  }

  private fillWork(pending: PendingWork, source: Float32Array) {
    const buffer = pending.buffer;
    let targetOffset = pending.startOffset;
    let sourceOffset = 0;
    while (targetOffset < buffer.length && sourceOffset < source.length) {
      buffer[targetOffset++] = source[sourceOffset++];
    }
    pending.startOffset = targetOffset;
  }

  private handleSamples(samples: Float32Array, endTimeS: number) {
    const durationS = samples.length / this.audioCtx.sampleRate;
    if (this.chunks.length === 0) {
      this.startTimeS = endTimeS - durationS;
      this.endTimeS = this.startTimeS;
    }

    for (const pendingItem of this.pending) {
      this.fillWork(pendingItem, samples);
    }

    while (this.pending.length > 0 &&
      this.pending[0].startOffset >= this.pending[0].buffer.length) {
      this.pending.shift();
    }

    this.chunks.push(samples);

    let recordedDurationS = this.endTimeS - this.startTimeS;
    // Maximum 15 minutes of recording time.  Rather excessive.
    while (recordedDurationS > 60 * 15) {
      const chunkDuration = this.chunks[0].length / this.audioCtx.sampleRate;
      this.startTimeS += chunkDuration;
      recordedDurationS -= chunkDuration;
      this.chunks.shift();
    }

    this.endTimeS += durationS;
  }
}