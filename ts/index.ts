import { Audio } from "./audio";
import { BigButton } from "./bigButton";
import { SampleSource } from "./sampleSource";

console.log("Breathe.");

async function go() {
  const audio = await Audio.make();
  const ss = await SampleSource.make(audio);

  const bb = new BigButton();
}

go();
