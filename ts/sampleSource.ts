import { Audio } from "./audio";

type SampleSourceResolution = (self: SampleSource) => void;
type SampleCallback = (samples: Float32Array, endTimeS: number) => void;

export class SampleSource {
  private mediaSource: MediaStreamAudioSourceNode;
  private listener: SampleCallback;
  readonly audioCtx: AudioContext;
  readonly audio: Audio;

  private constructor(audio: Audio) {
    this.audio = audio;
    this.audioCtx = audio.audioCtx;
  }

  public static make(audio: Audio): Promise<SampleSource> {
    const self = new SampleSource(audio);

    console.log("Attempting to initialize.");
    console.assert(!!navigator.mediaDevices.getUserMedia);
    var constraints = {
      audio: true,
      video: false,
      echoCancellation: false,
      noiseSuppersion: false,
    };
    return new Promise(async (resolve, reject) => {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      self.handleStream(stream, resolve);
    });
  }

  public setListener(callback: SampleCallback) {
    this.listener = callback;
  }

  private previousMax = 0.0;

  private setUpAnalyser(mediaSource: MediaStreamAudioSourceNode) {
    const body = document.getElementsByTagName('body')[0];
    const div = document.createElement('div');
    div.classList.add('vu');
    body.appendChild(div);

    const analyser = this.audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    this.mediaSource.connect(analyser);
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    const render = () => {
      analyser.getFloatTimeDomainData(dataArray);
      let m = this.previousMax * 0.95;
      for (let i = 0; i < dataArray.length; ++i) {
        m = Math.max(m, Math.abs(dataArray[i]));
      }
      this.previousMax = m;
      div.innerText = m.toFixed(2);
      if (m >= 0.9) {
        div.classList.remove('low');
        div.classList.remove('mid');
        div.classList.add('hig');
      } else if (m >= 0.5) {
        div.classList.remove('low');
        div.classList.add('mid');
        div.classList.remove('hig');
      } else {
        div.classList.add('low');
        div.classList.remove('mid');
        div.classList.remove('hig');
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  private async handleStream(stream: MediaStream, resolve: SampleSourceResolution) {
    this.mediaSource = this.audioCtx.createMediaStreamSource(stream);
    this.setUpAnalyser(this.mediaSource);

    await this.audioCtx.audioWorklet.addModule(
      `sampleSourceWorker.js?buster=${Math.random().toFixed(6)}`);
    const worklet = new AudioWorkletNode(this.audioCtx, 'sample-source');

    let workerStartTime = this.audioCtx.currentTime;
    let workerElapsedFrames = 0;

    worklet.port.onmessage = (event) => {
      setTimeout(() => {
        workerElapsedFrames += event.data.newSamples.length;
        const chunkEndTime = workerStartTime +
          workerElapsedFrames / this.audioCtx.sampleRate;
        this.listener(event.data.newSamples, chunkEndTime);

      }, 0);
    }

    this.mediaSource.connect(worklet);
    resolve(this);
  }
}