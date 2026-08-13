/* =============================================================================
   <ds-modal
     size="sm|md|lg"               480 / 640 / 880  (default md)
     title="Modal title"
     description="A short description…"
     show-header                   (default true)
     show-footer                   (default true)
     dismiss-on-overlay            (default false — opt in for info modals)
     rtl
     open></ds-modal>

   General-purpose, LEFT-aligned modal: header (optional leading icon + title +
   description + optional trailing action + close) · body · footer (leading
   text-link + right-aligned button group). Modal: scrim, focus trap, Esc.

   Slots (light DOM):
     - slot="icon"          → leading icon circle (auto-shows when present)
     - slot="header-action" → trailing header action (auto-shows when present)
     - slot="body" / default → body content region (scrolls)
     - slot="footer-start"  → leading footer text link
     - slot="footer"        → right-aligned footer buttons

   Methods: open(), close()
   Properties: returnFocusTo : HTMLElement|null — focus restore target on close
   Events:
     - ds-modal-open
     - ds-modal-close  (detail.reason: 'esc' | 'overlay' | 'close')
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import '../../icons/icon.js';
import '../icon-button/icon-button.js';

const SIZES = ['sm', 'md', 'lg'];

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
  'input:not([disabled])', 'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let _uid = 0;

export class DsModal extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'title', 'description', 'show-header', 'show-footer', 'dismiss-on-overlay', 'open', 'rtl'];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    this._initialNodes = null;
    this.returnFocusTo = null;
    /* Cached heading text. `title` is a global HTML attribute, so leaving it on
       the host makes the browser render a native tooltip over the dialog; we read
       it into here and strip the attribute (see _sync). */
    this._titleText = '';
    this._suppressTitle = false;
  }

  /* Route light-DOM nodes into the modal's regions by their `slot`. Shared by the
     initial build and by late re-distribution (framework-inserted content). */
  _distribute(nodes) {
    for (const node of nodes) {
      const slot = node.nodeType === Node.ELEMENT_NODE ? node.getAttribute('slot') : null;
      if (slot === 'icon') { this._leadingEl.appendChild(node); this._hasLeading = true; }
      else if (slot === 'header-action') { this._headerActionEl.appendChild(node); this._hasHeaderAction = true; }
      else if (slot === 'footer-start') { this._footerStartEl.appendChild(node); this._hasFooterContent = true; }
      else if (slot === 'footer') { this._footerActionsEl.appendChild(node); this._hasFooterContent = true; }
      else { this._bodyEl.appendChild(node); }
    }
  }

  connectedCallback() {
    if (!this._mounted) {
      this._initialNodes = Array.from(this.childNodes);
      this._build();
      this._mounted = true;
    }
    this._sync();
    if (boolAttr(this, 'open')) this._onOpen();
    /* Frameworks insert slotted content after upgrade; re-distribute late nodes. */
    watchLateChildren(this, (late) => { this._distribute(late); this._sync(); });
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown, true);
    stopLateChildren(this);
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'title' && this._suppressTitle) return; /* self-triggered strip */
    if (name === 'open') {
      if (boolAttr(this, 'open')) this._onOpen();
      else this._onClose();
      return;
    }
    this._sync();
  }

  open()  { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

  // ---- Build --------------------------------------------------------------
  _build() {
    this.classList.add('ds-modal');
    this._titleId = `ds-modal-${this._uid}-title`;
    this._descId  = `ds-modal-${this._uid}-desc`;
    this._bodyId  = `ds-modal-${this._uid}-body`;

    this.innerHTML = `
      <div class="ds-modal__overlay" data-overlay></div>
      <div class="ds-modal__dialog" role="dialog" aria-modal="true"
           aria-labelledby="${this._titleId}" tabindex="-1" data-dialog>
        <div class="ds-modal__header" data-header>
          <div class="ds-modal__leading" data-leading hidden></div>
          <div class="ds-modal__titles">
            <h2 class="ds-modal__title" id="${this._titleId}" data-title></h2>
            <p class="ds-modal__desc" id="${this._descId}" data-desc hidden></p>
          </div>
          <div class="ds-modal__header-actions">
            <span class="ds-modal__header-action" data-header-action hidden></span>
            <ds-icon-button class="ds-modal__close" shape="square" type="tertiary-grey" size="large" icon="close" label="Close" no-tooltip data-close></ds-icon-button>
          </div>
        </div>
        <div class="ds-modal__body" id="${this._bodyId}" data-body></div>
        <div class="ds-modal__footer" data-footer>
          <div class="ds-modal__footer-start" data-footer-start></div>
          <div class="ds-modal__spacer"></div>
          <div class="ds-modal__footer-actions" data-footer-actions></div>
        </div>
      </div>`;

    this._overlay = this.querySelector('[data-overlay]');
    this._dialog = this.querySelector('[data-dialog]');
    this._headerEl = this.querySelector('[data-header]');
    this._leadingEl = this.querySelector('[data-leading]');
    this._titleEl = this.querySelector('[data-title]');
    this._descEl = this.querySelector('[data-desc]');
    this._headerActionEl = this.querySelector('[data-header-action]');
    this._closeBtn = this.querySelector('[data-close]');
    this._bodyEl = this.querySelector('[data-body]');
    this._footerEl = this.querySelector('[data-footer]');
    this._footerStartEl = this.querySelector('[data-footer-start]');
    this._footerActionsEl = this.querySelector('[data-footer-actions]');

    /* Distribute captured light-DOM content into the right regions by slot. */
    this._hasLeading = false;
    this._hasHeaderAction = false;
    this._hasFooterContent = false;
    this._distribute(this._initialNodes);

    this._closeBtn.addEventListener('click', () => this._dismiss('close'));
    this._overlay.addEventListener('click', () => {
      const dismissOnOverlay = this.hasAttribute('dismiss-on-overlay')
        && this.getAttribute('dismiss-on-overlay') !== 'false';
      if (dismissOnOverlay) this._dismiss('overlay');
    });

    this._onKeydown = (e) => {
      if (!this.hasAttribute('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); this._dismiss('esc'); }
      else if (e.key === 'Tab') this._trapFocus(e);
    };

    this._dragOffset = { x: 0, y: 0 };
    this._setupDrag();
  }

  // ---- Drag (move the dialog by its header) -------------------------------
  _setupDrag() {
    const dialog = this._dialog;
    const handle = this._headerEl;
    if (!handle || !dialog) return;
    let sx = 0, sy = 0, bx = 0, by = 0, dragging = false;
    const move = (e) => {
      if (!dragging) return;
      let nx = bx + (e.clientX - sx);
      let ny = by + (e.clientY - sy);
      dialog.style.transform = `translate(${nx}px, ${ny}px)`;
      /* Clamp so the dialog can't be dragged off-screen (8px margin). */
      const r = dialog.getBoundingClientRect();
      const m = 8;
      if (r.left < m) nx += m - r.left;
      else if (r.right > window.innerWidth - m) nx += (window.innerWidth - m) - r.right;
      if (r.top < m) ny += m - r.top;
      else if (r.bottom > window.innerHeight - m) ny += (window.innerHeight - m) - r.bottom;
      dialog.style.transform = `translate(${nx}px, ${ny}px)`;
      this._dragOffset.x = nx; this._dragOffset.y = ny;
    };
    const up = () => {
      dragging = false;
      handle.classList.remove('is-dragging');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    handle.addEventListener('pointerdown', (e) => {
      if (!this.hasAttribute('open') || e.button !== 0) return;
      /* Ignore drags that start on an interactive control, or on the title /
         description text (those stay selectable). */
      if (e.target.closest('button, a, input, textarea, select, ds-icon-button, [contenteditable], .ds-modal__title, .ds-modal__desc')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      bx = this._dragOffset.x; by = this._dragOffset.y;
      handle.classList.add('is-dragging');
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      e.preventDefault();   // prevent text selection while dragging
    });
  }

  // ---- Sync ---------------------------------------------------------------
  _sync() {
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else if (this.getAttribute('dir') === 'rtl') this.removeAttribute('dir');

    this.dataset.size = enumAttr(this, 'size', SIZES, 'md');

    /* Cache the heading, then strip the native `title` attribute off the host so
       the browser doesn't render a tooltip over the dialog/overlay. The attribute
       is only an input channel; the heading renders from the cached value. */
    if (this.hasAttribute('title')) {
      this._titleText = this.getAttribute('title');
      this._suppressTitle = true;
      this.removeAttribute('title');
      this._suppressTitle = false;
    }
    const title = this._titleText || '';
    const description = this.getAttribute('description') || '';
    /* Booleans default TRUE — header/footer show unless explicitly "false". */
    const showHeader = this.getAttribute('show-header') !== 'false';
    const showFooter = this.getAttribute('show-footer') !== 'false';

    this._titleEl.textContent = title || 'Modal title';
    if (description) { this._descEl.textContent = description; this._descEl.hidden = false; }
    else this._descEl.hidden = true;

    this._leadingEl.hidden = !this._hasLeading;
    this._headerActionEl.hidden = !this._hasHeaderAction;
    this._headerEl.hidden = !showHeader;
    this._footerEl.hidden = !showFooter;

    /* Label by title; describe by description when present. */
    if (description) this._dialog.setAttribute('aria-describedby', this._descId);
    else this._dialog.setAttribute('aria-describedby', this._bodyId);
  }

  // ---- Lifecycle ----------------------------------------------------------
  _onOpen() {
    if (typeof document === 'undefined') return;
    /* Portal to <body> so the fixed overlay escapes any ancestor stacking
       context (e.g. an app content region with its own z-index) and its scrim
       covers the FULL viewport — including the header — instead of being trapped
       below it. Remember the origin to restore on close. Moving the node re-fires
       connect→_onOpen, so guard the body of this method with _isOpen. */
    if (this.parentElement && this.parentElement !== document.body) {
      this._portalHome = { parent: this.parentElement, next: this.nextSibling };
      document.body.appendChild(this);   /* re-enters _onOpen; returns at _isOpen guard */
    }
    if (this._isOpen) return;
    this._isOpen = true;
    /* Re-center on each open — clear any prior drag offset. */
    this._dragOffset = { x: 0, y: 0 };
    if (this._dialog) this._dialog.style.transform = '';
    this._previouslyFocused = (this.returnFocusTo instanceof HTMLElement)
      ? this.returnFocusTo
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    document.addEventListener('keydown', this._onKeydown, true);
    requestAnimationFrame(() => {
      const focusables = this._dialog.querySelectorAll(FOCUSABLE);
      const first = Array.from(focusables).find((el) => !el.hidden && el.offsetParent !== null);
      (first || this._dialog).focus();
    });
    this.dispatchEvent(new CustomEvent('ds-modal-open', { bubbles: true }));
  }

  _onClose() {
    this._isOpen = false;
    document.removeEventListener('keydown', this._onKeydown, true);
    if (this._previouslyFocused?.focus) this._previouslyFocused.focus();
    this.dispatchEvent(new CustomEvent('ds-modal-close', { bubbles: true }));
    /* Restore to the original DOM position so the page structure is unchanged. */
    if (this._portalHome) {
      const { parent, next } = this._portalHome; this._portalHome = null;
      if (parent && parent.isConnected) parent.insertBefore(this, (next && next.parentNode === parent) ? next : null);
    }
  }

  _dismiss(reason) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');   // triggers _onClose
    this.dispatchEvent(new CustomEvent('ds-modal-close', { bubbles: true, detail: { reason } }));
  }

  // ---- Focus trap (modal) -------------------------------------------------
  _trapFocus(e) {
    const focusable = Array.from(this._dialog.querySelectorAll(FOCUSABLE))
      .filter((el) => !el.hidden && el.offsetParent !== null);
    if (!focusable.length) { e.preventDefault(); this._dialog.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-modal')) {
  customElements.define('ds-modal', DsModal);
}
