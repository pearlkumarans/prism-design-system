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
/* Shared ref-counted scroll lock — replaces a local copy so overlay composes with
   the modal family (one counter) and gains scrollbar-shift compensation. */
import { lockScroll, unlockScroll } from '../../utils/scroll-lock.js';
import { rafThrottle } from '../../utils/raf-throttle.js';

const TYPES = ['dim', 'light', 'transparent', 'blur', 'dim-blur'];

/* SVG-path substring for a rounded rectangle, used to punch the spotlight hole. */
function roundedRectPath(x, y, w, h, r) {
  return `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r}`
    + ` V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h}`
    + ` H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r}`
    + ` V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
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
    this.clearSpotlight();
  }

  // ---- Spotlight: dim everything EXCEPT a target rect ----------------------
  /* Punches a rounded hole in the scrim over `target` (an Element or a
     {left,top,width,height} rect) and draws a focus ring around it. The hole is
     a clip-path on the host, so it preserves the type's blur and lets pointer
     events fall through to the target. Recomputes on scroll/resize.
     opts: { padding = 8, radius = 8, ring = true }. Pass no target to clear. */
  spotlight(target, opts = {}) {
    if (!target) { this.clearSpotlight(); return; }
    this._spotTarget = target;
    this._spotPad = opts.padding != null ? opts.padding : 8;
    this._spotRadius = opts.radius != null ? opts.radius : 8;
    this._spotRing = opts.ring !== false;
    this.setAttribute('data-spotlight', '');
    if (!this._onSpotReflow) this._onSpotReflow = rafThrottle(() => this._applySpotlight());
    window.addEventListener('resize', this._onSpotReflow, true);
    window.addEventListener('scroll', this._onSpotReflow, true);
    this._applySpotlight();
  }

  clearSpotlight() {
    if (!this._spotTarget && !this._ring) return;
    this._spotTarget = null;
    this.removeAttribute('data-spotlight');
    this.style.clipPath = '';
    this.style.webkitClipPath = '';
    if (this._ring) { this._ring.remove(); this._ring = null; }
    if (this._onSpotReflow) {
      window.removeEventListener('resize', this._onSpotReflow, true);
      window.removeEventListener('scroll', this._onSpotReflow, true);
    }
  }

  _spotRect() {
    const t = this._spotTarget;
    if (!t) return null;
    const r = (t instanceof Element) ? t.getBoundingClientRect() : t;
    if (!r || (!r.width && !r.height)) return null;
    const pad = this._spotPad;
    return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
  }

  _applySpotlight() {
    const rect = this._spotRect();
    if (!rect) { this.clearSpotlight(); return; }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rad = Math.max(0, Math.min(this._spotRadius, rect.w / 2, rect.h / 2));
    /* Even-odd: outer viewport rect minus the inner rounded hole. */
    const path = `M0 0 H${vw} V${vh} H0 Z ${roundedRectPath(rect.x, rect.y, rect.w, rect.h, rad)}`;
    const clip = `path(evenodd, '${path}')`;
    this.style.clipPath = clip;
    this.style.webkitClipPath = clip;
    if (this._spotRing) this._positionRing(rect, rad);
  }

  _positionRing(rect, rad) {
    if (!this._ring) {
      const ring = document.createElement('div');
      ring.className = 'ds-overlay__ring';
      ring.setAttribute('aria-hidden', 'true');
      (this.parentNode || document.body).appendChild(ring);
      this._ring = ring;
    }
    const s = this._ring.style;
    s.left = `${Math.round(rect.x)}px`;
    s.top = `${Math.round(rect.y)}px`;
    s.width = `${Math.round(rect.w)}px`;
    s.height = `${Math.round(rect.h)}px`;
    s.borderRadius = `${rad}px`;
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
