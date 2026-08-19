import { Renderer } from './render/Renderer.js';
import { Player } from './entities/Player.js';
import { Obstacle } from './entities/Obstacle.js';
import { PowerUp } from './entities/PowerUp.js';
import { GameLoop } from './engine/GameLoop.js';
import { InputHandler } from './engine/InputHandler.js';
import { Sound } from './engine/Sound.js';
import { Physics } from './engine/Physics.js';
import { defaultTheme } from './config/theme.js';
import { createTheme } from './config/themes.js';
import { LAYOUT, GROUND, SPAWN } from './config/layout.js';

const BEST_KEY = 'pixeldrift_best';

export class PixelDrift {
  constructor({ canvas, theme = {}, callbacks = {} }) {
    this.canvas = canvas;
    this.theme = createTheme(theme);
    this.callbacks = callbacks;

    this.LW = LAYOUT.width;
    this.LH = LAYOUT.height;
    this.GROUND = GROUND;
    this.PLAYER_X = LAYOUT.playerX;
    this.S = LAYOUT.cell;
    this.MIN_ALT = LAYOUT.minAlt;
    this.MAX_ALT = GROUND - LAYOUT.maxAltOffset;

    this.player = new Player({
      x: this.PLAYER_X,
      ground: this.GROUND,
      minAlt: this.MIN_ALT,
      maxAlt: this.MAX_ALT,
      cell: this.S,
startY: this.GROUND - 60,
    });

    this.obstacles = [];
    this.orbs = [];
    this.powerups = [];
    this.orbsCollected = 0;

    this.mode = 'start';
    this.t = 0;
    this.speed = SPAWN.speedBase;
    this.score = 0;
    this.shake = 0;
    this.best = 0;
    this._level = 1;
    this._prog = 0;

    try {
      this.best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
    } catch (e) {}

    this.sound = new Sound();
    this.renderer = new Renderer(canvas, {
      LW: this.LW,
      LH: this.LH,
      GROUND: this.GROUND,
      PLAYER_X: this.PLAYER_X,
      S: this.S,
      MIN_ALT: this.MIN_ALT,
      MAX_ALT: this.MAX_ALT,
      theme: this.theme,
    });

    this.loop = new GameLoop({
      update: (dt) => this._update(dt),
      render: () => this.renderer.render(this._state()),
    });

    this.input = new InputHandler({
      element: canvas.parentElement || canvas,
      onHold: (v) => this.setHold(v),
      onStart: () => this._action(),
      onTogglePause: () => this.togglePause(),
    });

    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
    this.resize();

    this.input.attach();
    this.loop.start();
  }

  // ---------- public API ----------

  getState() {
    return {
      mode: this.mode,
      level: this._level,
      score: this.score,
      best: this.best,
      speed: this.speed,
      orbs: this.orbsCollected,
    };
  }

  getBest() {
    return this.best;
  }

  start() {
    this.sound.unlock();
    this._goPlay();
  }

  toMenu() {
    this._reset();
    this._setMode('start');
  }

  togglePause() {
    if (this.mode === 'playing') {
      this.player.holding = false;
      this._setMode('paused');
    } else if (this.mode === 'paused') {
      this._setMode('playing');
    }
  }

  setHold(v) {
    if (this.mode === 'playing') this.player.holding = v;
  }

  resize() {
    const rect = (this.canvas.parentElement || this.canvas).getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.resize({
      dpr,
      vw: rect.width,
      vh: rect.height,
      scale: Math.min(rect.width / this.LW, rect.height / this.LH),
      ox: (rect.width - this.LW * Math.min(rect.width / this.LW, rect.height / this.LH)) / 2,
      oy: (rect.height - this.LH * Math.min(rect.width / this.LW, rect.height / this.LH)) / 2,
    });
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
    window.removeEventListener('resize', this._resize);
  }

  // ---------- internals ----------

  _action() {
    if (this.mode === 'start' || this.mode === 'gameover') {
      this.sound.unlock();
      this._goPlay();
    }
  }

  _goPlay() {
    this._reset();
    this._setMode('playing');
    this.sound.start();
  }

  _reset() {
    this.player.reset();
    this._level = 1;
    this.speed = SPAWN.speedBase;
    this.score = 0;
    this.shake = 0;
    this.obstacles = [];
    this.orbs = [];
    this.powerups = [];
    this.orbsCollected = 0;
    this._prog = 0;
    this._nextSpawn = SPAWN.spawnGapBase;
    this._nextOrb = 0;
    this._nextPower = SPAWN.powerEvery[0];
  }

