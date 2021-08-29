export class Clip {
  private startOffsetS: number;
  private durationS: number;
  private buffer: AudioBuffer;
  private audioCtx: AudioContext;
  private audioNode: AudioBufferSourceNode = null;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number) {
    this.startOffsetS = startOffsetS;
    this.durationS = durationS;
    this.buffer = buffer;
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
    this.audioNode.connect(this.audioCtx.destination);
    this.audioNode.start(startTimeS, this.startOffsetS, this.durationS);
  }

  public changeStart(deltaS: number) {
    this.startOffsetS += deltaS;
    this.start(this.audioCtx.currentTime);
  }
}