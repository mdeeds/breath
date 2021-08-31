/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 458:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Audio = void 0;
class Audio {
    constructor(context) {
        this.audioCtx = context;
    }
    static make() {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx = yield Audio.getAudioContext();
            return new Promise((resolve, reject) => {
                resolve(new Audio(ctx));
            });
        });
    }
    static getAudioContext() {
        return new Promise((resolve, reject) => {
            const context = new window.AudioContext();
            if (context.state === 'running') {
                resolve(context);
            }
            else {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    resolve(yield Audio.getAudioContext());
                }), 500);
            }
        });
    }
    static HzFromNote(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }
}
exports.Audio = Audio;
//# sourceMappingURL=audio.js.map

/***/ }),

/***/ 346:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BigButton = void 0;
const clipCommander_1 = __webpack_require__(815);
const clipMaster_1 = __webpack_require__(977);
class BigButton {
    constructor(audioContext, sampleStream) {
        this.mode = 'stopped';
        this.canvas = null;
        this.loopStartS = null;
        this.loopLengthS = null;
        this.kPaddingS = 1.0;
        this.clipMaster = new clipMaster_1.ClipMaster(audioContext);
        this.audioCtx = audioContext;
        this.sampleStream = sampleStream;
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas.classList.add('bigButton');
        this.canvas.addEventListener('pointerdown', (ev) => {
            this.press();
        });
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(this.canvas);
        this.render();
    }
    press() {
        const pressTime = this.audioCtx.currentTime;
        if (this.mode === 'recording') {
            this.loopLengthS = pressTime - this.loopStartS;
            const buffer = this.sampleStream.createAudioBuffer(this.loopStartS - this.kPaddingS, pressTime + this.kPaddingS);
            const clipCommander = new clipCommander_1.ClipCommander(this.audioCtx, buffer, this.kPaddingS, this.loopLengthS, this.clipMaster);
        }
        switch (this.mode) {
            case 'stopped':
                this.mode = 'recording';
                break;
            case 'recording':
                this.mode = 'stopped';
                break;
        }
        if (this.mode === 'recording') {
            this.loopStartS = pressTime;
        }
    }
    render() {
        const ctx = this.canvas.getContext('2d');
        ctx.strokeStyle = 'black';
        switch (this.mode) {
            case 'stopped':
                ctx.strokeStyle = '#000';
                break;
            case 'recording':
                ctx.strokeStyle = '#f00';
                break;
        }
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.arc(200, 200, 150, -Math.PI, Math.PI);
        ctx.stroke();
        requestAnimationFrame(() => { this.render(); });
    }
}
exports.BigButton = BigButton;
//# sourceMappingURL=bigButton.js.map

/***/ }),

/***/ 721:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Clip = void 0;
const measuresAndRemainder_1 = __webpack_require__(214);
const wavMaker_1 = __webpack_require__(173);
class Clip {
    constructor(audioContext, buffer, startOffsetS, durationS) {
        this.audioNode = null;
        this.audioCtx = audioContext;
        this.startOffsetS = startOffsetS;
        this.naturalDurationS = durationS;
        this.loopDurationS = durationS;
        this.buffer = buffer;
        this.armed = false;
    }
    isArmed() {
        return this.armed;
    }
    setArmed(armed) {
        this.armed = armed;
    }
    DataURLFromUint8(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use a FileReader to generate a base64 data URI
            const base64url = yield new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.toString());
                reader.readAsDataURL(new Blob([data]));
            });
            return base64url;
        });
    }
    stop(stopTimeS) {
        if (this.audioNode) {
            this.audioNode.stop(stopTimeS);
            this.audioNode = null;
        }
    }
    start(startTimeS) {
        // Start cannot be called twice on an AudioBufferSourceNode
        // we must stop the old one and create a new one to restart the sound.
        if (this.audioNode) {
            this.audioNode.stop();
        }
        this.audioNode = this.audioCtx.createBufferSource();
        this.audioNode.buffer = this.buffer;
        this.audioNode.loop = true;
        this.audioNode.loopStart = this.startOffsetS;
        this.audioNode.loopEnd = this.startOffsetS + this.loopDurationS;
        this.audioNode.connect(this.audioCtx.destination);
        this.audioNode.start(startTimeS, this.startOffsetS);
    }
    changeStart(deltaS) {
        this.startOffsetS += deltaS;
    }
    changeDuration(deltaS) {
        this.naturalDurationS += deltaS;
        if (this.naturalDurationS < 0.1) {
            this.naturalDurationS = 0.1;
        }
    }
    toDataUri() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = wavMaker_1.WavMaker.makeWav(this.audioCtx, this.buffer, this.startOffsetS, this.loopDurationS);
            // const f = new File([data.buffer], "clip.wav");
            // ev.dataTransfer.files = [f];
            const stringData = yield this.DataURLFromUint8(new Uint8Array(data.buffer));
            return new Promise((resolve, reject) => {
                resolve(stringData);
            });
        });
    }
    getDuration() {
        return this.naturalDurationS;
    }
    setBpm(bpm) {
        const mar = new measuresAndRemainder_1.MeasuresAndRemainder(this.naturalDurationS, bpm);
        this.loopDurationS = mar.quantizedS;
    }
}
exports.Clip = Clip;
//# sourceMappingURL=clip.js.map