  _setMode(mode) {
    this.mode = mode;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.mode, this.getState());
    }
  }

  _state() {
    return {
      mode: this.mode,
      t: this.t,
      speed: this.speed,
      player: {
        py: this.player.py,
        vy: this.player.vy,
        shield: this.player.shield,
      },
      obstacles: this.obstacles,
      orbs: this.orbs,
      powerups: this.powerups,
      shake: this.shake,
    };
  }

  _update(dt) {
    this.t += dt;
    if (this.mode !== 'playing') return;

    this.score += dt * this.speed * SPAWN.pointRate;
    this._prog += dt * this.speed * SPAWN.progRate;

    const lvl = this._levelFromProgress();
    if (lvl !== this._level) {
      const prev = this._level;
      this._level = lvl;
      if (lvl > prev) {
        this.sound.level();
        if (this.callbacks.onLevelUp) this.callbacks.onLevelUp(lvl, this.getState());
      }
    }

    const P = this._levelParams(this._level);
    this.speed = P.speed;
    if (this.callbacks.onTick) this.callbacks.onTick(this.getState());

    this.player.update(dt);

    this._nextSpawn -= this.speed * dt;
    if (this._nextSpawn <= 0) {
      this._spawnPattern(P);
      this._nextSpawn = P.spawnGap;
    }
    this._nextOrb -= dt;
    if (this._nextOrb <= 0) {
      this._spawnOrb();
      this._nextOrb = SPAWN.orbEvery[0] + Math.random() * (SPAWN.orbEvery[1] - SPAWN.orbEvery[0]);
    }
    this._nextPower -= dt;
    if (this._nextPower <= 0 && this.powerups.length < 1) {
      this._spawnPower();
      this._nextPower = SPAWN.powerEvery[0] + Math.random() * (SPAWN.powerEvery[1] - SPAWN.powerEvery[0]);
    }

    for (const o of this.obstacles) o.update(dt, this.speed);
    this.obstacles = this.obstacles.filter((o) => !o.offscreen);
    for (const o of this.orbs) o.update(dt, this.speed);
    this.orbs = this.orbs.filter((o) => !o.offscreen);
    for (const p of this.powerups) p.update(dt, this.speed);
    this.powerups = this.powerups.filter((p) => !p.offscreen);

    this._collide();

    if (this.shake > 0) this.shake -= dt;
  }

  _levelFromProgress() {
    return Math.floor(this._prog / SPAWN.levelDist) + 1;
  }

  _levelParams(level) {
    const S = SPAWN;
    return {
      speed: Math.min(S.speedBase + (level - 1) * S.speedPerLevel, S.speedMax),
      spawnGap: Math.max(S.spawnGapMin, S.spawnGapBase - (level - 1) * S.spawnGapPerLevel),
      gateGap: Math.max(S.gateGapMin, S.gateGapBase - (level - 1) * S.gateGapPerLevel),
      floorMaxH: Math.min(S.floorHiMax, S.floorHiBase + (level - 1) * S.floorHiPerLevel),
      ceilLo: Math.min(S.ceilLoMax, S.ceilLoBase + (level - 1) * S.ceilLoPerLevel),
      ceilHi: Math.min(S.ceilHiMax, S.ceilHiBase + (level - 1) * S.ceilHiPerLevel),
      pool: level >= 3 ? ['floor', 'ceil', 'gate'] : level === 2 ? ['floor', 'ceil'] : ['floor'],
    };
  }

  _spawnPattern(P) {
    const kind = P.pool[Math.floor(Math.random() * P.pool.length)];
    const LW = this.LW;
    if (kind === 'floor') {
      const h = SPAWN.floorMinH + Math.random() * (P.floorMaxH - SPAWN.floorMinH);
      this.obstacles.push(new Obstacle({ x: LW + 40, w: 24, kind: 'floor', h }));
    } else if (kind === 'ceil') {
      const b = P.ceilLo + Math.random() * (P.ceilHi - P.ceilLo);
      this.obstacles.push(new Obstacle({ x: LW + 40, w: 24, kind: 'ceil', bottom: b }));
    } else {
      const gap = P.gateGap;
      const c = SPAWN.gateCMin + Math.random() * (SPAWN.gateCMax - SPAWN.gateCMin);
      const ceilBottom = c - gap / 2;
      const floorTop = c + gap / 2;
      this.obstacles.push(
        new Obstacle({ x: LW + 40, w: 26, kind: 'floor', h: Math.max(30, this.GROUND - floorTop) }),
        new Obstacle({ x: LW + 40, w: 26, kind: 'ceil', bottom: ceilBottom }),
      );
    }
  }

  _spawnOrb() {
    this.orbs.push(
      new PowerUp({
        x: this.LW + 50,
        y: this.MIN_ALT + 12 + Math.random() * (this.MAX_ALT - this.MIN_ALT - 24),
        kind: 'orb',
      }),
    );
  }

  _spawnPower() {
    this.powerups.push(
      new PowerUp({
        x: this.LW + 50,
        y: this.MIN_ALT + 20 + Math.random() * (this.MAX_ALT - this.MIN_ALT - 40),
        kind: 'power',
      }),
    );
  }

  _collide() {
    const p = this.player.hitbox();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      if (Physics.rects(p, o.rect())) {
        if (this.player.shield) {
          this.sound.shield();
          this.player.shield = false;
          this.obstacles.splice(i, 1);
          this.shake = 0.25;
          continue;
        }
        this.sound.hit();
        this._gameOver();
        return;
      }
    }

    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i];
      if (
        p.right > o.x - 10 && p.left < o.x + 10 &&
        p.bottom > o.y - 10 && p.top < o.y + 10
      ) {
        this.orbs.splice(i, 1);
        this.score += 100;
        this.orbsCollected += 1;
        this.sound.orb();
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pU = this.powerups[i];
      if (
        p.right > pU.x - 14 && p.left < pU.x + 14 &&
        p.bottom > pU.y - 16 && p.top < pU.y + 16
      ) {
        this.powerups.splice(i, 1);
        this.player.shield = true;
        this.sound.power();
      }
    }
  }

  _gameOver() {
    const s = Math.floor(this.score);
    const isNew = s > this.best;
    if (isNew) {
      this.best = s;
      try {
        localStorage.setItem(BEST_KEY, String(this.best));
      } catch (e) {}
    }
    this._setMode('gameover');
  }
}

export { defaultTheme, LAYOUT, GROUND, SPAWN };
export { createTheme, darkTheme, lightTheme, sobatPintarTheme, kantinTheme, themes } from './config/themes.js';
export { Renderer } from './render/Renderer.js';
export { Player } from './entities/Player.js';
export { Obstacle } from './entities/Obstacle.js';
export { PowerUp } from './entities/PowerUp.js';
export { GameLoop } from './engine/GameLoop.js';
export { InputHandler } from './engine/InputHandler.js';
export { Sound } from './engine/Sound.js';
export { Physics } from './engine/Physics.js';