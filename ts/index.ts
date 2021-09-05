import { Audio } from "./audio";
import { BigButton } from "./bigButton";
import { Memory } from "./memory";
import { SampleSource } from "./sampleSource";
import { SampleStream } from "./sampleStream";

console.log("Breathe.");

async function go() {
  //const m = new Memory();
  const audio = await Audio.make();
  const ss = await SampleSource.make(audio);
  const stream = new SampleStream(ss, audio.audioCtx);

  const workspace = document.createElement('div');
  workspace.id = 'workspace';
  document.getElementsByTagName('body')[0].appendChild(workspace);

  const bb = new BigButton(audio.audioCtx, stream);
}

go();
