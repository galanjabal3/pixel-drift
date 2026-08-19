import { defaultTheme } from '../config/theme.js';

const PARTS = [
  { x: -6, y: 6, w: 12, h: 10, k: 'body' },
  { x: -3, y: 11, w: 3, h: 4, k: 'core' },
  { x: -2, y: 10, w: 4, h: 3, k: 'eye' },
  { x: -3, y: 13, w: 5, h: 1, k: 'body' },
  { x: -5, y: 16, w: 2, h: 2, k: 'fin' },
  { x: 2, y: 16, w: 2, h: 3, k: 'fin' },
];

export class Renderer {
  constructor(canvas, { LW, LH, GROUND, PLAYER_X, S, MIN_ALT, MAX_ALT, theme }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.LW = LW;
    this.LH = LH;
    this.GROUND = GROUND;
    this.PLAYER_X = PLAYER_X;
    this.S = S;
    this.MIN_ALT = MIN_ALT;
    this.MAX_ALT = MAX_ALT;
    this.T = { ...defaultTheme, ...theme };

    this.dpr = 1;
    this.vw = 0;
    this.vh = 0;
    this.scale = 1;
    this.ox = 0;
    this.oy = 0;
  }

  resize({ dpr, vw, vh, scale, ox, oy }) {
    this.dpr = dpr;
    this.vw = vw;
    this.vh = vh;
    this.scale = scale;
    this.ox = ox;
    this.oy = oy;
    this.canvas.width = Math.round(vw * dpr);
    this.canvas.height = Math.round(vh * dpr);
  }

