import { Audio } from "./audio";
import { SampleSource } from "./sampleSource";

console.log("Breathe.");

async function go() {
  const audio = await Audio.make();
  const ss = await SampleSource.make(audio);
}

go();
