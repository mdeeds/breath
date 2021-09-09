import { Sample } from "./sample";
import { MeasuresAndRemainder } from "./measuresAndRemainder";
import { WavMaker } from "./wavMaker";

export class Clip implements Sample {
  private startOffsetS: number;
  private loopDurationS: number;
  private naturalDurationS: number;
  private buffer: AudioBuffer;
  private audioCtx: AudioContext;
  private audioNode: AudioBufferSourceNode = null;
  private armed: boolean;
  public parent: Sample = null;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number) {
    this.audioCtx = audioContext;
    this.startOffsetS = startOffsetS;
    this.naturalDurationS = durationS;
    this.loopDurationS = durationS;
    this.buffer = buffer;
  }

  public isArmed() {
    return this.armed;
  }

  private kDownsampleRate = 100;
  public getSamples(centerS: number, target: Float32Array) {
    const startS = (centerS + this.startOffsetS) -
      (target.length * this.kDownsampleRate / this.audioCtx.sampleRate);
    let sourceIndex = Math.round(startS * this.audioCtx.sampleRate);
    console.log(`Source index: ${sourceIndex}`);
    const sampleBuffer = this.buffer.getChannelData(0);
    for (let i = 0; i < target.length; ++i) {
      let m = 0;
      for (let j = 0; j < this.kDownsampleRate; ++j) {
        const v = (sourceIndex < 0) ? 0 : sampleBuffer[sourceIndex];
        m = Math.max(v, m);
        ++sourceIndex;
      }
      target[i] = m;
    }
  }

  public setArmed(armed: boolean) {
    this.armed = armed;
  }

  private async DataURLFromUint8(data: Uint8Array): Promise<string> {
    // Use a FileReader to generate a base64 data URI
    const base64url: string = await new Promise(
      (resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.toString())
        reader.readAsDataURL(new Blob([data]))
      })
    return base64url;
  }

  public stop(stopTimeS: number) {
    if (this.audioNode) {
      this.audioNode.stop(stopTimeS);
      this.audioNode = null;
    }
  }

  private start(startTimeS: number, loop: boolean) {
    // Start cannot be called twice on an AudioBufferSourceNode
    // we must stop the old one and create a new one to restart the sound.
    if (this.audioNode) {
      this.audioNode.stop(startTimeS);
    }
    this.audioNode = this.audioCtx.createBufferSource();
    this.audioNode.buffer = this.buffer;
    if (loop) {
      this.audioNode.loop = true;
      this.audioNode.loopStart = this.startOffsetS;
      this.audioNode.loopEnd = this.startOffsetS + this.loopDurationS;
    }
    this.audioNode.connect(this.audioCtx.destination);
    this.audioNode.start(startTimeS, this.startOffsetS);
  }

  public startLoop(startTimeS: number) {
    this.start(startTimeS, true);
  }

  public startOneShot(startTimeS: number) {
    this.start(startTimeS, false);
  }

  public changeStart(deltaS: number) {
    this.startOffsetS += deltaS;
  }

  public changeDuration(deltaS: number, bpm: number) {
    this.naturalDurationS += deltaS;
    if (this.naturalDurationS < 0.1) {
      this.naturalDurationS = 0.1;
    }
    const mar = new MeasuresAndRemainder(this.naturalDurationS, bpm);
    this.loopDurationS = mar.quantizedS;
  }

  public async toDataUri(): Promise<string> {
    const data = WavMaker.makeWav(
      this.audioCtx, this.buffer, this.startOffsetS, this.loopDurationS);
    // const f = new File([data.buffer], "clip.wav");
    // ev.dataTransfer.files = [f];
    const stringData = await this.DataURLFromUint8(new Uint8Array(data.buffer));
    return new Promise((resolve, reject) => {
      resolve(stringData);
    });
  }

  public getDurationS(): number {
    return this.naturalDurationS;
  }

  public setBpm(bpm: number) {
    const mar = new MeasuresAndRemainder(this.naturalDurationS, bpm);
    this.loopDurationS = mar.quantizedS;
    console.log(`BPM set ${JSON.stringify(this)}`);
  }

  getDebugObject(): object {
    return {
      duration: this.loopDurationS,
      armed: this.armed
    }
  }
}