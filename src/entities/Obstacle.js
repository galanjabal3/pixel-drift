import { GROUND } from '../config/layout.js';

export class Obstacle {
  constructor({ x, w, kind, h, bottom }) {
    this.x = x;
    this.w = w;
    this.kind = kind;
    this.h = h;
    this.bottom = bottom;
  }

  update(dt, speed) {
    this.x -= speed * dt;
  }

  get offscreen() {
    return this.x + this.w < -40;
  }

  rect() {
    if (this.kind === 'floor') {
      return { left: this.x, right: this.x + this.w, top: GROUND - this.h, bottom: GROUND };
    }
    return { left: this.x, right: this.x + this.w, top: 0, bottom: this.bottom };
  }
}