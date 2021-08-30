import { MeasuresAndRemainder } from "./measuresAndRemainder";
import { WavMaker } from "./wavMaker";

export class Clip {
  private startOffsetS: number;
  private loopDurationS: number;
  private naturalDurationS: number;
  private buffer: AudioBuffer;
  private audioCtx: AudioContext;
  private audioNode: AudioBufferSourceNode = null;
  private armed: boolean;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number) {
    this.audioCtx = audioContext;
    this.startOffsetS = startOffsetS;
    this.naturalDurationS = durationS;
    this.loopDurationS = durationS;
    this.buffer = buffer;
    this.armed = false;
  }

  public isArmed() {
    return this.armed;
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

  public start(startTimeS: number) {
    // Start cannot be called twice on an AudioBufferSourceNode
    // we must stop the old one and create a new one to restart the sound.
    if (this.audioNode) {
      this.audioNode.stop();
    }
    this.audioNode = this.audioCtx.createBufferSource();
    this.audioNode.buffer = this.buffer;
    this.audioNode.loop = true;
    this.audioNode.loopStart = this.startOffsetS;
    this.audioNode.loopEnd = this.startOffsetS + this.loopDurationS;
    this.audioNode.connect(this.audioCtx.destination);
    this.audioNode.start(startTimeS, this.startOffsetS);
  }

  public changeStart(deltaS: number) {
    this.startOffsetS += deltaS;
    this.start(this.audioCtx.currentTime);
  }

  public changeDuration(deltaS: number) {
    this.naturalDurationS += deltaS;
    if (this.naturalDurationS < 0.1) {
      this.naturalDurationS = 0.1;
    }
    this.start(this.audioCtx.currentTime);
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

  public getDuration(): number {
    return this.naturalDurationS;
  }

  public setBpm(bpm: number) {
    const mar = new MeasuresAndRemainder(this.naturalDurationS, bpm);
    this.loopDurationS = mar.quantizedS;
    this.start(this.audioCtx.currentTime);
  }
}