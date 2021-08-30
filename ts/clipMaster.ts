import { Key } from "readline";
import { Clip } from "./clip";

export class ClipMaster {
  private clips: Clip[] = [];
  private bpmDiv: HTMLSpanElement;
  private bpm: number = null;

  constructor() {
    const body = document.getElementsByTagName('body')[0];
    const bpmContainer = document.createElement('div');
    this.bpmDiv = document.createElement('span');
    this.bpmDiv.innerText = 'NA';
    this.bpmDiv.tabIndex = 1;
    bpmContainer.appendChild(this.bpmDiv);
    const bpmText = document.createElement('span');
    bpmText.innerText = 'BPM';
    bpmText.classList.add('bpmText');
    bpmContainer.appendChild(bpmText);
    body.appendChild(bpmContainer);
    this.bpmDiv.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (!this.bpm) {
        return;
      }
      let actionTaken = true;
      switch (ev.code) {
        case 'Equal': this.bpm += 0.1; break;
        case 'Minus': this.bpm -= 0.1; break;
        default: actionTaken = false; break;
      }
      if (actionTaken) {
        for (const c of this.clips) {
          c.setBpm(this.bpm);
        }
        this.bpmDiv.innerText = this.bpm.toFixed(1);
      }
    });
  }

  start(startTimeS: number) {
    for (const clip of this.clips) {
      if (clip.isArmed()) {
        clip.start(startTimeS);
      } else {
        clip.stop(startTimeS);
      }
    }
  }

  private durationToBeats(durationS: number) {
    let bpm = 60.0 / durationS;
    let beats = 1;
    while (bpm < 96) {
      bpm *= 2;
      beats *= 2;
    }
    bpm = Math.round(bpm * 10) / 10;
    this.bpm = bpm;
    this.bpmDiv.innerText = bpm.toFixed(1);
  }

  public addClip(clip: Clip) {
    this.clips.push(clip);
    if (!this.bpm) {
      this.durationToBeats(clip.getDuration());
    }
    clip.setBpm(this.bpm);
  }
}