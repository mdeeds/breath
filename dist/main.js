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
        body.addEventListener('keydown', (ev) => {
            if (ev.code === 'Space') {
                this.press();
            }
        });
        this.render();
    }
    press() {
        const pressTime = this.clipMaster.nearestDownBeat(this.audioCtx.currentTime);
        if (this.mode === 'recording') {
            this.loopLengthS = pressTime - this.loopStartS;
            const buffer = this.sampleStream.createAudioBuffer(this.loopStartS - this.kPaddingS, pressTime + this.kPaddingS);
            const clipCommander = new clipCommander_1.ClipCommander(this.audioCtx, buffer, this.kPaddingS, this.loopLengthS, this.clipMaster);
            this.clipMaster.start(pressTime);
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
        this.render();
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
        this.parent = null;
        this.kDownsampleRate = 100;
        this.audioCtx = audioContext;
        this.startOffsetS = startOffsetS;
        this.naturalDurationS = durationS;
        this.loopDurationS = durationS;
        this.buffer = buffer;
    }
    isArmed() {
        return this.armed;
    }
    getSamples(centerS, target) {
        const startS = (centerS + this.startOffsetS) -
            (target.length * this.kDownsampleRate / this.audioCtx.sampleRate);
        let sourceIndex = Math.round(startS * this.audioCtx.sampleRate);
        console.log(`Source index: ${sourceIndex}`);
        const sampleBuffer = this.buffer.getChannelData(0);
        for (let i = 0; i < target.length; ++i) {
            let m = 0;
            for (let j = 0; j < this.kDownsampleRate; ++j) {
                const v = (sourceIndex < 0) ? 0 : sampleBuffer[sourceIndex];
                m = Math.max(v, m);
                ++sourceIndex;
            }
            target[i] = m;
        }
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
    start(startTimeS, loop) {
        if (startTimeS <= 0) {
            throw new Error(`Bad start time: ${startTimeS}`);
        }
        // Start cannot be called twice on an AudioBufferSourceNode
        // we must stop the old one and create a new one to restart the sound.
        if (this.audioNode) {
            this.audioNode.stop(startTimeS);
        }
        this.audioNode = this.audioCtx.createBufferSource();
        this.audioNode.buffer = this.buffer;
        if (loop) {
            this.audioNode.loop = true;
            this.audioNode.loopStart = this.startOffsetS;
            this.audioNode.loopEnd = this.startOffsetS + this.loopDurationS;
        }
        this.audioNode.connect(this.audioCtx.destination);
        console.log(`Starting ${(window.performance.now() / 1000).toFixed(1)}`);
        this.audioNode.start(startTimeS, this.startOffsetS);
    }
    startLoop(startTimeS) {
        this.start(startTimeS, true);
    }
    startOneShot(startTimeS) {
        this.start(startTimeS, false);
    }
    changeStart(deltaS) {
        this.startOffsetS += deltaS;
    }
    changeDuration(deltaS, bpm) {
        this.naturalDurationS += deltaS;
        if (this.naturalDurationS < 0.1) {
            this.naturalDurationS = 0.1;
        }
        const mar = new measuresAndRemainder_1.MeasuresAndRemainder(this.naturalDurationS, bpm);
        this.loopDurationS = mar.quantizedS;
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
    getDurationS() {
        return this.naturalDurationS;
    }
    setBpm(bpm) {
        const mar = new measuresAndRemainder_1.MeasuresAndRemainder(this.naturalDurationS, bpm);
        this.loopDurationS = mar.quantizedS;
        console.log(`BPM set ${JSON.stringify(this)}`);
    }
    getDebugObject() {
        return {
            duration: this.loopDurationS,
            armed: this.armed
        };
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
const manifest_1 = __webpack_require__(906);
const measuresAndRemainder_1 = __webpack_require__(214);
const sequence_1 = __webpack_require__(500);
class ClipCommander {
    constructor(audioContext, buffer, startOffsetS, durationS, clipMaster) {
        this.audioCtx = audioContext;
        this.clipMaster = clipMaster;
        this.clip = new clip_1.Clip(audioContext, buffer, startOffsetS, durationS);
        this.div = document.createElement('span');
        this.div.classList.add('clip');
        this.div.tabIndex = 1;
        this.div.draggable = true;
        this.div.id = `clip${Math.random()}${window.performance.now()}`;
        this.div.classList.add('armed');
        this.clip.setArmed(true);
        manifest_1.Manifest.add(this.div, this.clip);
        const workspace = document.getElementById('workspace');
        workspace.appendChild(this.div);
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.div.clientWidth * 2;
        this.canvas.height = this.div.clientHeight * 2;
        this.canvas.style.setProperty('width', `${this.div.clientWidth}px`);
        this.canvas.style.setProperty('height', `${this.div.clientHeight}px`);
        this.div.appendChild(this.canvas);
        this.samples = new Float32Array(this.canvas.width);
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
                    this.clip.changeDuration(-0.1, this.clipMaster.getBpm());
                    break;
                case 'ArrowUp':
                    this.clip.changeDuration(0.1, this.clipMaster.getBpm());
                    break;
                default: actionTaken = false;
            }
            if (actionTaken) {
                this.updateBody();
                this.clipMaster.start(this.audioCtx.currentTime);
            }
        });
        this.div.addEventListener('dragstart', (ev) => __awaiter(this, void 0, void 0, function* () {
            ev.dataTransfer.setData("application/my-app", this.div.id);
            ev.dataTransfer.effectAllowed = "move";
        }));
        this.div.addEventListener('pointerdown', (ev) => {
            if (this.div != document.activeElement) {
                this.div.focus();
                return;
            }
            this.div.classList.toggle('armed');
            this.clip.setArmed(this.div.classList.contains('armed'));
            this.clipMaster.start(this.audioCtx.currentTime);
        });
        this.clipMaster.addClip(this.clip);
        this.updateBody();
        this.makeDownload();
        const deleteButton = document.createElement('span');
        deleteButton.innerHTML = '&#10006';
        deleteButton.classList.add('delete');
        this.div.appendChild(deleteButton);
        deleteButton.addEventListener('pointerdown', (ev) => {
            deleteButton.classList.add('pressed');
            ev.preventDefault();
        });
        deleteButton.addEventListener('pointerleave', () => {
            deleteButton.classList.remove('pressed');
        });
        deleteButton.addEventListener('pointerup', (ev) => {
            if (this.clip.parent && this.clip.parent instanceof sequence_1.Sequence) {
                this.clip.parent.removeSample(this.clip);
            }
            this.clip.setArmed(false);
            this.div.remove();
            ev.preventDefault();
            // We haven't really deleted the clip.  It's just invisible and
            // muted and not part of any sequence.
        });
    }
    renderPeaks(ctx, samples) {
        let x = 0;
        ctx.fillStyle = 'red';
        const r = Math.round(this.canvas.width / 2);
        for (const v of samples) {
            const absV = Math.pow(Math.abs(v), 0.4);
            const h = absV * this.canvas.height;
            const y = this.canvas.height - 0.9 * h;
            if (x === r) {
                ctx.fillStyle = '#009';
            }
            ctx.fillRect(x++, y, 1, absV * this.canvas.height);
        }
    }
    updateBody() {
        const mar = new measuresAndRemainder_1.MeasuresAndRemainder(this.clip.getDurationS(), this.clipMaster.getBpm());
        this.makeDownload();
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const r = this.canvas.width / 2;
        this.clip.getSamples(0, this.samples);
        this.renderPeaks(ctx, this.samples);
        ctx.font = 'bold 90px mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${mar.measures.toFixed(0)}`, r, r + 90 / 2);
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
                a.innerHTML = '&#x21e9;';
                a.classList.add('download');
                this.div.appendChild(a);
            }
            if (this.downloadTimer) {
                clearTimeout(this.downloadTimer);
            }
            a.href = null;
            this.downloadTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                this.downloadTimer = null;
                a.href = yield this.clip.toDataUri();
            }), 500);
        });
    }
}
exports.ClipCommander = ClipCommander;
//# sourceMappingURL=clipCommander.js.map

