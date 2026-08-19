export class GameLoop {
  constructor({ update, render, maxDt = 0.05 } = {}) {
    this.update = update;
    this.render = render;
    this.maxDt = maxDt;
    this.raf = 0;
    this.last = 0;
    this.running = false;
    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  tick(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, this.maxDt);
    this.last = now;
    this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(this.tick);
  }
}