export interface Sample {
  isArmed(): boolean;
  setBpm(bpm: number): void;
  startLoop(startTimeS: number): void;
  startOneShot(startTimeS: number): void;
  stop(stopTimeS: number): void;
  getDurationS(): number;
}