/* Shared background-scroll lock for overlay components (modal, confirmation-modal,
   drawer, fullscreen-modal, …). A ref-count composes stacked overlays: only the
   first lock touches <body>, only the last unlock restores it. The scrollbar
   width is padded back so the page behind doesn't shift when the bar disappears.

   Each caller must lock at most once per open and unlock exactly once (guard with
   an instance flag) so the count stays balanced — e.g.:

     open():   if (!this._locked) { this._locked = true;  lockScroll();  }
     close():  if (this._locked)  { this._locked = false; unlockScroll(); }

   and call unlockScroll() from disconnectedCallback when still locked, so an
   overlay removed while open can't leave the page frozen. */

let _locks = 0;
let _prevOverflow = '';
let _prevPadRight = '';

export function lockScroll() {
  if (typeof document === 'undefined') return;
  if (_locks === 0) {
    const b = document.body;
    _prevOverflow = b.style.overflow;
    _prevPadRight = b.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    if (sbw > 0) b.style.paddingRight = `${(parseFloat(getComputedStyle(b).paddingRight) || 0) + sbw}px`;
    b.style.overflow = 'hidden';
  }
  _locks++;
}

export function unlockScroll() {
  if (typeof document === 'undefined' || _locks === 0) return;
  _locks--;
  if (_locks === 0) {
    document.body.style.overflow = _prevOverflow;
    document.body.style.paddingRight = _prevPadRight;
  }
}
