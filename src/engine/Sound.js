export class Sound {
  constructor() {
    this.ctx = null;
  }

  unlock() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  _tone(freq, dur, type = 'square', vol = 0.16, delay = 0, glide = 0) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, glide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  start() {
    this._tone(520, 0.09, 'square', 0.12);
    this._tone(780, 0.1, 'square', 0.1, 0.09);
  }

  level() {
    this._tone(660, 0.08, 'square', 0.12);
    this._tone(880, 0.1, 'square', 0.1, 0.08);
  }

  orb() {
    this._tone(920, 0.09, 'sine', 0.14);
    this._tone(1380, 0.12, 'sine', 0.12, 0.07);
  }

  power() {
    this._tone(420, 0.12, 'triangle', 0.16);
    this._tone(560, 0.14, 'triangle', 0.14, 0.1);
    this._tone(840, 0.18, 'triangle', 0.1, 0.2);
  }

  hit() {
    this._tone(300, 0.2, 'sawtooth', 0.2, 0, 60);
  }

  shield() {
    this._tone(640, 0.09, 'square', 0.14, 0, 900);
  }
}