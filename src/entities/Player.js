export class Player {
  constructor({ x, ground, minAlt, maxAlt, cell, startY }) {
    this.x = x;
    this.ground = ground;
    this.minAlt = minAlt;
    this.maxAlt = maxAlt;
    this.cell = cell;
    this.startY = startY;
    this.py = startY;
    this.vy = 0;
    this.holding = false;
    this.shield = false;
  }

  reset() {
    this.py = this.startY;
    this.vy = 0;
    this.holding = false;
    this.shield = false;
  }

  update(dt) {
    if (this.holding) this.vy -= 1500 * dt;
    else this.vy += 1750 * dt;
    this.vy = Math.max(-255, Math.min(255, this.vy));
    this.py += this.vy * dt;

    if (this.py < this.minAlt) {
      this.py = this.minAlt;
      this.vy = Math.max(0, this.vy);
    } else if (this.py > this.maxAlt) {
      this.py = this.maxAlt;
      this.vy = Math.min(0, this.vy);
    }
  }

  hitbox() {
    const hw = 6 * this.cell - 4;
    return {
      left: this.x - hw,
      right: this.x + hw,
      top: this.py - (16 * this.cell - 3),
      bottom: this.py - 5 * this.cell,
    };
  }
}