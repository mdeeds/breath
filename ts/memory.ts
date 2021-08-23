export class Memory {
  constructor() {
    const div = document.createElement('div');
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(div);
    const f = function () {
      div.innerText = (((window.performance as any)
        .memory.usedJSHeapSize as number) / 1000000).toFixed(3)
        + "MB";
      setTimeout(f, 100);
    }
    f();
  }
}