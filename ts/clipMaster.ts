import { Clip } from "./clip";

export class ClipMaster {
  private clips: Clip[] = [];
  private bpmDiv: HTMLSpanElement;

  constructor() {
    const body = document.getElementsByTagName('body')[0];
    const bpmContainer = document.createElement('div');
    this.bpmDiv = document.createElement('span');
    this.bpmDiv.innerText = 'NA';
    bpmContainer.appendChild(this.bpmDiv);
    const bpmText = document.createElement('span');
    bpmText.innerText = 'BPM';
    bpmText.classList.add('bpmText');
    bpmContainer.appendChild(bpmText);
    body.appendChild(bpmContainer);
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
    this.bpmDiv.innerText = bpm.toFixed(1);
  }

  public addClip(clip: Clip) {
    this.clips.push(clip);
    this.durationToBeats(clip.getDuration());
  }
}