/***/ }),

/***/ 815:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClipCommander = void 0;
const clip_1 = __webpack_require__(721);
const measuresAndRemainder_1 = __webpack_require__(214);
class ClipCommander {
    constructor(audioContext, buffer, startOffsetS, durationS, clipMaster) {
        this.audioCtx = audioContext;
        this.clipMaster = clipMaster;
        this.clip = new clip_1.Clip(audioContext, buffer, startOffsetS, durationS);
        this.div = document.createElement('span');
        this.div.innerText = 'clip';
        this.div.classList.add('clip');
        this.div.tabIndex = 1;
        this.div.draggable = true;
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(this.div);
        this.div.addEventListener('keydown', (ev) => {
            let actionTaken = true;
            switch (ev.code) {
                case 'ArrowRight':
                    this.clip.changeStart(0.01);
                    break;
                case 'ArrowLeft':
                    this.clip.changeStart(-0.01);
                    break;
                case 'ArrowDown':
                    this.clip.changeDuration(-0.1);
                    break;
                case 'ArrowUp':
                    this.clip.changeDuration(0.1);
                    break;
                default: actionTaken = false;
            }
            if (actionTaken) {
                const mar = new measuresAndRemainder_1.MeasuresAndRemainder(this.clip.getDuration(), this.clipMaster.getBpm());
                this.div.innerText =
                    `${mar.measures} bars (${mar.remainderS.toFixed(3)})`;
                this.makeDownload(); // TODO: debounce?
                this.clipMaster.start(audioContext.currentTime);
            }
        });
        this.div.addEventListener('dragstart', (ev) => __awaiter(this, void 0, void 0, function* () {
            ev.dataTransfer.setData("audio/x-wav", yield this.clip.toDataUri());
            ev.dataTransfer.effectAllowed = "copy";
        }));
        this.div.addEventListener('pointerdown', (ev) => {
            this.div.classList.toggle('armed');
            this.clip.setArmed(this.div.classList.contains('armed'));
            this.clipMaster.start(this.audioCtx.currentTime);
        });
        this.clipMaster.addClip(this.clip);
        this.makeDownload();
    }
    makeDownload() {
        return __awaiter(this, void 0, void 0, function* () {
            let a = null;
            for (const elt of this.div.getElementsByTagName('a')) {
                a = elt;
                break;
            }
            if (a === null) {
                a = document.createElement('a');
                a.download = 'clip.wav';
                a.innerText = 'download';
                this.div.appendChild(a);
            }
            a.href = yield this.clip.toDataUri();
        });
    }
}
exports.ClipCommander = ClipCommander;
//# sourceMappingURL=clipCommander.js.map

/***/ }),

/***/ 977:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClipMaster = void 0;
class ClipMaster {
    constructor(audioContext) {
        this.clips = [];
        this.bpm = null;
        const body = document.getElementsByTagName('body')[0];
        const bpmContainer = document.createElement('div');
        this.bpmDiv = document.createElement('span');
        this.bpmDiv.innerText = 'NA';
        this.bpmDiv.tabIndex = 1;
        bpmContainer.appendChild(this.bpmDiv);
        const bpmText = document.createElement('span');
        bpmText.innerText = 'BPM';
        bpmText.classList.add('bpmText');
        bpmContainer.appendChild(bpmText);
        body.appendChild(bpmContainer);
        this.bpmDiv.addEventListener('keydown', (ev) => {
            if (!this.bpm) {
                return;
            }
            let actionTaken = true;
            switch (ev.code) {
                case 'Equal':
                case 'ArrowRight':
                case 'ArrowUp':
                    this.bpm += 0.1;
                    break;
                case 'Minus':
                case 'ArrowLeft':
                case 'ArrowDown':
                    this.bpm -= 0.1;
                    break;
                default:
                    actionTaken = false;
                    break;
            }
            if (actionTaken) {
                for (const c of this.clips) {
                    c.setBpm(this.bpm);
                }
                this.bpmDiv.innerText = this.bpm.toFixed(1);
                this.start(audioContext.currentTime);
            }
        });
    }
    start(startTimeS) {
        for (const clip of this.clips) {
            if (clip.isArmed()) {
                clip.start(startTimeS);
            }
            else {
                clip.stop(startTimeS);
            }
        }
    }
    durationToBeats(durationS) {
        let bpm = 60.0 / durationS;
        let beats = 1;
        while (bpm < 84) {
            bpm *= 2;
            beats *= 2;
        }
        bpm = Math.round(bpm * 10) / 10;
        this.bpm = bpm;
        this.bpmDiv.innerText = bpm.toFixed(1);
    }
    addClip(clip) {
        this.clips.push(clip);
        if (!this.bpm) {
            this.durationToBeats(clip.getDuration());
        }
        clip.setBpm(this.bpm);
    }
    getBpm() {
        return this.bpm;
    }
}
exports.ClipMaster = ClipMaster;
//# sourceMappingURL=clipMaster.js.map