/***/ }),

/***/ 977:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClipMaster = void 0;
const manifest_1 = __webpack_require__(906);
const sequenceCommander_1 = __webpack_require__(481);
class ClipMaster {
    constructor(audioContext) {
        this.clips = new Set();
        this.bpm = null;
        this.startTimeS = null;
        this.audioCtx = audioContext;
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
        const bucket = document.createElement('span');
        bucket.innerText = '+ new bucket';
        bucket.classList.add('bucket');
        bucket.addEventListener('dragover', (ev) => {
            ev.dataTransfer.dropEffect = 'move';
            ev.preventDefault();
        });
        bucket.addEventListener('drop', (ev) => {
            const data = ev.dataTransfer.getData("application/my-app");
            this.newBucket(document.getElementById(data));
            ev.preventDefault();
        });
        const workspace = document.getElementById('workspace');
        workspace.appendChild(bucket);
        const bugContainer = document.createElement('div');
        const bugButton = document.createElement('span');
        bugContainer.appendChild(bugButton);
        bugButton.innerText = 'debug';
        const debug = document.createElement('textarea');
        debug.classList.add('debug');
        debug.contentEditable = "false";
        debug.innerText = 'Hello, World!';
        bugContainer.appendChild(debug);
        body.appendChild(bugContainer);
        bugButton.addEventListener('pointerdown', (ev) => {
            debug.value =
                `clips: ${JSON.stringify(this.getDebugObject(), null, 2)}` +
                    ` manifest: ${JSON.stringify(manifest_1.Manifest.getDebugObject(), null, 2)}`;
        });
    }
    newBucket(firstElement) {
        const sequenceCommander = new sequenceCommander_1.SequenceCommander(this.audioCtx, firstElement, document.getElementById('workspace'), this); // Very bad horrible circular dependency.
        this.clips.add(sequenceCommander.getSequence());
    }
    start(startTimeS) {
        this.startTimeS = startTimeS;
        for (const clip of this.clips) {
            if (clip.isArmed() && !clip.parent) {
                clip.startLoop(startTimeS);
            }
            else {
                clip.stop(startTimeS);
            }
        }
    }
    nearestDownBeat(referenceTimeS) {
        if (!this.startTimeS || !this.bpm) {
            return referenceTimeS;
        }
        const elapsed = referenceTimeS - this.startTimeS;
        const secondsPerMeasure = 4 * 60 / this.bpm;
        const measureNumber = Math.round(elapsed / secondsPerMeasure);
        return this.startTimeS + measureNumber * secondsPerMeasure;
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
        this.clips.add(clip);
        if (!this.bpm) {
            this.durationToBeats(clip.getDurationS());
        }
        clip.setBpm(this.bpm);
    }
    getBpm() {
        return this.bpm;
    }
    getDebugObject() {
        const result = [];
        for (const c of this.clips.values()) {
            result.push(c.getDebugObject());
        }
        return result;
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
const sampleSource_1 = __webpack_require__(930);
const sampleStream_1 = __webpack_require__(387);
console.log("Breathe.");
function go() {
    return __awaiter(this, void 0, void 0, function* () {
        //const m = new Memory();
        const audio = yield audio_1.Audio.make();
        const ss = yield sampleSource_1.SampleSource.make(audio);
        const stream = new sampleStream_1.SampleStream(ss, audio.audioCtx);
        const workspace = document.createElement('div');
        workspace.id = 'workspace';
        document.getElementsByTagName('body')[0].appendChild(workspace);
        const bb = new bigButton_1.BigButton(audio.audioCtx, stream);
    });
}
go();
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 906:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Manifest = void 0;
class Manifest {
    static add(container, sample) {
        Manifest.samples.set(container.id, sample);
        Manifest.containers.set(container.id, container);
        Manifest.ids.set(sample, container.id);
    }
    static getSampleById(id) {
        return this.samples.get(id);
    }
    static getContainerById(id) {
        return this.containers.get(id);
    }
    static getContainerBySample(sample) {
        return this.containers.get(this.ids.get(sample));
    }
    static getDebugObject() {
        const sampleArray = [];
        for (const [k, v] of this.samples.entries()) {
            sampleArray.push({ id: k, sample: v.getDebugObject() });
        }
        return { samples: sampleArray };
    }
}
exports.Manifest = Manifest;
Manifest.samples = new Map();
Manifest.containers = new Map();
Manifest.ids = new Map();
//# sourceMappingURL=manifest.js.map

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
            autoGainControl: false,
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
            setTimeout(render, 50);
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

/***/ 500:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sequence = void 0;
class Sequence {
    constructor(audioContext, firstSample) {
        this.samples = [];
        this.loopTimeout = null;
        this.parent = null;
        this.audioCtx = audioContext;
        this.addSample(firstSample);
    }
    addSample(sample) {
        console.log(`AAAAA: addSample`);
        if (sample.parent && sample.parent instanceof Sequence) {
            sample.parent.removeSample(sample);
        }
        this.samples.push(sample);
        sample.parent = this;
    }
    removeSample(sample) {
        const indexToRemove = this.samples.indexOf(sample);
        console.log(`AAAAA: removeSample ${indexToRemove}`);
        if (indexToRemove >= 0) {
            this.samples.splice(indexToRemove, 1);
        }
        sample.parent = null;
    }
    isArmed() {
        for (const s of this.samples) {
            if (s.isArmed()) {
                return true;
            }
        }
        return false;
    }
    startLoop(startTimeS) {
        this.startOneShot(startTimeS);
        const nextQueue = startTimeS + this.getDurationS();
        const sleepMs = (nextQueue - this.audioCtx.currentTime - 0.1) * 1000;
        console.log(`Sleep: ${sleepMs.toFixed(1)}`);
        clearTimeout(this.loopTimeout);
        this.loopTimeout = setTimeout(() => {
            this.startLoop(nextQueue);
        }, sleepMs);
    }
    startOneShot(startTimeS) {
        let cueTimeS = startTimeS;
        for (const s of this.samples) {
            s.startOneShot(cueTimeS);
            cueTimeS += s.getDurationS();
        }
    }
    stop(stopTimeS) {
        clearTimeout(this.loopTimeout);
        this.loopTimeout = null;
        for (const s of this.samples) {
            s.stop(stopTimeS);
        }
    }
    setBpm(bpm) {
        for (const s of this.samples) {
            s.setBpm(bpm);
        }
    }
    getDurationS() {
        let totalDurationS = 0;
        for (const s of this.samples) {
            totalDurationS += s.getDurationS();
        }
        return totalDurationS;
    }
    getDebugObject() {
        const result = [];
        for (const s of this.samples) {
            result.push(s.getDebugObject());
        }
        return { samples: result, totalDuration: this.getDurationS() };
    }
}
exports.Sequence = Sequence;
//# sourceMappingURL=sequence.js.map

/***/ }),

