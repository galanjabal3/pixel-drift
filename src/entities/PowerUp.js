export class PowerUp {
  constructor({ x, y, kind }) {
    this.x = x;
    this.y = y;
    this.kind = kind;
  }

  update(dt, speed) {
    this.x -= speed * dt;
  }

  get offscreen() {
    return this.x < -40;
  }

  rect(radius) {
    return {
      left: this.x - radius,
      right: this.x + radius,
      top: this.y - radius,
      bottom: this.y + radius,
    };
  }
}