  _blk(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(-(y + h)), Math.round(w), Math.round(h));
  }

  _cell(x, y, w, h, color) {
    this._blk(x * this.S, y * this.S, w * this.S, h * this.S, color);
  }

  _drawTrail(ox, oy, t, intensity) {
    const S = this.S;
    const n = 9;
    const base = t * 13;
    for (let i = 1; i <= n; i++) {
      const tx = ox - 7 * S - i * 4 * S;
      const wave = Math.sin(base - i * 0.85) * (i * 0.9) * S;
      const ty = oy + 9 * S + wave;
      const a = (0.85 - i * 0.08) * intensity;
      if (a <= 0.02) continue;
      const sz = (3 - (i % 2)) * S;
      this.ctx.globalAlpha = a;
      this._blk(tx, ty, sz, sz, this.T.trail);
    }
    this.ctx.globalAlpha = 1;
  }

  _drawDrifter(px, py, t, opts) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Math.round(px), Math.round(py));
    const bob = opts.bob ? Math.round(Math.sin(t * 11) * 3) : 0;
    ctx.save();
    ctx.translate(0, bob);
    if (opts.tilt) ctx.rotate(opts.tilt);
    this._drawTrail(0, 0, t, opts.trail || 0);
    for (const p of PARTS) {
      const c = p.k === 'core' ? this.T.core : p.k === 'fin' ? this.T.trail : p.k === 'eye' ? this.T.eye : this.T.body;
      this._cell(p.x, p.y, p.w, p.h, c);
    }
    this._cell(1, 10, 1, 3, this.T.pupil);
    if (opts.shield) this._drawShield(t);
    ctx.restore();
    ctx.restore();
  }

  _drawShield(t) {
    const ctx = this.ctx;
    const cx = 0;
    const cy = -11 * this.S;
    const r = 15 * this.S;
    const pulse = 0.84 + 0.1 * Math.sin(t * 7);
    const alpha = 0.6 + 0.2 * Math.sin(t * 6);

    const gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 1.15);
    gr.addColorStop(0, 'rgba(61,255,182,.2)');
    gr.addColorStop(1, 'rgba(61,255,182,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.T.pow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + i * Math.PI / 3;
      const x = cx + Math.cos(a) * r * pulse;
      const y = cy + Math.sin(a) * r * pulse;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = '#c9ffe8';
    ctx.lineWidth = 1.5;
    const rot = t * 0.7;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = rot + i * Math.PI / 3;
      const x = cx + Math.cos(a) * r * 0.74 * pulse;
      const y = cy + Math.sin(a) * r * 0.74 * pulse;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const a = t * 2.6 + i * Math.PI / 2;
      const x = cx + Math.cos(a) * r * 1.1 * pulse;
      const y = cy + Math.sin(a) * r * 1.1 * pulse;
      ctx.globalAlpha = 0.65 + 0.35 * Math.sin(t * 8 + i * 1.7);
      ctx.fillStyle = '#e6fff5';
      const sz = 3;
      ctx.fillRect(Math.round(x) - sz / 2, Math.round(y) - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  _drawFloorCrystal(x, w, h) {
    const ctx = this.ctx;
    const GROUND = this.GROUND;
    const top = GROUND - h;
    ctx.fillStyle = this.T.obs;
    ctx.beginPath();
    ctx.moveTo(x, GROUND);
    ctx.lineTo(x + w / 2, top);
    ctx.lineTo(x + w, GROUND);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = this.T.obsEdge;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top);
    ctx.lineTo(x + w, GROUND);
    ctx.lineTo(x + w * 0.6, GROUND);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = this.T.obsTip;
    ctx.fillRect(x + w / 2 - 2, top - 6, 4, 6);
  }

  _drawCeilCrystal(x, w, bottom) {
    const ctx = this.ctx;
    const top = 0;
    ctx.fillStyle = this.T.obs;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + w / 2, bottom);
    ctx.lineTo(x + w, top);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = this.T.obsEdge;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, bottom);
    ctx.lineTo(x + w, top);
    ctx.lineTo(x + w * 0.6, top);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = this.T.obsTip;
    ctx.fillRect(x + w / 2 - 2, bottom - 6, 4, 6);
  }

  _drawOrb(x, y, t) {
    const ctx = this.ctx;
    const b = Math.sin(t * 6 + x * 0.01) * 3;
    ctx.fillStyle = 'rgba(34,228,255,.25)';
    ctx.beginPath();
    ctx.arc(x, y + b, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.T.orb;
    ctx.beginPath();
    ctx.arc(x, y + b, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawPower(x, y, t) {
    const ctx = this.ctx;
    const b = Math.sin(t * 6) * 3;
    ctx.save();
    ctx.translate(x, y + b);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = this.T.pow;
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();
    ctx.fillStyle = 'rgba(61,255,182,.3)';
    ctx.beginPath();
    ctx.arc(x, y + b, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  render(state) {
    const ctx = this.ctx;
    const d = this.dpr;
    const s = this.scale;
    const { LW, LH, GROUND, PLAYER_X } = this;

    ctx.setTransform(d, 0, 0, d, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, this.vh);
    g.addColorStop(0, this.T.bg.top);
    g.addColorStop(0.6, this.T.bg.mid);
    g.addColorStop(1, this.T.bg.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.vw, this.vh);

    const sp = state.mode === 'playing' ? state.speed : 30;
    for (let i = 0; i < 44; i++) {
      const layer = 0.15 + (i % 3) * 0.2;
      const sx = ((i * 97 - state.t * sp * layer) % (this.vw + 20) + this.vw + 20) % (this.vw + 20) - 10;
      const sy = (i * 53) % (this.vh * 0.9);
      ctx.globalAlpha = 0.18 + (i % 4) * 0.12;
      ctx.fillStyle = this.T.star;
      ctx.fillRect(sx, sy, (i % 3 === 0) ? 3 : 2, (i % 3 === 0) ? 3 : 2);
    }
    ctx.globalAlpha = 1;

    ctx.setTransform(d * s, 0, 0, d * s, d * this.ox, d * this.oy);

    ctx.strokeStyle = this.T.playfieldGlow;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, LW, LH);

    if (state.mode === 'playing' && state.speed > 560) {
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = this.T.speedLine;
      for (let i = 0; i < 8; i++) {
        const ly = (i * 60 + 30) % LH;
        const lx = LW - ((state.t * state.speed * 2.2) % LW);
        ctx.fillRect(lx, ly, 90, 2);
      }
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = this.T.ground;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND);
    ctx.lineTo(LW, GROUND);
    ctx.stroke();
    ctx.fillStyle = this.T.groundGlow;
    ctx.fillRect(0, GROUND, LW, 2);
    ctx.fillStyle = 'rgba(58,66,112,.5)';
    const off = -(state.t * (state.mode === 'playing' ? state.speed : 40)) % 36;
    for (let x = off; x < LW; x += 36) ctx.fillRect(x, GROUND + 7, 18, 3);

    for (const o of state.obstacles) {
      if (o.kind === 'floor') this._drawFloorCrystal(o.x, o.w, o.h);
      else this._drawCeilCrystal(o.x, o.w, o.bottom);
    }
    for (const o of state.orbs) if (!o.taken) this._drawOrb(o.x, o.y, state.t);
    for (const p of state.powerups) this._drawPower(p.x, p.y, state.t);

    const tilt =
      state.mode === 'playing'
        ? Math.max(-0.1, Math.min(0.1, (-state.player.vy / 255) * 0.12))
        : 0.02;
    this._drawDrifter(PLAYER_X, state.player.py, state.t, {
      bob: state.mode !== 'gameover',
      tilt,
      trail: state.mode !== 'gameover' ? 1 + Math.max(0, -state.player.vy) / 255 * 0.5 : 0,
      shield: state.player.shield,
    });

    if (state.mode === 'playing') {
      const o = state.obstacles.find((o) => o.x + o.w > PLAYER_X - 20 && o.x < PLAYER_X + 320);
      if (o) {
        const partner = state.obstacles.find((q) => q !== o && q.kind !== o.kind && Math.abs(q.x - o.x) < 30);
        let min = 0;
        let max = Infinity;
        if (o.kind === 'floor') max = GROUND - o.h + 20;
        else min = o.bottom + 61;
        if (partner) {
          if (partner.kind === 'floor') max = Math.min(max, GROUND - partner.h + 20);
          else min = Math.max(min, partner.bottom + 61);
        }
        let hint = null;
        if (state.player.py < min - 12) hint = 'down';
        else if (state.player.py > max + 12) hint = 'up';
        if (hint) {
          const blink = 0.45 + 0.4 * Math.sin(state.t * 8);
          const ax = PLAYER_X - 64;
          const up = hint === 'up';
          const ay = up ? Math.max(120, state.player.py - 130) : state.player.py + 4;
          ctx.save();
          ctx.globalAlpha = Math.max(0.25, blink);
          ctx.fillStyle = '#ffd75e';
          ctx.translate(ax, ay);
          ctx.beginPath();
          if (up) {
            ctx.moveTo(0, -20);
            ctx.lineTo(-11, 0);
            ctx.lineTo(11, 0);
          } else {
            ctx.moveTo(0, 20);
            ctx.lineTo(-11, 0);
            ctx.lineTo(11, 0);
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillRect(-3, up ? 0 : -20, 6, 20);
          ctx.restore();
        }
      }
    }

    if (state.shake > 0) {
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#ff2fd6';
      ctx.fillRect(0, 0, LW, LH);
      ctx.restore();
    }
  }
}