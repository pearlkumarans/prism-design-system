/* =============================================================================
   <ds-popover
     anchor="trigger-id"           id of the element the popover anchors to
     placement="bottom-start"      top|bottom|left|right (+ -start|-center|-end)
     title="Popover title"
     rtl-title="عنوان منبثق"        title shown when `rtl` (Arabic)
     has-header                    force-show header (auto-on when `title`/`rtl-title` set)
     hide-close                    hide the close (✕) when a header is shown
     hide-divider                  hide the header bottom divider
     has-footer                    force-show footer (auto-on when footer slot present)
     footer-align="default"        default | centered (footer button group alignment)
     arrow                         show the beak pointing at the anchor (default off)
     rtl
     open></ds-popover>

   Non-modal overlay anchored to a trigger. Surface = Header (title + close,
   bottom divider) + Body + Footer (top divider), with an optional arrow/beak.
   Width hugs content with a 240px min-width and no max (set width via the
   `--ds-popover-width` CSS var or an inline width for wrapping).

   Slots (light DOM):
     - (default)      → Body content region
     - slot="footer"  → Footer action region (children are unwrapped)

   Methods: open(), close(), toggle()
   Events:
     - ds-popover-open
     - ds-popover-close  (detail.reason: 'esc' | 'outside' | 'close' | 'api')
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const PLACEMENTS = [
  'top', 'top-start', 'top-center', 'top-end',
  'bottom', 'bottom-start', 'bottom-center', 'bottom-end',
  'left', 'left-start', 'left-center', 'left-end',
  'right', 'right-start', 'right-center', 'right-end',
];

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
  'input:not([disabled])', 'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const GAP = 8;     // distance from the anchor
const MARGIN = 8;  // viewport edge clamp

let _uid = 0;

export class DsPopover extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'placement', 'anchor', 'title', 'rtl-title', 'has-header', 'hide-close',
            'hide-divider', 'has-footer', 'footer-align', 'arrow', 'rtl'];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    /* Capture light-DOM slot content before we overwrite innerHTML so consumers
       can write `<ds-popover>body…<div slot="footer">…</div></ds-popover>`. */
    this._initialNodes = null;
    this._anchorEl = null;
    this._previouslyFocused = null;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._initialNodes = Array.from(this.childNodes);
      this._build();
      this._mounted = true;
    }
    this._bindAnchor();
    this._sync();
    if (boolAttr(this, 'open')) this._onOpen();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown, true);
    document.removeEventListener('mousedown', this._onDocPointer, true);
    window.removeEventListener('resize', this._onReflow, true);
    window.removeEventListener('scroll', this._onReflow, true);
    this._unbindAnchor();
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'open') {
      if (boolAttr(this, 'open')) this._onOpen();
      else this._onClose();
      return;
    }
    if (name === 'anchor') this._bindAnchor();
    this._sync();
    if (boolAttr(this, 'open')) this._position();
  }

  // ---- Public API ---------------------------------------------------------
  open()  { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }
  toggle() { this.hasAttribute('open') ? this.close() : this.open(); }

  // ---- Build --------------------------------------------------------------
  _build() {
    this._titleId = `ds-popover-${this._uid}-title`;

    this.innerHTML = `
      <div class="ds-popover__surface" role="dialog" tabindex="-1" data-surface>
        <span class="ds-popover__arrow" data-arrow aria-hidden="true" hidden></span>
        <div class="ds-popover__header" data-header>
          <h3 class="ds-popover__title" id="${this._titleId}" data-title></h3>
          <button type="button" class="ds-popover__close" aria-label="Close" data-close>
            <ds-icon name="close" size="16"></ds-icon>
          </button>
        </div>
        <div class="ds-popover__body" data-body></div>
        <div class="ds-popover__footer" data-footer></div>
      </div>`;

    this._surface = this.querySelector('[data-surface]');
    this._arrowEl = this.querySelector('[data-arrow]');
    this._headerEl = this.querySelector('[data-header]');
    this._titleEl = this.querySelector('[data-title]');
    this._closeBtn = this.querySelector('[data-close]');
    this._bodyEl = this.querySelector('[data-body]');
    this._footerEl = this.querySelector('[data-footer]');

    /* Distribute the captured light-DOM content: [slot="footer"] children go to
       the footer (unwrapped), everything else into the body. */
    this._hasFooterContent = false;
    for (const node of this._initialNodes) {
      if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute('slot') === 'footer') {
        while (node.firstChild) this._footerEl.appendChild(node.firstChild);
        this._hasFooterContent = true;
      } else {
        this._bodyEl.appendChild(node);
      }
    }

    this._closeBtn.addEventListener('click', () => this._dismiss('close'));

    this._onKeydown = (e) => {
      if (!this.hasAttribute('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); this._dismiss('esc'); }
      else if (e.key === 'Tab') this._wrapFocus(e);
    };
    this._onDocPointer = (e) => {
      if (!this.hasAttribute('open')) return;
      const t = e.target;
      if (this._surface.contains(t)) return;          // click inside popover
      if (this._anchorEl && this._anchorEl.contains(t)) return; // click on trigger (toggle handles it)
      this._dismiss('outside');
    };
    this._onReflow = () => { if (this.hasAttribute('open')) this._position(); };
    this._onAnchorClick = () => this.toggle();
  }

  // ---- Sync ---------------------------------------------------------------
  _sync() {
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else if (this.getAttribute('dir') === 'rtl') this.removeAttribute('dir');

    const rtl = boolAttr(this, 'rtl');
    /* RTL gets its own title string (Arabic), mirroring ds-button's Label/RTL Label. */
    const ltrTitle = this.getAttribute('title') || '';
    const rtlTitle = this.getAttribute('rtl-title') || '';
    const title = (rtl && rtlTitle) ? rtlTitle : ltrTitle;
    const showHeader = boolAttr(this, 'has-header') || !!ltrTitle || !!rtlTitle;
    const showClose = showHeader && !boolAttr(this, 'hide-close');
    const showFooter = boolAttr(this, 'has-footer') || this._hasFooterContent;

    this._titleEl.textContent = title || 'Popover title';
    this._headerEl.hidden = !showHeader;
    this._closeBtn.hidden = !showClose;
    this._footerEl.hidden = !showFooter;

    /* Header bottom divider toggle (Figma: Show Divider, default shown). */
    this._headerEl.toggleAttribute('data-no-divider', boolAttr(this, 'hide-divider'));
    /* Footer alignment (Figma: Alignment = Default | Centered). */
    this._footerEl.dataset.align = (this.getAttribute('footer-align') === 'centered') ? 'centered' : 'default';
    /* Arrow / beak (Figma: Arrow, default off). Direction is set during positioning. */
    this._arrowEl.hidden = !boolAttr(this, 'arrow');

    /* Label the dialog by its title when present, otherwise fall back to a
       generic label so the role=dialog is always named. */
    if (showHeader) {
      this._surface.setAttribute('aria-labelledby', this._titleId);
      this._surface.removeAttribute('aria-label');
    } else {
      this._surface.removeAttribute('aria-labelledby');
      this._surface.setAttribute('aria-label', this.getAttribute('aria-label') || 'Popover');
    }
  }

  // ---- Anchor wiring ------------------------------------------------------
  _bindAnchor() {
    const id = this.getAttribute('anchor');
    const next = id ? document.getElementById(id) : null;
    if (next === this._anchorEl) return;
    this._unbindAnchor();
    this._anchorEl = next;
    if (this._anchorEl) {
      this._anchorEl.setAttribute('aria-haspopup', 'dialog');
      this._anchorEl.setAttribute('aria-controls', this.id || (this.id = `ds-popover-${this._uid}`));
      this._anchorEl.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
      this._anchorEl.addEventListener('click', this._onAnchorClick);
    }
  }

  _unbindAnchor() {
    if (this._anchorEl) {
      this._anchorEl.removeEventListener('click', this._onAnchorClick);
      this._anchorEl.removeAttribute('aria-expanded');
    }
  }

  // ---- Lifecycle ----------------------------------------------------------
  _onOpen() {
    if (typeof document === 'undefined') return;
    this._previouslyFocused = (document.activeElement instanceof HTMLElement) ? document.activeElement : null;
    if (this._anchorEl) this._anchorEl.setAttribute('aria-expanded', 'true');

    document.addEventListener('keydown', this._onKeydown, true);
    document.addEventListener('mousedown', this._onDocPointer, true);
    window.addEventListener('resize', this._onReflow, true);
    window.addEventListener('scroll', this._onReflow, true);

    /* Position synchronously so the popover never paints in the wrong spot,
       then re-measure on the next frame in case fonts/layout shift its size. */
    this._position();
    requestAnimationFrame(() => {
      this._position();
      const focusables = this._surface.querySelectorAll(FOCUSABLE);
      const first = Array.from(focusables).find((el) => !el.hidden && el.offsetParent !== null);
      (first || this._surface).focus();
    });
    this.dispatchEvent(new CustomEvent('ds-popover-open', { bubbles: true }));
  }

  _onClose() {
    document.removeEventListener('keydown', this._onKeydown, true);
    document.removeEventListener('mousedown', this._onDocPointer, true);
    window.removeEventListener('resize', this._onReflow, true);
    window.removeEventListener('scroll', this._onReflow, true);
    if (this._anchorEl) this._anchorEl.setAttribute('aria-expanded', 'false');
    /* Return focus to the trigger (or the element focused before opening). */
    const target = this._anchorEl || this._previouslyFocused;
    if (target && target.focus) target.focus();
    this.dispatchEvent(new CustomEvent('ds-popover-close', { bubbles: true }));
  }

  _dismiss(reason) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');   // triggers _onClose via attributeChangedCallback
    this.dispatchEvent(new CustomEvent('ds-popover-close', { bubbles: true, detail: { reason } }));
  }

  // ---- Positioning (anchored, fixed, flip + viewport clamp) ---------------
  _position() {
    if (!this._anchorEl) return;   // inline mode: consumer positions it
    const placement = enumAttr(this, 'placement', PLACEMENTS, 'bottom-start');
    let [side, align = 'center'] = placement.split('-');

    const a = this._anchorEl.getBoundingClientRect();
    const s = this._surface.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* Flip the primary side if it doesn't fit and the opposite side fits better. */
    const space = { top: a.top, bottom: vh - a.bottom, left: a.left, right: vw - a.right };
    const opp = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const need = (side === 'top' || side === 'bottom') ? s.height + GAP : s.width + GAP;
    if (space[side] < need && space[opp[side]] > space[side]) side = opp[side];

    let top = 0;
    let left = 0;
    if (side === 'top' || side === 'bottom') {
      top = side === 'bottom' ? a.bottom + GAP : a.top - s.height - GAP;
      if (align === 'start') left = a.left;
      else if (align === 'end') left = a.right - s.width;
      else left = a.left + (a.width - s.width) / 2;
    } else {
      left = side === 'right' ? a.right + GAP : a.left - s.width - GAP;
      if (align === 'start') top = a.top;
      else if (align === 'end') top = a.bottom - s.height;
      else top = a.top + (a.height - s.height) / 2;
    }

    /* Clamp into the viewport. */
    left = Math.max(MARGIN, Math.min(left, vw - s.width - MARGIN));
    top = Math.max(MARGIN, Math.min(top, vh - s.height - MARGIN));

    this._surface.style.top = `${Math.round(top)}px`;
    this._surface.style.left = `${Math.round(left)}px`;

    if (boolAttr(this, 'arrow')) this._positionArrow(side, a, left, top, s);
  }

  /* Place the beak on the edge facing the anchor, pointing at the anchor's
     center (clamped so it stays on that edge). */
  _positionArrow(side, a, left, top, s) {
    const ar = this._arrowEl;
    ar.style.top = ar.style.bottom = ar.style.left = ar.style.right = '';
    ar.dataset.dir = { bottom: 'up', top: 'down', right: 'left', left: 'right' }[side];
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    if (side === 'top' || side === 'bottom') {
      const x = Math.max(10, Math.min(cx - left - 5, s.width - 20));
      ar.style.left = `${Math.round(x)}px`;
      if (side === 'bottom') ar.style.top = '-5px'; else ar.style.bottom = '-5px';
    } else {
      const y = Math.max(10, Math.min(cy - top - 5, s.height - 20));
      ar.style.top = `${Math.round(y)}px`;
      if (side === 'right') ar.style.left = '-5px'; else ar.style.right = '-5px';
    }
  }

  // ---- Focus wrap (non-modal: soft cycle within the surface) --------------
  _wrapFocus(e) {
    const focusable = Array.from(this._surface.querySelectorAll(FOCUSABLE))
      .filter((el) => !el.hidden && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-popover')) {
  customElements.define('ds-popover', DsPopover);
}
