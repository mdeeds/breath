
type ButtonMode = 'stopped' | 'playing' | 'recording' | 'overdubbing';

export class BigButton {
  mode: ButtonMode = 'stopped';
  canvas: HTMLCanvasElement = null;
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 400;
    this.canvas.height = 400;
    this.canvas.classList.add('bigButton');
    this.canvas.addEventListener('pointerdown', (ev: PointerEvent) => {
      this.press();
    });

    const body = document.getElementsByTagName('body')[0];
    body.appendChild(this.canvas);
    this.render();
  }

  press() {
    switch (this.mode) {
      case 'stopped': this.mode = 'recording'; break;
      case 'playing': this.mode = 'overdubbing'; break;
      case 'recording': this.mode = 'overdubbing'; break;
      case 'overdubbing': this.mode = 'playing'; break;
    }
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    switch (this.mode) {
      case 'stopped': ctx.strokeStyle = '#000'; break;
      case 'playing': ctx.strokeStyle = '#0f0'; break;
      case 'recording': ctx.strokeStyle = '#f00'; break;
      case 'overdubbing': ctx.strokeStyle = '#aa0'; break;
    }
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.arc(200, 200, 150, -Math.PI, Math.PI);
    ctx.stroke();

    requestAnimationFrame(() => { this.render(); });
  }
}