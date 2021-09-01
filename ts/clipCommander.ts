import { Clip } from "./clip";
import { ClipMaster } from "./clipMaster";
import { MeasuresAndRemainder } from "./measuresAndRemainder";

export class ClipCommander {
  private div: HTMLDivElement | HTMLSpanElement;
  private clipMaster: ClipMaster;
  private clip: Clip;
  private audioCtx: AudioContext;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number,
    clipMaster: ClipMaster) {
    this.audioCtx = audioContext;
    this.clipMaster = clipMaster;
    this.clip = new Clip(
      audioContext, buffer, startOffsetS, durationS);

    this.div = document.createElement('span');
    this.div.innerText = 'clip';
    this.div.classList.add('clip');
    this.div.tabIndex = 1;
    this.div.draggable = true;
    this.div.classList.add('armed');
    this.clip.setArmed(true);
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.div);
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
        const mar = new MeasuresAndRemainder(this.clip.getDuration(), this.clipMaster.getBpm());
        this.div.innerText =
          `${mar.measures} bars (${mar.remainderS.toFixed(3)})`;
        this.makeDownload();  // TODO: debounce?
        this.clipMaster.start(audioContext.currentTime);
      }
    });

    this.div.addEventListener('dragstart', async (ev: DragEvent) => {
      ev.dataTransfer.setData("audio/x-wav", await this.clip.toDataUri());
      ev.dataTransfer.effectAllowed = "copy";
    });

    this.div.addEventListener('pointerdown', (ev: PointerEvent) => {
      this.div.classList.toggle('armed');
      this.clip.setArmed(this.div.classList.contains('armed'));
      this.clipMaster.start(this.audioCtx.currentTime);
    });

    this.clipMaster.addClip(this.clip);
    this.makeDownload();
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
      a.innerText = 'download';
      this.div.appendChild(a);
    }
    a.href = await this.clip.toDataUri();
  }
}