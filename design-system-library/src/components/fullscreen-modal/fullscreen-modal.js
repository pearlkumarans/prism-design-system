/* =============================================================================
   <ds-fullscreen-modal
     title="Configure SAML SSO"
     description="Set up SSO so users can sign in with their company directory."
     leading-tone="info|warning|success|brand"
     leading-icon="info-circle"
     primary-label="Save and apply"
     secondary-label="Cancel"
     tertiary-label="Back"
     hide-close
     dismiss-on-overlay-click="false"
     dismiss-on-esc="false"
     open>
     <p>Body content goes here…</p>
     <span slot="footer-left"><a href="#">Read the docs</a></span>
   </ds-fullscreen-modal>

   Full-viewport modal with a 40px top overlay band. Pinned header + footer
   with a single scrollable body region between them. Use this for
   multi-step flows, immersive editors, and mobile-first sheets — for
   short binary decisions, reach for <ds-confirmation-modal>.

   Slots:
     - default     — primary scrollable body content
     - footer-left — left-aligned utility content (TextLink, save status, etc.)

   Events:
     - ds-fullscreen-open
     - ds-fullscreen-primary    — primary button activated. preventDefault() to keep open.
     - ds-fullscreen-secondary  — secondary (Cancel) activated. preventDefault() to keep open.
     - ds-fullscreen-tertiary   — tertiary (Back) activated. Does NOT auto-close.
     - ds-fullscreen-close      — modal dismissed (Esc / overlay / close icon)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Reuse DS primitives instead of raw HTML: footer actions = <ds-button>,
   close = <ds-icon-button>, header/footer rules = <ds-divider>. */
import '../../icons/icon.js';
import '../button/button.js';
import '../icon-button/icon-button.js';
import '../divider/divider.js';

