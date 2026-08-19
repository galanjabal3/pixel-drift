const HOLD_KEYS = ['Space', 'ArrowUp', 'KeyW'];

export class InputHandler {
  constructor({ element, onHold, onStart, onTogglePause }) {
    this.element = element;
    this.onHold = onHold;
    this.onStart = onStart;
    this.onTogglePause = onTogglePause;
    this._keydown = this._keydown.bind(this);
    this._keyup = this._keyup.bind(this);
    this._pdown = this._pdown.bind(this);
    this._pup = this._pup.bind(this);
    this._ctx = this._ctx.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this._keydown);
    window.addEventListener('keyup', this._keyup);
    this.element.addEventListener('pointerdown', this._pdown);
    window.addEventListener('pointerup', this._pup);
    this.element.addEventListener('contextmenu', this._ctx);
  }

  destroy() {
    window.removeEventListener('keydown', this._keydown);
    window.removeEventListener('keyup', this._keyup);
    this.element.removeEventListener('pointerdown', this._pdown);
    window.removeEventListener('pointerup', this._pup);
    this.element.removeEventListener('contextmenu', this._ctx);
  }

  _isUiTarget(target) {
    return Boolean(target && target.closest && target.closest('button, .overlay, [data-ui]'));
  }

  _keydown(e) {
    const k = e.code;
    if (HOLD_KEYS.includes(k)) {
      e.preventDefault();
      if (e.repeat) return;
      this.onHold(true);
      this.onStart();
    } else if (k === 'Escape' || k === 'KeyP') {
      this.onTogglePause();
    } else if (k === 'Enter') {
      this.onStart();
    }
  }

  _keyup(e) {
    if (HOLD_KEYS.includes(e.code)) this.onHold(false);
  }

  _pdown(e) {
    if (this._isUiTarget(e.target)) return;
    e.preventDefault();
    this.onHold(true);
    this.onStart();
  }

  _pup() {
    this.onHold(false);
  }

  _ctx(e) {
    e.preventDefault();
  }
}