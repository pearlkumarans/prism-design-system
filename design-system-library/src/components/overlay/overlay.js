/* =============================================================================
   <ds-overlay type="dim" open></ds-overlay>

   Scrim/backdrop placed behind modals, dialogs, drawers, and popovers.
   The host element itself is the full-viewport layer (no children).

   Attributes:
     type    — dim (default) | light | transparent | blur | dim-blur
     open    — boolean; overlay is visible while present
     static  — boolean; suppress click-dismiss (blocking/required dialogs)

   Events:
     ds-dismiss — fired on overlay click (unless [static]). The overlaid
                  surface owns its own state: listen and close/remove there.
                  Escape handling belongs to the surface, not the overlay.

   Body scroll is locked while at least one non-transparent overlay is open.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const TYPES = ['dim', 'light', 'transparent', 'blur', 'dim-blur'];

let _openCount = 0;
let _prevBodyOverflow = '';

function lockScroll() {
  if (_openCount === 0) {
    _prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  _openCount += 1;
}

function unlockScroll() {
  _openCount = Math.max(0, _openCount - 1);
  if (_openCount === 0) document.body.style.overflow = _prevBodyOverflow;
}

export class DsOverlay extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'open', 'static'];
  }

  connectedCallback() {
    if (!this._wired) {
      this._wired = true;
      this._locked = false;

      // Decorative layer: never focusable, hidden from the a11y tree.
      this.setAttribute('aria-hidden', 'true');

      this.addEventListener('click', (e) => {
        if (e.target !== this) return;
        if (boolAttr(this, 'static')) return;
        this.dispatchEvent(new CustomEvent('ds-dismiss', { bubbles: true, composed: true }));
      });
    }
    this._sync();
  }

  disconnectedCallback() {
    if (this._locked) {
      unlockScroll();
      this._locked = false;
    }
  }

  attributeChangedCallback() {
    if (this._wired) this._sync();
  }

  get type() {
    return enumAttr(this, 'type', TYPES, 'dim');
  }

  get open() {
    return boolAttr(this, 'open');
  }

  set open(value) {
    if (value) this.setAttribute('open', '');
    else this.removeAttribute('open');
  }

  _sync() {
    // Normalise an invalid/missing type back to the default so CSS matches.
    const type = this.type;
    if (this.getAttribute('type') !== type) this.setAttribute('type', type);

    // Scroll lock follows open state (transparent click-traps don't lock).
    const shouldLock = this.open && this.isConnected && type !== 'transparent';
    if (shouldLock && !this._locked) {
      lockScroll();
      this._locked = true;
    } else if (!shouldLock && this._locked) {
      unlockScroll();
      this._locked = false;
    }
  }
}

if (!customElements.get('ds-overlay')) {
  customElements.define('ds-overlay', DsOverlay);
}
