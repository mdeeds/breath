import { Clip } from "./clip";
import { DebugObject } from "./debugObject";
import { Manifest } from "./manifest";
import { Sample } from "./sample";
import { SequenceCommander } from "./sequenceCommander";

export class ClipMaster implements DebugObject {
  private clips: Set<Sample> = new Set<Sample>();
  private bpmDiv: HTMLSpanElement;
  private bpm: number = null;
  private startTimeS: number = null;
  private audioCtx: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioCtx = audioContext;
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

    const bucket = document.createElement('span');
    bucket.innerText = '+ new bucket';
    bucket.classList.add('bucket');
    bucket.addEventListener('dragover', (ev: DragEvent) => {
      ev.dataTransfer.dropEffect = 'move';
      ev.preventDefault();
    })
    bucket.addEventListener('drop', (ev: DragEvent) => {
      const data = ev.dataTransfer.getData("application/my-app");
      this.newBucket(document.getElementById(data));
      ev.preventDefault();
    });
    const workspace = document.getElementById('workspace');
    workspace.appendChild(bucket);

    const bugContainer = document.createElement('div');
    const bugButton = document.createElement('span');
    bugContainer.appendChild(bugButton);
    bugButton.innerText = 'debug'
    const debug = document.createElement('textarea');
    debug.classList.add('debug');
    debug.contentEditable = "false";
    debug.innerText = 'Hello, World!';
    bugContainer.appendChild(debug);
    body.appendChild(bugContainer);

    bugButton.addEventListener('pointerdown', (ev: PointerEvent) => {
      debug.value =
        `clips: ${JSON.stringify(this.getDebugObject(), null, 2)}` +
        ` manifest: ${JSON.stringify(Manifest.getDebugObject(), null, 2)}`;
    });
  }

  private newBucket(firstElement: HTMLSpanElement) {
    const sequenceCommander =
      new SequenceCommander(this.audioCtx,
        firstElement,
        document.getElementById('workspace'),
        this);  // Very bad horrible circular dependency.
    this.clips.add(sequenceCommander.getSequence());
  }

  public start(startTimeS: number) {
    this.startTimeS = startTimeS;
    for (const clip of this.clips) {
      if (clip.isArmed() && !clip.parent) {
        clip.startLoop(startTimeS);
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
    this.clips.add(clip);
    if (!this.bpm) {
      this.durationToBeats(clip.getDurationS());
    }
    clip.setBpm(this.bpm);
  }

  public getBpm(): number {
    return this.bpm;
  }

  public getDebugObject() {
    const result = [];
    for (const c of this.clips.values()) {
      result.push(c.getDebugObject());
    }
    return result;
  }
}