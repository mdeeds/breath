import { Sample } from "./sample";

export class Sequence implements Sample {
  private audioCtx: AudioContext;
  private samples: Sample[];
  private loopTimeout: NodeJS.Timeout = null;
  public parent: Sample = null;

  constructor(audioContext: AudioContext, firstSample: Sample) {
    this.audioCtx = audioContext;
    this.samples = [firstSample];
  }

  addSample(sample: Sample) {
    this.samples.push(sample);
    if (sample.parent && sample.parent instanceof Sequence) {
      sample.parent.removeSample(sample);
    }
    sample.parent = this;
  }

  removeSample(sample: Sample) {
    const indexToRemove = this.samples.indexOf(sample);
    if (indexToRemove >= 0) {
      this.samples.splice(indexToRemove, 1);
    }
  }

  isArmed(): boolean {
    for (const s of this.samples) {
      if (s.isArmed()) {
        return true;
      }
    }
    return false;
  }

  startLoop(startTimeS: number) {
    this.startOneShot(startTimeS);
    const nextQueue =
      startTimeS + this.getDurationS();
    const sleepMs = (this.audioCtx.currentTime - nextQueue - 0.1) * 1000;
    clearTimeout(this.loopTimeout);
    this.loopTimeout = setTimeout(() => {
      this.startLoop(nextQueue);
    }, sleepMs);
  }

  startOneShot(startTimeS: number) {
    let cueTimeS = startTimeS;
    for (const s of this.samples) {
      s.startOneShot(cueTimeS);
      cueTimeS += s.getDurationS();
    }
  }

  stop(stopTimeS: number) {
    clearTimeout(this.loopTimeout);
    this.loopTimeout = null;
    for (const s of this.samples) {
      s.stop(stopTimeS);
    }
  }

  setBpm(bpm: number) {
    for (const s of this.samples) {
      s.setBpm(bpm);
    }
  }

  getDurationS() {
    let totalDurationS = 0;
    for (const s of this.samples) {
      totalDurationS += s.getDurationS();
    }
    return totalDurationS;
  }
}