export class MeasuresAndRemainder {
  measures: number;
  quantizedS: number;
  remainderS: number;
  constructor(durationS: number, bpm: number) {
    let secondsPerMeasure = 4 * 60 / bpm;
    let measureCount =
      Math.round(durationS / secondsPerMeasure);
    measureCount = Math.max(1, measureCount);
    this.quantizedS = measureCount * secondsPerMeasure;
    this.measures = measureCount;
    this.remainderS = durationS - this.quantizedS;
  }
}