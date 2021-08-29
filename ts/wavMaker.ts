// Cribbed from https://github.com/awslabs/aws-lex-browser-audio-capture/blob/master/lib/worker.js

// Better ??? https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
// Not sure how to use an offline audio context or otherwise create an offline stream...
export class WavMaker {
  static makeWav(audioContext: AudioContext, buffer: AudioBuffer, startOffsetS: number, durationS: number): DataView {
    // TODO
    throw new Error('not implemented');
  }

  private static floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  private static writeString(view: DataView, offset: number, s: string) {
    for (var i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
  }

  static makeWavFromFloat32(sampleRate: number, samples: Float32Array) {
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