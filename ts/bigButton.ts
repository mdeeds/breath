import { Clip } from "./clip";
import { ClipCommander } from "./clipCommander";
import { ClipMaster } from "./clipMaster";
import { SampleStream } from "./sampleStream";

type ButtonMode = 'stopped' | 'recording';

export class BigButton {
  mode: ButtonMode = 'stopped';
  canvas: HTMLCanvasElement = null;
  loopStartS: number = null;
  loopLengthS: number = null;
  audioCtx: AudioContext;
  sampleStream: SampleStream;
  clipMaster: ClipMaster;
  constructor(audioContext: AudioContext, sampleStream: SampleStream) {
    this.clipMaster = new ClipMaster(audioContext);
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

    body.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.code === 'Space') {
        this.press();
      }
    })

    this.render();
  }

  private kPaddingS: number = 1.0;

  press() {
    const pressTime = this.clipMaster.nearestDownBeat(
      this.audioCtx.currentTime);

    if (this.mode === 'recording') {
      this.loopLengthS = pressTime - this.loopStartS;
      const buffer = this.sampleStream.createAudioBuffer(
        this.loopStartS - this.kPaddingS, pressTime + this.kPaddingS);

      const clipCommander = new ClipCommander(this.audioCtx,
        buffer, this.kPaddingS, this.loopLengthS, this.clipMaster);
      this.clipMaster.start(pressTime);
    }

    switch (this.mode) {
      case 'stopped': this.mode = 'recording'; break;
      case 'recording': this.mode = 'stopped'; break;
    }
    if (this.mode === 'recording') {
      this.loopStartS = pressTime;
    }
    this.render();
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    switch (this.mode) {
      case 'stopped': ctx.strokeStyle = '#000'; break;
      case 'recording': ctx.strokeStyle = '#f00'; break;
    }
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.arc(200, 200, 150, -Math.PI, Math.PI);
    ctx.stroke();
  }
}