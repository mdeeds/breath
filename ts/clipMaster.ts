import { Clip } from "./clip";

export class ClipMaster {
  private clips: Clip[] = [];
  constructor() {

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
}