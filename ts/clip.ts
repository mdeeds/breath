export class Clip {
  private startOffsetS: number;
  private durationS: number;
  private buffer: AudioBuffer;
  private audioCtx: AudioContext;
  private audioNode: AudioBufferSourceNode = null;
  private div: HTMLDivElement;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number) {
    this.audioCtx = audioContext;
    this.startOffsetS = startOffsetS;
    this.durationS = durationS;
    this.buffer = buffer;

    this.div = document.createElement('div');
    this.div.innerText = 'clip';
    this.div.classList.add('clip');
    this.div.tabIndex = 1;
    document.getElementsByTagName('body')[0].appendChild(this.div);
    this.div.addEventListener('keydown', (ev: KeyboardEvent) => {
      switch (ev.code) {
        case 'ArrowRight': this.changeStart(0.01); break;
        case 'ArrowLeft': this.changeStart(-0.01); break;
        case 'Space': this.start(this.audioCtx.currentTime); break;
      }
    });
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
    this.audioNode.loopEnd = this.startOffsetS + this.durationS;
    this.audioNode.connect(this.audioCtx.destination);
    this.audioNode.start(startTimeS, this.startOffsetS);
  }

  public changeStart(deltaS: number) {
    this.startOffsetS += deltaS;
    this.start(this.audioCtx.currentTime);
  }
}