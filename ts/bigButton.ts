import { SampleStream } from "./sampleStream";

type ButtonMode = 'stopped' | 'playing' | 'recording' | 'overdubbing';

export class BigButton {
  mode: ButtonMode = 'stopped';
  canvas: HTMLCanvasElement = null;
  loopStartS: number = null;
  loopLengthS: number = null;
  audioCtx: AudioContext;
  sampleStream: SampleStream;
  constructor(audioContext: AudioContext, sampleStream: SampleStream) {
    this.audioCtx = audioContext;
    this.sampleStream = sampleStream;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 400;
    this.canvas.height = 400;
    this.canvas.classList.add('bigButton');
    this.canvas.addEventListener('pointerdown', (ev: PointerEvent) => {
      this.press();
    });

    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.canvas);
    this.render();
  }

  press() {
    const pressTime = this.audioCtx.currentTime;

    if (this.mode === 'recording' || this.mode === 'overdubbing') {
      if (!this.loopLengthS) {
        this.loopLengthS = pressTime - this.loopStartS;
      }
      const buffer = this.sampleStream.createAudioBuffer(
        this.loopStartS, pressTime);
      const playing = this.audioCtx.createBufferSource();
      playing.buffer = buffer;
      playing.loop = true;
      playing.connect(this.audioCtx.destination);
      playing.start(pressTime);
    }

    switch (this.mode) {
      case 'stopped': this.mode = 'recording'; break;
      case 'playing': this.mode = 'overdubbing'; break;
      case 'recording': this.mode = 'overdubbing'; break;
      case 'overdubbing': this.mode = 'playing'; break;
    }
    if (this.mode === 'recording' || this.mode === 'overdubbing') {
      this.loopStartS = pressTime;
    }
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    switch (this.mode) {
      case 'stopped': ctx.strokeStyle = '#000'; break;
      case 'playing': ctx.strokeStyle = '#0f0'; break;
      case 'recording': ctx.strokeStyle = '#f00'; break;
      case 'overdubbing': ctx.strokeStyle = '#aa0'; break;
    }
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.arc(200, 200, 150, -Math.PI, Math.PI);
    ctx.stroke();

    requestAnimationFrame(() => { this.render(); });
  }
}