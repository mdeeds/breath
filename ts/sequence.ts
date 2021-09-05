import { Sample } from "./sample";

class Sequence implements Sample {
  audioCtx: AudioContext;
  samples: Sample[];
  loopTimeout: NodeJS.Timeout = null;

  constructor(audioContext: AudioContext, firstSample: Sample) {
    this.audioCtx = audioContext;
    this.samples = [firstSample];
  }

  addSample(sample: Sample) {
    this.samples.push(sample);
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