/***/ 481:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SequenceCommander = void 0;
const sequence_1 = __webpack_require__(500);
const manifest_1 = __webpack_require__(906);
class SequenceCommander {
    constructor(audioContext, firstElement, workspace, clipMaster) {
        this.audioCtx = audioContext;
        const bucket = document.createElement('span');
        bucket.id = `bucket${Math.random()}${window.performance.now()}`;
        bucket.classList.add('bucket');
        bucket.appendChild(firstElement);
        workspace.appendChild(bucket);
        const firstSample = manifest_1.Manifest.getSampleById(firstElement.id);
        this.sequence = new sequence_1.Sequence(this.audioCtx, firstSample);
        manifest_1.Manifest.add(bucket, this.sequence);
        bucket.addEventListener('dragover', (ev) => {
            ev.dataTransfer.dropEffect = 'move';
            ev.preventDefault();
        });
        bucket.addEventListener('drop', (ev) => {
            console.log(`AAAAA: Drop into existing`);
            const data = ev.dataTransfer.getData("application/my-app");
            bucket.appendChild(document.getElementById(data));
            const sample = manifest_1.Manifest.getSampleById(data);
            const sequence = manifest_1.Manifest.getSampleById(bucket.id);
            if (sequence instanceof sequence_1.Sequence) {
                sequence.addSample(sample);
            }
            else {
                console.log(`AAAAA: Bucket is not a sequence! ${bucket.id}`);
            }
            ev.preventDefault();
            clipMaster.start(this.audioCtx.currentTime);
        });
    }
    getSequence() {
        return this.sequence;
    }
}
exports.SequenceCommander = SequenceCommander;
//# sourceMappingURL=sequenceCommander.js.map

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