/***/ }),

/***/ 138:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const audio_1 = __webpack_require__(458);
const bigButton_1 = __webpack_require__(346);
const memory_1 = __webpack_require__(898);
const sampleSource_1 = __webpack_require__(930);
const sampleStream_1 = __webpack_require__(387);
console.log("Breathe.");
function go() {
    return __awaiter(this, void 0, void 0, function* () {
        const m = new memory_1.Memory();
        const audio = yield audio_1.Audio.make();
        const ss = yield sampleSource_1.SampleSource.make(audio);
        const stream = new sampleStream_1.SampleStream(ss, audio.audioCtx);
        const bb = new bigButton_1.BigButton(audio.audioCtx, stream);
    });
}
go();
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 214:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MeasuresAndRemainder = void 0;
class MeasuresAndRemainder {
    constructor(durationS, bpm) {
        let secondsPerMeasure = 4 * 60 / bpm;
        let measureCount = Math.round(durationS / secondsPerMeasure);
        measureCount = Math.max(1, measureCount);
        this.quantizedS = measureCount * secondsPerMeasure;
        this.measures = measureCount;
        this.remainderS = durationS - this.quantizedS;
    }
}
exports.MeasuresAndRemainder = MeasuresAndRemainder;
//# sourceMappingURL=measuresAndRemainder.js.map

/***/ }),

/***/ 898:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Memory = void 0;
class Memory {
    constructor() {
        const div = document.createElement('div');
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(div);
        const f = function () {
            div.innerText = (window.performance
                .memory.usedJSHeapSize / 1000000).toFixed(3)
                + "MB";
            setTimeout(f, 100);
        };
        f();
    }
}
exports.Memory = Memory;
//# sourceMappingURL=memory.js.map

/***/ }),

/***/ 930:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SampleSource = void 0;
class SampleSource {
    constructor(audio) {
        this.previousMax = 0.0;
        this.audio = audio;
        this.audioCtx = audio.audioCtx;
    }
    static make(audio) {
        const self = new SampleSource(audio);
        console.log("Attempting to initialize.");
        console.assert(!!navigator.mediaDevices.getUserMedia);
        var constraints = {
            audio: true,
            video: false,
            echoCancellation: false,
            noiseSuppersion: false,
        };
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const stream = yield navigator.mediaDevices.getUserMedia(constraints);
            self.handleStream(stream, resolve);
        }));
    }
    setListener(callback) {
        this.listener = callback;
    }
    setUpAnalyser(mediaSource) {
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
            }
            else if (m >= 0.5) {
                div.classList.remove('low');
                div.classList.add('mid');
                div.classList.remove('hig');
            }
            else {
                div.classList.add('low');
                div.classList.remove('mid');
                div.classList.remove('hig');
            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }
    handleStream(stream, resolve) {
        return __awaiter(this, void 0, void 0, function* () {
            this.mediaSource = this.audioCtx.createMediaStreamSource(stream);
            this.setUpAnalyser(this.mediaSource);
            yield this.audioCtx.audioWorklet.addModule(`sampleSourceWorker.js?buster=${Math.random().toFixed(6)}`);
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
            };
            this.mediaSource.connect(worklet);
            resolve(this);
        });
    }
}
exports.SampleSource = SampleSource;
//# sourceMappingURL=sampleSource.js.map

/***/ }),

