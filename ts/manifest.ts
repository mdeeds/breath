import { Sample } from "./sample";
import { Sequence } from "./sequence";

type Container = HTMLDivElement | HTMLSpanElement;

export class Manifest {
  private static samples: Map<string, Sample> = new Map<string, Sample>();
  private static containers: Map<string, Container> = new Map<string, Container>();
  private static ids: Map<Sample, string> = new Map<Sample, string>();

  static add(container: Container, sample: Sample) {
    Manifest.samples.set(container.id, sample);
    Manifest.containers.set(container.id, container);
    Manifest.ids.set(sample, container.id);
  }

  static getSampleById(id: string) {
    return this.samples.get(id);
  }

  static getContainerById(id: string) {
    return this.containers.get(id);
  }

  static getContainerBySample(sample: Sample) {
    return this.containers.get(this.ids.get(sample));
  }
}