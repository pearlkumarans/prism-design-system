/* =============================================================================
   <ds-tooltip text="Helpful hint" position="up-center" theme="dark">
     <button>Hover me</button>
   </ds-tooltip>

   The tip is PORTALED to <body> and positioned with position:fixed in JS
   (anchored to the trigger via getBoundingClientRect). This guarantees the tip
   can NEVER be clipped/hidden by an ancestor's overflow (hidden/auto/scroll),
   transform, filter or contain — e.g. a data-table cell, a scroll container or
   a rounded card. The tip re-anchors on scroll/resize and flips/clamps to stay
   inside the viewport.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { escapeHtml } from '../../utils/escape.js';

const POSITIONS = ['up-center', 'up-left', 'up-right', 'down-center', 'down-left', 'down-right', 'left', 'right', 'without-arrow'];
const THEMES = ['dark', 'light', 'red'];

/* Spec a11y: 200 ms show delay (avoid accidental triggers), 150 ms hide delay
   so users can move from trigger to tooltip without the tip disappearing. */
const SHOW_DELAY_MS = 200;
const HIDE_DELAY_MS = 150;
const GAP = 8;   /* arrow protrusion (6) + breathing room */
const MARGIN = 8; /* min distance from the viewport edge */

let _uid = 0;

export class DsTooltip extends HTMLElement {
  static get observedAttributes() { return ['text', 'position', 'theme', 'show-icon', 'icon', 'rtl']; }

  constructor() {
    super();
    this._id = `ds-tooltip-${++_uid}`;
    this._open = false;
  }

