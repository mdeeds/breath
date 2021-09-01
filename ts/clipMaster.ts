import { Clip } from "./clip";

export class ClipMaster {
  private clips: Clip[] = [];
  private bpmDiv: HTMLSpanElement;
  private bpm: number = null;
  private startTimeS: number = null;

  constructor(audioContext: AudioContext) {
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
        case 'Equal':
        case 'ArrowRight':
        case 'ArrowUp':
          this.bpm += 0.1;
          break;
        case 'Minus':
        case 'ArrowLeft':
        case 'ArrowDown':
          this.bpm -= 0.1;
          break;
        default: actionTaken = false; break;
      }
      if (actionTaken) {
        for (const c of this.clips) {
          c.setBpm(this.bpm);
        }
        this.bpmDiv.innerText = this.bpm.toFixed(1);
        this.start(audioContext.currentTime);
      }
    });
  }

  public start(startTimeS: number) {
    this.startTimeS = startTimeS;
    for (const clip of this.clips) {
      if (clip.isArmed()) {
        clip.start(startTimeS);
      } else {
        clip.stop(startTimeS);
      }
    }
  }

  public nearestDownBeat(referenceTimeS: number) {
    if (!this.startTimeS || !this.bpm) {
      return referenceTimeS;
    }
    const elapsed = referenceTimeS - this.startTimeS;
    const secondsPerMeasure = 4 * 60 / this.bpm;
    const measureNumber = Math.round(elapsed / secondsPerMeasure);
    return this.startTimeS + measureNumber * secondsPerMeasure;
  }

  private durationToBeats(durationS: number) {
    let bpm = 60.0 / durationS;
    let beats = 1;
    while (bpm < 84) {
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

  public getBpm(): number {
    return this.bpm;
  }
}