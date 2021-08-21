
type ButtonMode = 'stopped' | 'playing' | 'recording' | 'overdubbing';

export class BigButton {
  mode: ButtonMode = 'stopped';
  canvas: HTMLCanvasElement = null;
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('button');
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.canvas);
    this.render();
  }

  press() {

  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.arc(50, 50, 40, -Math.PI, Math.PI);
    ctx.stroke();

    requestAnimationFrame(() => { this.render(); });
  }
}