import { Sequence } from "./sequence";
import { Manifest } from "./manifest";

export class SequenceCommander {
  private sequence: Sequence;
  private audioCtx: AudioContext;
  constructor(
    audioContext: AudioContext,
    firstElement: HTMLSpanElement, workspace: HTMLDivElement | HTMLSpanElement) {
    this.audioCtx = audioContext;
    const bucket = document.createElement('span');
    bucket.id = `bucket${Math.random()}${window.performance.now()}`;
    bucket.classList.add('bucket');
    bucket.appendChild(firstElement);
    workspace.appendChild(bucket);

    const firstSample = Manifest.getSampleById(firstElement.id);
    this.sequence = new Sequence(this.audioCtx, firstSample);
    Manifest.add(bucket, this.sequence);

    bucket.addEventListener('dragover', (ev: DragEvent) => {
      ev.dataTransfer.dropEffect = 'move';
      ev.preventDefault();
    });

    bucket.addEventListener('drop', (ev: DragEvent) => {
      console.log(`AAAAA: Drop into existing`);
      const data = ev.dataTransfer.getData("application/my-app");
      bucket.appendChild(document.getElementById(data));
      const sample = Manifest.getSampleById(data);
      const sequence = Manifest.getSampleById(bucket.id);
      if (sequence instanceof Sequence) {
        sequence.addSample(sample);
      } else {
        console.log(`AAAAA: Bucket is not a sequence! ${bucket.id}`);
      }
      ev.preventDefault();
    });
  }

  getSequence(): Sequence {
    return this.sequence;
  }
}