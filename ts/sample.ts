import { DebugObject } from "./debugObject";

export interface Sample extends DebugObject {
  isArmed(): boolean;
  setBpm(bpm: number): void;
  startLoop(startTimeS: number): void;
  startOneShot(startTimeS: number): void;
  stop(stopTimeS: number): void;
  getDurationS(): number;
  parent: Sample;
}