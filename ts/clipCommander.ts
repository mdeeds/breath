import { Clip } from "./clip";
import { ClipMaster } from "./clipMaster";

export class ClipCommander {
  private div: HTMLDivElement;
  private clipCommander: Clip;
  private clipMaster: ClipMaster;
  private clip: Clip;

  constructor(
    audioContext: AudioContext,
    buffer: AudioBuffer, startOffsetS: number, durationS: number,
    clipMaster: ClipMaster) {
    this.clip = new Clip(
      audioContext, buffer, startOffsetS, durationS);

    this.div = document.createElement('div');
    this.div.innerText = 'clip';
    this.div.classList.add('clip');
    this.div.tabIndex = 1;
    this.div.draggable = true;
    document.getElementsByTagName('body')[0].appendChild(this.div);
    this.div.addEventListener('keydown', (ev: KeyboardEvent) => {
      let actionTaken: boolean = true;
      switch (ev.code) {
        case 'ArrowRight': this.clip.changeStart(0.01); break;
        case 'ArrowLeft': this.clip.changeStart(-0.01); break;
        case 'ArrowDown': this.clip.changeDuration(0.01); break;
        case 'ArrowUp': this.clip.changeDuration(-0.01); break;
        default: actionTaken = false;
      }
      if (actionTaken) {
        this.makeDownload();  // TODO: Debounce?
        // this.div.innerText = JSON.stringify(this.durationToBeats(this.durationS));

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