  connectedCallback() {
    if (!this._tip) {
      this._tip = document.createElement('div');
      this._tip.id = this._id;
      this._tip.setAttribute('role', 'tooltip');
      this._tip.setAttribute('aria-hidden', 'true');

      // Trigger events live on the host so any slotted child opens the tip.
      this.addEventListener('mouseenter', this._show);
      this.addEventListener('mouseleave', this._hide);
      this.addEventListener('focusin', this._show);
      this.addEventListener('focusout', this._hide);
      this.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._hideNow(); });
    }
    // Portal the tip to <body> so NO ancestor can clip it.
    if (this._tip.parentNode !== document.body) document.body.appendChild(this._tip);
    this._render();

    // First (non-tip) child is the trigger; the tip lives in <body>, so the
    // first child is always the trigger. Connect aria-describedby.
    const trigger = this.firstElementChild;
    if (trigger) trigger.setAttribute('aria-describedby', this._id);
  }

  disconnectedCallback() {
    // Clean up so the portaled tip never leaks when its host is removed
    // (e.g. a data-table re-rendering its rows).
    this._hideNow();
    this._unbindReanchor();
    if (this._tip && this._tip.parentNode) this._tip.parentNode.removeChild(this._tip);
  }

  attributeChangedCallback() { if (this._tip) this._render(); }

  _show = () => {
    clearTimeout(this._hideT);
    if (this._open) return;
    this._showT = setTimeout(() => {
      this._open = true;
      if (this._tip.parentNode !== document.body) document.body.appendChild(this._tip);
      this._position();
      this._tip.dataset.visible = 'true';
      this._tip.setAttribute('aria-hidden', 'false');
      this._bindReanchor();
    }, SHOW_DELAY_MS);
  };
  _hide = () => {
    clearTimeout(this._showT);
    if (!this._open) return;
    this._hideT = setTimeout(() => this._hideNow(), HIDE_DELAY_MS);
  };
  _hideNow = () => {
    clearTimeout(this._showT); clearTimeout(this._hideT);
    this._open = false;
    if (this._tip) {
      this._tip.dataset.visible = 'false';
      this._tip.setAttribute('aria-hidden', 'true');
    }
    this._unbindReanchor();
  };

  /* Re-anchor while open: any scroll (capture phase catches inner scrollers)
     or resize repositions the tip so it stays glued to the trigger. */
  _bindReanchor = () => {
    if (this._reanchor) return;
    this._reanchor = () => { if (this._open) this._position(); };
    window.addEventListener('scroll', this._reanchor, true);
    window.addEventListener('resize', this._reanchor);
  };
  _unbindReanchor = () => {
    if (!this._reanchor) return;
    window.removeEventListener('scroll', this._reanchor, true);
    window.removeEventListener('resize', this._reanchor);
    this._reanchor = null;
  };

  /* position:fixed coordinates, anchored to the trigger, flipped + clamped to
     the viewport. */
  _position = () => {
    const tip = this._tip;
    const r = this.getBoundingClientRect();
    if (!r.width && !r.height) return; // trigger not laid out yet
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pos = enumAttr(this, 'position', POSITIONS, 'up-center');
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    let top, left;
    if (pos === 'left') {
      left = r.left - tw - GAP; top = cy - th / 2;
    } else if (pos === 'right') {
      left = r.right + GAP; top = cy - th / 2;
    } else {
      let below = pos.startsWith('down');
      // Flip to whichever side has room — then point the arrow that way too.
      if (!below && (r.top - th - GAP) < MARGIN) below = true;
      else if (below && (r.bottom + GAP + th) > vh - MARGIN) below = false;
      if (pos.endsWith('left')) left = r.left;
      else if (pos.endsWith('right')) left = r.right - tw;
      else left = cx - tw / 2; // center / without-arrow
      top = below ? r.bottom + GAP : r.top - th - GAP;
    }

    // Final viewport clamp so the tip is always fully visible.
    left = Math.max(MARGIN, Math.min(left, vw - tw - MARGIN));
    top = Math.max(MARGIN, Math.min(top, vh - th - MARGIN));
    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;

    /* Arrow (up/down tips only): anchor it to the trigger's centre AFTER clamping
       so it never points somewhere the trigger isn't. If the clamp pushed the
       trigger outside the bubble's span, no arrow can honestly point at it — drop
       the arrow rather than mislead. Side tips (left/right) keep their own arrow. */
    if (pos !== 'left' && pos !== 'right') {
      const below = top >= r.bottom;              // which side the clamp settled on
      if (pos === 'without-arrow') {
        this._setArrow('without-arrow');
      } else {
        const EDGE = 12;                          // keep the arrow off the rounded corners
        const arrowX = cx - left;                 // trigger centre, relative to the tip's left
        if (arrowX >= EDGE && arrowX <= tw - EDGE) {
          tip.style.setProperty('--ds-tt-arrow-x', `${Math.round(arrowX)}px`);
          this._setArrow(`${below ? 'down' : 'up'}-anchored`);
        } else {
          this._setArrow('without-arrow');        // trigger not under the bubble → arrowless
        }
      }
    }
  };

  /* Swap the directional class so the arrow points at the trigger after a flip.
     Clears the JS-only anchored variants too (they're not in POSITIONS). */
  _setArrow(posClass) {
    const t = this._tip;
    [...POSITIONS, 'up-anchored', 'down-anchored'].forEach((p) => t.classList.remove(`ds-tooltip__tip--${p}`));
    t.classList.add(`ds-tooltip__tip--${posClass}`);
  }

  _render() {
    const text = this.getAttribute('text') || '';
    const position = enumAttr(this, 'position', POSITIONS, 'up-center');
    const theme = enumAttr(this, 'theme', THEMES, 'dark');
    /* Spec: Show Icon defaults ON. Hide only when caller sets show-icon="false". */
    const showIcon = !this.hasAttribute('show-icon') || this.getAttribute('show-icon') !== 'false';
    const icon = this.getAttribute('icon') || 'info-circle';
    const rtl = boolAttr(this, 'rtl');

    /* --floating makes the tip position:fixed and clears the variant anchor
       offsets; the position class still drives the arrow direction. */
    this._tip.className = `ds-tooltip__tip ds-tooltip__tip--floating ds-tooltip__tip--${theme} ds-tooltip__tip--${position}`;
    if (rtl) this._tip.setAttribute('dir', 'rtl');
    else this._tip.removeAttribute('dir');

    this._tip.innerHTML = `
      ${showIcon ? `<span class="ds-tooltip__icon" aria-hidden="true"><ds-icon name="${escapeHtml(icon)}" size="20"></ds-icon></span>` : ''}
      <span class="ds-tooltip__text">${escapeHtml(text)}</span>
    `;
    if (this._open) this._position();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-tooltip')) {
  customElements.define('ds-tooltip', DsTooltip);
}