/* Auto-load the sub-component CSS (idempotent) so the modal is self-contained
   on any page, mirroring the calendar/accordion pattern. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-fsm-button-css',      '../button/button.css');
_injectCss('ds-fsm-icon-button-css', '../icon-button/icon-button.css');
_injectCss('ds-fsm-divider-css',     '../divider/divider.css');

const TONES = ['info', 'warning', 'success', 'brand'];

const TONE_DEFAULTS = {
  info:    { icon: 'info-circle' },
  warning: { icon: 'exclamation-circle' },
  success: { icon: 'circle-tick' },
  brand:   { icon: 'add-widget' },
};

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let _uid = 0;

export class DsFullscreenModal extends HTMLElement {
  static get observedAttributes() {
    return [
      'title', 'description',
      'leading-tone', 'leading-icon', 'show-icon',
      'primary-label', 'secondary-label', 'tertiary-label',
      'hide-close', 'dismiss-on-overlay-click', 'dismiss-on-esc',
      'show-divider-header', 'show-divider-footer',
      'loading', 'open',
    ];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    /* Capture the consumer's slotted content so we can re-emit it inside the
       structured shell. The default body goes to the body region; nodes with
       slot="footer-left" go to the footer's left utility area. */
    this._initialBodyHTML = '';
    this._initialFooterLeftHTML = '';
    this.returnFocusTo = null;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._captureSlots();
      this._build();
      this._mounted = true;
    }
    this._sync();
    if (boolAttr(this, 'open')) this._onOpen();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown);
    this._releaseScrollLock();
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    if (name === 'open') {
      const wantOpen = boolAttr(this, 'open');
      if (wantOpen) this._onOpen();
      else this._onClose();
      return;
    }
    this._sync();
  }

  open()  { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

  // ---- Build / sync -------------------------------------------------------
  _captureSlots() {
    const footerLeftNodes = [...this.querySelectorAll('[slot="footer-left"]')];
    this._initialFooterLeftHTML = footerLeftNodes.map((n) => n.outerHTML).join('');
    footerLeftNodes.forEach((n) => n.remove());
    this._initialBodyHTML = this.innerHTML.trim();
    this.innerHTML = '';
  }

  _build() {
    this.classList.add('ds-fullscreen-modal');
    this._titleId = `ds-fsm-${this._uid}-title`;
    this._descId  = `ds-fsm-${this._uid}-desc`;
    this._bodyId  = `ds-fsm-${this._uid}-body`;

    this.innerHTML = `
      <div class="ds-fullscreen-modal__overlay" data-overlay></div>
      <div class="ds-fullscreen-modal__dialog"
           role="dialog"
           aria-modal="true"
           aria-labelledby="${this._titleId}"
           aria-describedby="${this._descId} ${this._bodyId}"
           tabindex="-1"
           data-dialog>

        <header class="ds-fullscreen-modal__header" data-header>
          <div class="ds-fullscreen-modal__leading" data-leading>
            <ds-icon name="info-circle" size="24" data-leading-icon></ds-icon>
          </div>
          <div class="ds-fullscreen-modal__titles">
            <h2 class="ds-fullscreen-modal__title" id="${this._titleId}" data-title></h2>
            <p   class="ds-fullscreen-modal__description" id="${this._descId}" data-description hidden></p>
          </div>
          <ds-icon-button class="ds-fullscreen-modal__close"
                  shape="square" type="tertiary-grey" size="xl"
                  icon="close" label="Close" no-tooltip
                  data-close></ds-icon-button>
        </header>
        <ds-divider class="ds-fullscreen-modal__divider" data-divider-header></ds-divider>

        <div class="ds-fullscreen-modal__body" id="${this._bodyId}" data-body>${this._initialBodyHTML || ''}</div>

        <ds-divider class="ds-fullscreen-modal__divider" data-divider-footer></ds-divider>
        <footer class="ds-fullscreen-modal__footer" data-footer>
          <div class="ds-fullscreen-modal__footer-left" data-footer-left>${this._initialFooterLeftHTML || ''}</div>
          <div class="ds-fullscreen-modal__footer-right">
            <ds-button variant="tertiary" size="medium" data-act="tertiary"  hidden></ds-button>
            <ds-button variant="outline"  size="medium" data-act="secondary"></ds-button>
            <ds-button variant="primary"  size="medium" data-act="primary"></ds-button>
          </div>
        </footer>
      </div>`;

    this._overlay  = this.querySelector('[data-overlay]');
    this._dialog   = this.querySelector('[data-dialog]');
    this._titleEl  = this.querySelector('[data-title]');
    this._descEl   = this.querySelector('[data-description]');
    this._bodyEl   = this.querySelector('[data-body]');
    this._leading  = this.querySelector('[data-leading]');
    this._leadingIcon = this.querySelector('[data-leading-icon]');
    this._closeBtn = this.querySelector('[data-close]');
    this._dividerH = this.querySelector('[data-divider-header]');
    this._dividerF = this.querySelector('[data-divider-footer]');
    this._btns = {
      primary:   this.querySelector('[data-act="primary"]'),
      secondary: this.querySelector('[data-act="secondary"]'),
      tertiary:  this.querySelector('[data-act="tertiary"]'),
    };

    this._closeBtn.addEventListener('click', () => this._dismiss());
    this._overlay.addEventListener('click', () => {
      const dismissOnOverlay = !this.hasAttribute('dismiss-on-overlay-click')
        ? true
        : this.getAttribute('dismiss-on-overlay-click') !== 'false';
      if (dismissOnOverlay) this._dismiss();
    });

    this._btns.primary.addEventListener('click', () => this._fire('primary'));
    this._btns.secondary.addEventListener('click', () => this._fire('secondary'));
    this._btns.tertiary.addEventListener('click',  () => this._fire('tertiary'));

    /* Promote a 1px shadow under the header divider when the body has been
       scrolled to indicate offscreen content above. */
    this._bodyEl.addEventListener('scroll', () => {
      const scrolled = this._bodyEl.scrollTop > 0;
      this._dividerH.classList.toggle('ds-fullscreen-modal__divider--scrolled', scrolled);
    });

    this._onKeydown = (e) => {
      if (!this.hasAttribute('open')) return;
      if (e.key === 'Escape') {
        const allowEsc = !this.hasAttribute('dismiss-on-esc')
          ? true
          : this.getAttribute('dismiss-on-esc') !== 'false';
        if (allowEsc) {
          e.preventDefault();
          this._dismiss();
        }
      } else if (e.key === 'Tab') {
        this._trapFocus(e);
      }
    };
  }

  _sync() {
    const tone = enumAttr(this, 'leading-tone', TONES, 'info');
    const def  = TONE_DEFAULTS[tone];
    const title = this.getAttribute('title') || 'Modal title';
    const description = this.getAttribute('description') || '';
    const iconName = this.getAttribute('leading-icon') || def.icon;
    const hideClose = boolAttr(this, 'hide-close');
    const showDivH = !this.hasAttribute('show-divider-header')
      ? true
      : this.getAttribute('show-divider-header') !== 'false';
    const showDivF = !this.hasAttribute('show-divider-footer')
      ? true
      : this.getAttribute('show-divider-footer') !== 'false';

    this.dataset.tone = tone;

    /* Leading icon is OPTIONAL — off by default. Shown only when `show-icon` is
       set, or when a `leading-icon` name is explicitly provided. When hidden,
       the title moves to the header's leading edge (aligned with the body). */
    const showIcon = this.hasAttribute('leading-icon')
      || (this.hasAttribute('show-icon') && this.getAttribute('show-icon') !== 'false');
    this._leading.hidden = !showIcon;
    if (showIcon) {
      this._leadingIcon.setAttribute('name', iconName);
      this.dataset.hasIcon = '';
    } else {
      delete this.dataset.hasIcon;
    }
    this._titleEl.textContent = title;
    if (description) {
      this._descEl.textContent = description;
      this._descEl.hidden = false;
    } else {
      this._descEl.hidden = true;
    }
    this._dividerH.hidden = !showDivH;
    this._dividerF.hidden = !showDivF;
    this._closeBtn.hidden = hideClose;

    this._setBtn('primary',   this.getAttribute('primary-label')   || 'Confirm');
    this._setBtn('secondary', this.getAttribute('secondary-label') || 'Cancel');
    const tertiaryLabel = this.getAttribute('tertiary-label');
    this._btns.tertiary.hidden = !tertiaryLabel;
    if (tertiaryLabel) this._setBtn('tertiary', tertiaryLabel);

    /* Loading: spinner on the primary action while an async save runs; lock
       the other footer actions + close so the user can't abandon mid-save. */
    const loading = boolAttr(this, 'loading');
    if (loading) {
      this._btns.primary.setAttribute('loading', '');
      this._btns.secondary.setAttribute('disabled', '');
      this._btns.tertiary.setAttribute('disabled', '');
      if (this._closeBtn) this._closeBtn.setAttribute('disabled', '');
    } else {
      this._btns.primary.removeAttribute('loading');
      this._btns.secondary.removeAttribute('disabled');
      this._btns.tertiary.removeAttribute('disabled');
      if (this._closeBtn) this._closeBtn.removeAttribute('disabled');
    }
  }

  _setBtn(act, label) {
    const btn = this._btns[act];
    if (!btn) return;
    const inner = btn.querySelector('.ds-button__label');
    if (inner) inner.textContent = label;
    else btn.textContent = label;
  }

  // ---- Lifecycle ----------------------------------------------------------
  _onOpen() {
    if (typeof document === 'undefined') return;
    /* Portal to <body> so the fixed overlay/dialog escape any ancestor stacking
       context (e.g. the shell's z-indexed `ds-content` region) and paint above
       app chrome like the header. Set `_portaled` BEFORE the move because
       appendChild re-fires connectedCallback → _onOpen synchronously; the guards
       below make that re-entry a no-op. */
    if (!this._portaled && this.parentNode && this.parentNode !== document.body) {
      this._portalHome = { parent: this.parentNode, next: this.nextSibling };
      this._portaled = true;
      document.body.appendChild(this);
    }
    if (this._opened) return;
    this._opened = true;
    this._previouslyFocused = (this.returnFocusTo instanceof HTMLElement)
      ? this.returnFocusTo
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    document.addEventListener('keydown', this._onKeydown);
    this._applyScrollLock();
    /* Prefer the first focusable control in the body — the spec wants the
       user dropped into the working area, not the close button. Fall back
       to the dialog itself if the body has no focusables yet. */
    requestAnimationFrame(() => {
      const firstInBody = this._bodyEl.querySelector(FOCUSABLE);
      const target = firstInBody || this._dialog;
      target?.focus?.();
    });
    this.dispatchEvent(new CustomEvent('ds-fullscreen-open', { bubbles: true }));
  }

  _onClose() {
    document.removeEventListener('keydown', this._onKeydown);
    this._releaseScrollLock();
    if (this._previouslyFocused?.focus) this._previouslyFocused.focus();
    this.dispatchEvent(new CustomEvent('ds-fullscreen-close', { bubbles: true }));
    this._opened = false;
    /* Return the element to where it was portaled from. `open` is already
       removed by now, so the reconnect won't re-trigger _onOpen. */
    if (this._portaled) {
      const home = this._portalHome;
      this._portaled = false;
      this._portalHome = null;
      if (home && home.parent && home.parent.isConnected) home.parent.insertBefore(this, home.next);
      else this.remove();
    }
  }

  _applyScrollLock() {
    if (this._scrollLocked) return;
    this._prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this._scrollLocked = true;
  }

  _releaseScrollLock() {
    if (!this._scrollLocked) return;
    document.body.style.overflow = this._prevBodyOverflow || '';
    this._scrollLocked = false;
  }

  _dismiss() {
    /* All dismiss paths (close button, overlay, Esc) route through here, so a
       single guard locks the modal while an async primary action is running. */
    if (boolAttr(this, 'loading')) return;
    this.removeAttribute('open');
  }

  _fire(act) {
    const eventName = `ds-fullscreen-${act}`;
    const event = new CustomEvent(eventName, { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
    if (event.defaultPrevented) return;
    /* primary + secondary auto-close; tertiary is "Back" / wizard nav and
       must NOT close — the consumer drives navigation. */
    if (act === 'primary' || act === 'secondary') this.removeAttribute('open');
  }

  _trapFocus(e) {
    const focusable = Array.from(this._dialog.querySelectorAll(FOCUSABLE))
      .filter((el) => !el.hidden && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-fullscreen-modal')) {
  customElements.define('ds-fullscreen-modal', DsFullscreenModal);
}