/***/ 387:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SampleStream = void 0;
class PendingWork {
    constructor(buffer, startOffset) {
        this.buffer = buffer;
        this.startOffset = startOffset;
    }
}
class SampleStream {
    constructor(sampleSource, audioContext) {
        this.chunks = [];
        this.pending = [];
        this.audioCtx = audioContext;
        sampleSource.setListener((samples, endTimeS) => {
            this.handleSamples(samples, endTimeS);
        });
    }
    createAudioBuffer(startS, endS) {
        console.log(`Chunks: ${this.chunks.length}`);
        const frameCount = (endS - startS) * this.audioCtx.sampleRate;
        const buffer = this.audioCtx.createBuffer(1, frameCount, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let framesToSkip = this.audioCtx.sampleRate * (startS - this.startTimeS);
        let framesRemaining = frameCount;
        let chunkIndex = 0;
        let targetOffset = 0;
        while (framesRemaining > 0 && chunkIndex < this.chunks.length) {
            const currentChunkSize = this.chunks[chunkIndex].length;
            if (framesToSkip < currentChunkSize) {
                const frameStart = framesToSkip;
                const frameEnd = Math.min(currentChunkSize, framesToSkip + framesRemaining);
                for (let i = frameStart; i < frameEnd; ++i) {
                    data[targetOffset++] = this.chunks[chunkIndex][i];
                }
                framesRemaining -= (frameEnd - frameStart);
            }
            framesToSkip = Math.max(0, framesToSkip - currentChunkSize);
            ++chunkIndex;
        }
        console.log(`Using ${targetOffset} frames.  ${framesRemaining} blank.`);
        if (framesRemaining > 0) {
            this.pending.push(new PendingWork(data, data.length - framesRemaining));
        }
        while (framesRemaining > 0) {
            data[targetOffset++] = 0;
            --framesRemaining;
        }
        return buffer;
    }
    fillWork(pending, source) {
        const buffer = pending.buffer;
        let targetOffset = pending.startOffset;
        let sourceOffset = 0;
        while (targetOffset < buffer.length && sourceOffset < source.length) {
            buffer[targetOffset++] = source[sourceOffset++];
        }
        pending.startOffset = targetOffset;
    }
    handleSamples(samples, endTimeS) {
        const durationS = samples.length / this.audioCtx.sampleRate;
        if (this.chunks.length === 0) {
            this.startTimeS = endTimeS - durationS;
            this.endTimeS = this.startTimeS;
        }
        for (const pendingItem of this.pending) {
            this.fillWork(pendingItem, samples);
        }
        while (this.pending.length > 0 &&
            this.pending[0].startOffset >= this.pending[0].buffer.length) {
            this.pending.shift();
        }
        this.chunks.push(samples);
        let recordedDurationS = this.endTimeS - this.startTimeS;
        // Maximum 15 minutes of recording time.  Rather excessive.
        while (recordedDurationS > 60 * 15) {
            const chunkDuration = this.chunks[0].length / this.audioCtx.sampleRate;
            this.startTimeS += chunkDuration;
            recordedDurationS -= chunkDuration;
            this.chunks.shift();
        }
        this.endTimeS += durationS;
    }
}
exports.SampleStream = SampleStream;
//# sourceMappingURL=sampleStream.js.map

/***/ }),

/***/ 173:
/***/ ((__unused_webpack_module, exports) => {


// Cribbed from https://github.com/awslabs/aws-lex-browser-audio-capture/blob/master/lib/worker.js
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WavMaker = void 0;
// Better ??? https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
// Not sure how to use an offline audio context or otherwise create an offline stream...
class WavMaker {
    static makeWav(audioContext, buffer, startOffsetS, durationS) {
        const samples = new Float32Array(audioContext.sampleRate * durationS);
        let sampleIndex = 0;
        let sourceIndex = Math.trunc(startOffsetS * audioContext.sampleRate);
        const sourceData = buffer.getChannelData(0);
        while (sampleIndex < samples.length) {
            samples[sampleIndex++] = sourceData[sourceIndex++];
        }
        return WavMaker.makeWavFromFloat32(audioContext.sampleRate, samples);
    }
    static floatTo16BitPCM(output, offset, input) {
        for (var i = 0; i < input.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }
    static writeString(view, offset, s) {
        for (var i = 0; i < s.length; i++) {
            view.setUint8(offset + i, s.charCodeAt(i));
        }
    }
    static makeWavFromFloat32(sampleRate, samples) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);
        WavMaker.writeString(view, 0, 'RIFF');
        view.setUint32(4, 32 + samples.length * 2, true);
        WavMaker.writeString(view, 8, 'WAVE');
        WavMaker.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        WavMaker.writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        WavMaker.floatTo16BitPCM(view, 44, samples);
        return view;
    }
}
exports.WavMaker = WavMaker;
//# sourceMappingURL=wavMaker.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__(138);
/******/ })()
;
//# sourceMappingURL=main.js.map