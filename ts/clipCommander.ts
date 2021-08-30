import { Clip } from "./clip";
import { ClipMaster } from "./clipMaster";
import { MeasuresAndRemainder } from "./measuresAndRemainder";

export class ClipCommander {
  private div: HTMLDivElement;
  private clipMaster: ClipMaster;
  private clip: Clip;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number,
    clipMaster: ClipMaster) {
    this.clipMaster = clipMaster;
    this.clip = new Clip(
      audioContext, buffer, startOffsetS, durationS);

    this.div = document.createElement('div');
    this.div.innerText = 'clip';
    this.div.classList.add('clip');
    this.div.tabIndex = 1;
    this.div.draggable = true;
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
        this.makeDownload();  // TODO: Debounce?
        // this.div.innerText = JSON.stringify(this.durationToBeats(this.durationS));

        const mar = new MeasuresAndRemainder(this.clip.getDuration(), this.clipMaster.getBpm());
        this.div.innerText = `${mar.measures} bars (${mar.remainderS})`;
        // TODO: retrigger all clips
      }
    });

    this.div.addEventListener('dragstart', async (ev: DragEvent) => {
      ev.dataTransfer.setData("audio/x-wav", await this.clip.toDataUri());
      ev.dataTransfer.effectAllowed = "copy";
    });

    this.div.addEventListener('pointerdown', (ev: PointerEvent) => {
      this.div.classList.toggle('armed');
      this.clip.setArmed(this.div.classList.contains('armed'));
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