/* =============================================================================
   <ds-drawer
     side="left|right"             (default right)
     size="s|m|l|full"             320 / 480 / 640 / 100%   (default m)
     title="Drawer title"
     subtitle="Supporting text…"
     show-header                   (default true)
     show-footer                   (default true)
     show-back                     (default false — leading back button)
     show-close                    (default true)
     modal                         (default true — scrim, focus trap, Esc)
     dismiss-on-overlay            (default true — scrim click closes; modal only)
     footer-align="default|centered"
     rtl
     open></ds-drawer>

   Side sheet: header (back? + title + subtitle + close) · body (scrolls) ·
   footer (leading text-link + right-aligned button group). Slides in from the
   anchored edge over an optional scrim.

   Slots (light DOM):
     - slot="body" / default → body content region (scrolls)
     - slot="footer-start"   → leading footer text link
     - slot="footer"         → right-aligned footer buttons

   Methods: open(), close()
   Properties: returnFocusTo : HTMLElement|null — focus restore target on close
   Events:
     - ds-drawer-open
     - ds-drawer-close  (detail.reason: 'esc' | 'overlay' | 'close')
     - ds-drawer-back
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../../icons/icon.js';
import '../icon-button/icon-button.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';

const SIDES = ['left', 'right'];
const SIZES = ['s', 'm', 'l', 'full'];

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
  'input:not([disabled])', 'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let _uid = 0;

export class DsDrawer extends HTMLElement {
  static get observedAttributes() {
    return ['side', 'size', 'title', 'subtitle', 'show-header', 'show-footer',
            'show-back', 'show-close', 'modal', 'dismiss-on-overlay', 'footer-align', 'open', 'rtl'];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    this._initialNodes = null;
    this.returnFocusTo = null;
    /* Cached heading text. `title` is a global HTML attribute, so leaving it on
       the host makes the browser render a native tooltip over the drawer; we read
       it into here and strip the attribute (see _sync). */
    this._titleText = '';
    this._suppressTitle = false;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._initialNodes = Array.from(this.childNodes);
      this._build();
      this._mounted = true;
    }
    this._sync();
    if (boolAttr(this, 'open')) this._onOpen();
    /* Frameworks (Ember/React/Vue) insert slotted content AFTER upgrade, when the
       capture above already ran on an empty element — the header/body/footer would
       otherwise strand outside the panel. Re-distribute any late nodes by slot. */
    watchLateChildren(this, (late) => { this._distribute(late); this._sync(); });
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown, true);
    this._unlockScroll();
    stopLateChildren(this);
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'open') {
      if (boolAttr(this, 'open')) this._onOpen();
      else this._onClose();
      return;
    }
    if (name === 'title' && this._suppressTitle) return; /* self-triggered strip */
    this._sync();
  }

  open()  { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

  /* Route light-DOM nodes into the drawer's regions by their `slot`. Shared by
     the initial build and by late re-distribution (framework-inserted content). */
  _distribute(nodes) {
    const titlesEl = this.querySelector('[data-titles]');
    const customHeader = [];
    for (const node of nodes) {
      const slot = node.nodeType === Node.ELEMENT_NODE ? node.getAttribute('slot') : null;
      if (slot === 'footer-start') { this._footerStartEl.appendChild(node); this._hasFooterContent = true; }
      else if (slot === 'footer') { this._footerActionsEl.appendChild(node); this._hasFooterContent = true; }
      else if (slot === 'header') { customHeader.push(node); }
      else { this._bodyEl.appendChild(node); }
    }
    /* Custom header content (slot="header") replaces the title/subtitle block,
       keeping the back + close affordances — a rich header (avatar, badges, meta)
       instead of just title + subtitle. */
    if (customHeader.length) {
      if (titlesEl) titlesEl.style.display = 'none';   /* beat the class display rule */
      this._headerEl.dataset.custom = '';
      customHeader.forEach((n) => this._headerEl.insertBefore(n, this._closeBtn));
    }
  }

  // ---- Build --------------------------------------------------------------
  _build() {
    this.classList.add('ds-drawer');
    this._titleId = `ds-drawer-${this._uid}-title`;
    this._subId   = `ds-drawer-${this._uid}-sub`;
    this._bodyId  = `ds-drawer-${this._uid}-body`;

    this.innerHTML = `
      <div class="ds-drawer__overlay" data-overlay></div>
      <aside class="ds-drawer__panel" role="dialog" aria-modal="true"
             aria-labelledby="${this._titleId}" tabindex="-1" data-panel>
        <div class="ds-drawer__header" data-header>
          <ds-icon-button class="ds-drawer__back" shape="square" type="tertiary-grey" size="large" icon="chevron-left" label="Back" no-tooltip data-back hidden></ds-icon-button>
          <div class="ds-drawer__titles" data-titles>
            <h2 class="ds-drawer__title" id="${this._titleId}" data-title></h2>
            <p class="ds-drawer__subtitle" id="${this._subId}" data-subtitle hidden></p>
          </div>
          <ds-icon-button class="ds-drawer__close" shape="square" type="tertiary-grey" size="large" icon="close" label="Close" no-tooltip data-close></ds-icon-button>
        </div>
        <div class="ds-drawer__body" id="${this._bodyId}" data-body></div>
        <div class="ds-drawer__footer" data-footer>
          <div class="ds-drawer__footer-start" data-footer-start></div>
          <div class="ds-drawer__spacer"></div>
          <div class="ds-drawer__footer-actions" data-footer-actions></div>
        </div>
      </aside>`;

    this._overlay = this.querySelector('[data-overlay]');
    this._panel = this.querySelector('[data-panel]');
    this._headerEl = this.querySelector('[data-header]');
    this._backBtn = this.querySelector('[data-back]');
    this._titleEl = this.querySelector('[data-title]');
    this._subEl = this.querySelector('[data-subtitle]');
    this._closeBtn = this.querySelector('[data-close]');
    this._bodyEl = this.querySelector('[data-body]');
    this._footerEl = this.querySelector('[data-footer]');
    this._footerStartEl = this.querySelector('[data-footer-start]');
    this._footerActionsEl = this.querySelector('[data-footer-actions]');

    /* Distribute captured light-DOM content into the right regions by slot. */
    this._hasFooterContent = false;
    this._distribute(this._initialNodes);

    this._closeBtn.addEventListener('click', () => this._dismiss('close'));
    this._backBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-drawer-back', { bubbles: true }));
    });
    this._overlay.addEventListener('click', () => {
      if (!this._isModal()) return;
      /* dismiss-on-overlay defaults TRUE for a drawer (opt out with "false"). */
      if (this.getAttribute('dismiss-on-overlay') !== 'false') this._dismiss('overlay');
    });

    this._onKeydown = (e) => {
      if (!this.hasAttribute('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); this._dismiss('esc'); }
      else if (e.key === 'Tab' && this._isModal()) this._trapFocus(e);
    };
  }

  _isModal() { return this.getAttribute('modal') !== 'false'; }

  // ---- Sync ---------------------------------------------------------------
  _sync() {
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else if (this.getAttribute('dir') === 'rtl') this.removeAttribute('dir');

    this.dataset.side = enumAttr(this, 'side', SIDES, 'right');
    this.dataset.size = enumAttr(this, 'size', SIZES, 'm');
    this.dataset.modal = this._isModal() ? 'true' : 'false';

    /* Cache the heading, then strip the native `title` attribute off the host so
       the browser doesn't render a tooltip over the drawer. The attribute is only
       an input channel; the heading renders from the cached value. */
    if (this.hasAttribute('title')) {
      this._titleText = this.getAttribute('title');
      this._suppressTitle = true;
      this.removeAttribute('title');
      this._suppressTitle = false;
    }
    const title = this._titleText || '';
    const subtitle = this.getAttribute('subtitle') || '';
    /* Booleans default TRUE — header/footer/close show unless explicitly "false". */
    const showHeader = this.getAttribute('show-header') !== 'false';
    const showFooter = this.getAttribute('show-footer') !== 'false';
    const showClose = this.getAttribute('show-close') !== 'false';
    const showBack = this.hasAttribute('show-back') && this.getAttribute('show-back') !== 'false';

    this._titleEl.textContent = title || 'Drawer title';
    if (subtitle) { this._subEl.textContent = subtitle; this._subEl.hidden = false; }
    else this._subEl.hidden = true;

    this._backBtn.hidden = !showBack;
    this._closeBtn.hidden = !showClose;
    this._headerEl.hidden = !showHeader;
    this._footerEl.hidden = !showFooter;

    this._footerEl.dataset.align = (this.getAttribute('footer-align') === 'centered') ? 'centered' : 'default';

    /* aria-modal reflects the modality. */
    this._panel.setAttribute('aria-modal', this._isModal() ? 'true' : 'false');
    /* Label by title; describe by body. */
    this._panel.setAttribute('aria-describedby', this._bodyId);
  }

  // ---- Lifecycle ----------------------------------------------------------
  _onOpen() {
    if (typeof document === 'undefined') return;
    this._previouslyFocused = (this.returnFocusTo instanceof HTMLElement)
      ? this.returnFocusTo
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    document.addEventListener('keydown', this._onKeydown, true);
    if (this._isModal()) this._lockScroll();
    requestAnimationFrame(() => {
      const focusables = this._panel.querySelectorAll(FOCUSABLE);
      const first = Array.from(focusables).find((el) => !el.hidden && el.offsetParent !== null);
      (first || this._panel).focus();
    });
    this.dispatchEvent(new CustomEvent('ds-drawer-open', { bubbles: true }));
  }

  _onClose() {
    document.removeEventListener('keydown', this._onKeydown, true);
    this._unlockScroll();
    if (this._previouslyFocused?.focus) this._previouslyFocused.focus();
    this.dispatchEvent(new CustomEvent('ds-drawer-close', { bubbles: true }));
  }

  _dismiss(reason) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');   // triggers _onClose
    this.dispatchEvent(new CustomEvent('ds-drawer-close', { bubbles: true, detail: { reason } }));
  }

  // ---- Body scroll lock (modal) ------------------------------------------
  _lockScroll() {
    if (this._scrollLocked) return;
    this._prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this._scrollLocked = true;
  }
  _unlockScroll() {
    if (!this._scrollLocked) return;
    document.body.style.overflow = this._prevBodyOverflow || '';
    this._scrollLocked = false;
  }

  // ---- Focus trap (modal) -------------------------------------------------
  _trapFocus(e) {
    const focusable = Array.from(this._panel.querySelectorAll(FOCUSABLE))
      .filter((el) => !el.hidden && el.offsetParent !== null);
    if (!focusable.length) { e.preventDefault(); this._panel.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-drawer')) {
  customElements.define('ds-drawer', DsDrawer);
}
