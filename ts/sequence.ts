import { Sample } from "./sample";

export class Sequence implements Sample {
  private audioCtx: AudioContext;
  private samples: Sample[] = [];
  private loopTimeout: NodeJS.Timeout = null;
  public parent: Sample = null;

  constructor(audioContext: AudioContext, firstSample: Sample) {
    this.audioCtx = audioContext;
    this.addSample(firstSample);
  }

  addSample(sample: Sample) {
    console.log(`AAAAA: addSample`);
    if (sample.parent && sample.parent instanceof Sequence) {
      sample.parent.removeSample(sample);
    }
    this.samples.push(sample);
    sample.parent = this;
  }

  removeSample(sample: Sample) {
    const indexToRemove = this.samples.indexOf(sample);
    console.log(`AAAAA: removeSample ${indexToRemove}`);
    if (indexToRemove >= 0) {
      this.samples.splice(indexToRemove, 1);
    }
    sample.parent = null;
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
    const sleepMs = (nextQueue - this.audioCtx.currentTime - 0.1) * 1000;
    console.log(`Sleep: ${sleepMs.toFixed(1)}`);
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

  getDebugObject(): object {
    const result = [];
    for (const s of this.samples) {
      result.push(s.getDebugObject());
    }
    return { samples: result, totalDuration: this.getDurationS() };
  }
}