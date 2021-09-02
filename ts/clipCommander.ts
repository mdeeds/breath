import { Clip } from "./clip";
import { ClipMaster } from "./clipMaster";
import { MeasuresAndRemainder } from "./measuresAndRemainder";

export class ClipCommander {
  private div: HTMLDivElement | HTMLSpanElement;
  private clipMaster: ClipMaster;
  private clip: Clip;
  private audioCtx: AudioContext;
  private canvas: HTMLCanvasElement;
  private samples: Float32Array;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number,
    clipMaster: ClipMaster) {
    this.audioCtx = audioContext;
    this.clipMaster = clipMaster;
    this.clip = new Clip(
      audioContext, buffer, startOffsetS, durationS);

    this.div = document.createElement('span');
    this.div.classList.add('clip');
    this.div.tabIndex = 1;
    this.div.draggable = true;
    this.div.classList.add('armed');
    this.clip.setArmed(true);
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.div);
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.div.clientWidth * 2;
    this.canvas.height = this.div.clientHeight * 2;
    this.canvas.style.setProperty('width', `${this.div.clientWidth}px`);
    this.canvas.style.setProperty('height', `${this.div.clientHeight}px`);
    this.div.appendChild(this.canvas);

    this.samples = new Float32Array(this.canvas.width);

    this.div.addEventListener('keydown', (ev: KeyboardEvent) => {
      let actionTaken: boolean = true;
      switch (ev.code) {
        case 'ArrowRight': this.clip.changeStart(0.01); break;
        case 'ArrowLeft': this.clip.changeStart(-0.01); break;
        case 'ArrowDown': this.clip.changeDuration(-0.1); break;
        case 'ArrowUp': this.clip.changeDuration(0.1); break;
        default: actionTaken = false;
      }
      if (actionTaken) {
        this.updateBody();
        this.clipMaster.start(this.audioCtx.currentTime);
      }
    });

    this.div.addEventListener('dragstart', async (ev: DragEvent) => {
      ev.dataTransfer.setData("audio/x-wav", await this.clip.toDataUri());
      ev.dataTransfer.effectAllowed = "copy";
    });

    this.div.addEventListener('pointerdown', (ev: PointerEvent) => {
      if (this.div != document.activeElement) {
        this.div.focus();
        return;
      }
      this.div.classList.toggle('armed');
      this.clip.setArmed(this.div.classList.contains('armed'));
      this.clipMaster.start(this.audioCtx.currentTime);
    });

    this.clipMaster.addClip(this.clip);
    this.updateBody();
    this.makeDownload();
  }

  private renderPeaks(ctx: CanvasRenderingContext2D, samples: Float32Array) {
    let x = 0;
    ctx.fillStyle = 'red'
    const r = Math.round(this.canvas.width / 2);
    for (const v of samples) {
      const absV = Math.pow(Math.abs(v), 0.4);
      const h = absV * this.canvas.height;
      const y = this.canvas.height - 0.9 * h;
      if (x == r) {
        ctx.fillStyle = '#009';
      }
      ctx.fillRect(x++, y, 1, absV * this.canvas.height);
    }
  }

  updateBody() {
    const mar = new MeasuresAndRemainder(this.clip.getDuration(), this.clipMaster.getBpm());
    this.makeDownload();  // TODO: debounce?

    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const r = this.canvas.width / 2;
    this.clip.getSamples(0, this.samples);
    this.renderPeaks(ctx, this.samples);

    ctx.font = 'bold 90px mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${mar.measures.toFixed(0)}`, r, r + 90 / 2);
  }

  private async makeDownload() {
    let a: HTMLAnchorElement = null;
    for (const elt of this.div.getElementsByTagName('a')) {
      a = elt;
      break;
    }
    if (a === null) {
      a = document.createElement('a');
      a.download = 'clip.wav';
      a.innerHTML = '&#x21e9;';
      this.div.appendChild(a);
    }
    a.href = await this.clip.toDataUri();
  }
}