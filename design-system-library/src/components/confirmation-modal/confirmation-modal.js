/* =============================================================================
   <ds-confirmation-modal
     variant="information|warning|destructive"
     title="Delete this asset?"
     description="This change can't be undone."
     primary-label="Delete asset"
     secondary-label="Cancel"
     tertiary-label="Learn more"
     icon="delete"
     hide-close
     dismiss-on-overlay-click
     open></ds-confirmation-modal>

   Compact confirmation dialog with a centered icon, title, optional
   description, body slot, and centered button group.

   Slots:
     - body   — primary content area below the title row
     - body2  — secondary content area below `body`

   Events:
     - ds-confirmation-primary    — primary button activated
     - ds-confirmation-secondary  — cancel / secondary activated
     - ds-confirmation-tertiary   — tertiary button activated
     - ds-confirmation-close      — modal dismissed (Esc / close icon / overlay)

   Properties:
     - returnFocusTo : HTMLElement|null — focus restore target on close
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import '../../icons/icon.js';
import '../button/button.js';
import '../icon-button/icon-button.js';

const VARIANTS = ['information', 'warning', 'destructive'];

const VARIANT_DEFAULTS = {
  information: { icon: 'info-circle',         buttonVariant: 'primary'     },
  warning:     { icon: 'exclamation-circle',  buttonVariant: 'warning'     },
  destructive: { icon: 'exclamation-triangle', buttonVariant: 'destructive' },
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

export class DsConfirmationModal extends HTMLElement {
  static get observedAttributes() {
    return [
      'variant', 'title', 'description',
      'primary-label', 'secondary-label', 'tertiary-label',
      'icon', 'hide-close', 'dismiss-on-overlay-click',
      'show-divider-header', 'show-divider-footer',
      'loading', 'open', 'rtl',
    ];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    /* Capture light-DOM body slot content before we overwrite innerHTML, so
       consumers can write `<ds-confirmation-modal><p>Hello</p>` and have it
       render in the body region. */
    this._initialBody = null;
    this.returnFocusTo = null;
  }

  connectedCallback() {
    if (!this._mounted) {
      this._initialBody = this.innerHTML.trim();
      this.innerHTML = '';
      this._build();
      this._mounted = true;
    }
    this._sync();
    /* If `open` was set in markup before connect, attributeChangedCallback
       skipped because we weren't mounted yet — handle it now. */
    if (boolAttr(this, 'open')) this._onOpen();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown);
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
  _build() {
    this.classList.add('ds-confirmation-modal');
    this._titleId = `ds-cm-${this._uid}-title`;
    this._bodyId  = `ds-cm-${this._uid}-body`;

    this.innerHTML = `
      <div class="ds-confirmation-modal__overlay" data-overlay></div>
      <div class="ds-confirmation-modal__dialog"
           role="alertdialog"
           aria-modal="true"
           aria-labelledby="${this._titleId}"
           aria-describedby="${this._bodyId}"
           tabindex="-1"
           data-dialog>
        <ds-icon-button class="ds-confirmation-modal__close"
                shape="square" type="tertiary-grey" size="xl"
                icon="close" label="Close" no-tooltip
                data-close></ds-icon-button>

        <div class="ds-confirmation-modal__header">
          <div class="ds-confirmation-modal__leading" data-leading>
            <ds-icon name="exclamation-circle" size="24" data-leading-icon></ds-icon>
          </div>
          <div class="ds-confirmation-modal__titles">
            <h2 class="ds-confirmation-modal__title" id="${this._titleId}" data-title></h2>
            <p   class="ds-confirmation-modal__description" data-description hidden></p>
          </div>
        </div>

        <hr class="ds-confirmation-modal__divider" data-divider-header />

        <div class="ds-confirmation-modal__body" id="${this._bodyId}" data-body>${this._initialBody || ''}</div>

        <hr class="ds-confirmation-modal__divider" data-divider-footer />

        <div class="ds-confirmation-modal__footer" data-footer>
          <ds-button variant="tertiary" size="small" data-act="tertiary"  hidden></ds-button>
          <ds-button variant="outline"  size="small" data-act="secondary"></ds-button>
          <ds-button variant="warning"  size="small" data-act="primary"></ds-button>
        </div>
      </div>`;

    this._overlay = this.querySelector('[data-overlay]');
    this._dialog  = this.querySelector('[data-dialog]');
    this._titleEl = this.querySelector('[data-title]');
    this._descEl  = this.querySelector('[data-description]');
    this._leadingIcon = this.querySelector('[data-leading-icon]');
    this._dividerH = this.querySelector('[data-divider-header]');
    this._dividerF = this.querySelector('[data-divider-footer]');
    this._closeBtn = this.querySelector('[data-close]');
    this._btns = {
      primary:   this.querySelector('[data-act="primary"]'),
      secondary: this.querySelector('[data-act="secondary"]'),
      tertiary:  this.querySelector('[data-act="tertiary"]'),
    };

    this._closeBtn.addEventListener('click', () => this._dismiss('close'));
    this._overlay.addEventListener('click', () => {
      if (boolAttr(this, 'loading')) return; // locked while confirming
      const variant = enumAttr(this, 'variant', VARIANTS, 'warning');
      const dismissOnOverlay = this.hasAttribute('dismiss-on-overlay-click')
        ? this.getAttribute('dismiss-on-overlay-click') !== 'false'
        : variant !== 'destructive';
      if (dismissOnOverlay) this._dismiss('close');
    });

    this._btns.primary.addEventListener('click', () => this._fire('primary'));
    this._btns.secondary.addEventListener('click', () => this._fire('secondary'));
    this._btns.tertiary.addEventListener('click',  () => this._fire('tertiary'));

    this._onKeydown = (e) => {
      if (!this.hasAttribute('open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        /* Don't let Esc abandon an in-flight confirm. */
        if (boolAttr(this, 'loading')) return;
        this._dismiss('close');
      } else if (e.key === 'Tab') {
        this._trapFocus(e);
      }
    };

    this._dragOffset = { x: 0, y: 0 };
    this._setupDrag();
  }

  // ---- Drag (move the dialog by its header: icon / title / description) ----
  _setupDrag() {
    const dialog = this._dialog;
    if (!dialog) return;
    const HANDLE = '.ds-confirmation-modal__leading';
    let sx = 0, sy = 0, bx = 0, by = 0, dragging = false;
    const move = (e) => {
      if (!dragging) return;
      let nx = bx + (e.clientX - sx);
      let ny = by + (e.clientY - sy);
      dialog.style.transform = `translate(${nx}px, ${ny}px)`;
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
      dialog.classList.remove('is-dragging');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    dialog.addEventListener('pointerdown', (e) => {
      if (!this.hasAttribute('open') || e.button !== 0) return;
      /* Never start from an interactive control or from selectable text
         (title / description / body) — those stay selectable. */
      if (e.target.closest('button, a, input, textarea, select, ds-icon-button, [contenteditable], [data-body], [data-footer], .ds-confirmation-modal__title, .ds-confirmation-modal__description')) return;
      /* Drag handle = the leading icon or the dialog's own padding area. */
      if (!e.target.closest(HANDLE) && e.target !== dialog) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      bx = this._dragOffset.x; by = this._dragOffset.y;
      dialog.classList.add('is-dragging');
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      e.preventDefault();
    });
  }

  _sync() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'warning');
    const def = VARIANT_DEFAULTS[variant];
    /* RTL — drives the [dir="rtl"] footer mirror (and the logical close-button
       inset) so the whole modal flips for Arabic/Hebrew. */
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');
    const title = this.getAttribute('title') || 'Modal title';
    const description = this.getAttribute('description') || '';
    const iconName = this.getAttribute('icon') || def.icon;
    const hideClose = boolAttr(this, 'hide-close');
    /* Confirmation modal is compact — header/footer dividers off by default
       so the body reads as a single uninterrupted message. Opt in by passing
       `show-divider-header` / `show-divider-footer`. */
    const showDivH = this.hasAttribute('show-divider-header')
      && this.getAttribute('show-divider-header') !== 'false';
    const showDivF = this.hasAttribute('show-divider-footer')
      && this.getAttribute('show-divider-footer') !== 'false';

    this.dataset.variant = variant;

    this._leadingIcon.setAttribute('name', iconName);
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

    /* Sync footer button labels + the primary's variant. */
    this._setBtn('primary',   this.getAttribute('primary-label')   || 'Continue');
    this._setBtn('secondary', this.getAttribute('secondary-label') || 'Cancel');
    const tertiaryLabel = this.getAttribute('tertiary-label');
    this._btns.tertiary.hidden = !tertiaryLabel;
    if (tertiaryLabel) this._setBtn('tertiary', tertiaryLabel);

    this._btns.primary.setAttribute('variant', def.buttonVariant);

    /* Loading: forward to the primary <ds-button> spinner and lock the modal
       so the user can't dismiss or re-fire while an async confirm runs.
       Secondary/tertiary are disabled; Esc + overlay + close button are
       suppressed in _dismiss/_onKeydown via the `loading` check. */
    const loading = boolAttr(this, 'loading');
    if (loading) {
      this._btns.primary.setAttribute('loading', '');
      this._btns.secondary.setAttribute('disabled', '');
      this._btns.tertiary.setAttribute('disabled', '');
      this._closeBtn.setAttribute('disabled', '');
    } else {
      this._btns.primary.removeAttribute('loading');
      this._btns.secondary.removeAttribute('disabled');
      this._btns.tertiary.removeAttribute('disabled');
      this._closeBtn.removeAttribute('disabled');
    }
  }

  _setBtn(act, label) {
    const btn = this._btns[act];
    if (!btn) return;
    /* The upgraded <ds-button> wraps its label in .ds-button__label; update
       that span if present so we don't clobber the icon/loading slots. */
    const inner = btn.querySelector('.ds-button__label');
    if (inner) inner.textContent = label;
    else btn.textContent = label;
  }

  // ---- Lifecycle ----------------------------------------------------------
  _onOpen() {
    if (typeof document === 'undefined') return;
    /* Portal to <body> so the fixed overlay/dialog escape any ancestor
       stacking context (e.g. the shell's z-indexed `ds-content` region) and
       paint above app chrome like the header. Set `_portaled` BEFORE the move
       because appendChild re-fires connectedCallback → _onOpen synchronously;
       the guards below make that re-entry a no-op. */
    if (!this._portaled && this.parentNode && this.parentNode !== document.body) {
      this._portalHome = { parent: this.parentNode, next: this.nextSibling };
      this._portaled = true;
      document.body.appendChild(this);
    }
    if (this._opened) return;
    this._opened = true;
    /* Re-center on each open — clear any prior drag offset. */
    this._dragOffset = { x: 0, y: 0 };
    if (this._dialog) this._dialog.style.transform = '';
    this._previouslyFocused = (this.returnFocusTo instanceof HTMLElement)
      ? this.returnFocusTo
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    document.addEventListener('keydown', this._onKeydown);
    /* Focus the secondary (safe) action by default — never the primary
       destructive button. The inner native <button> inside <ds-button>
       may not exist on the first frame; use a tabindex'd dialog as the
       reliable fallback so focus lands somewhere inside the trap. */
    requestAnimationFrame(() => {
      const sb = this._btns.secondary;
      const innerBtn = sb && sb.querySelector && sb.querySelector('button');
      const target = innerBtn || this._dialog;
      target?.focus?.();
    });
    this.dispatchEvent(new CustomEvent('ds-confirmation-open', { bubbles: true }));
  }

  _onClose() {
    document.removeEventListener('keydown', this._onKeydown);
    if (this._previouslyFocused?.focus) this._previouslyFocused.focus();
    this.dispatchEvent(new CustomEvent('ds-confirmation-close', { bubbles: true }));
    this._opened = false;
    /* Return the element to where it was portaled from. `open` is already
       removed by now, so the reconnect won't re-trigger _onOpen. */
    if (this._portaled) {
      const home = this._portalHome;
      this._portaled = false;
      this._portalHome = null;
      if (home && home.parent && home.parent.isConnected) {
        home.parent.insertBefore(this, home.next);
      } else {
        this.remove();
      }
    }
  }

  _dismiss(reason) {
    this.removeAttribute('open');
    if (reason !== 'close') {
      this.dispatchEvent(new CustomEvent('ds-confirmation-close', { bubbles: true, detail: { reason } }));
    }
  }

  _fire(act) {
    const eventName = `ds-confirmation-${act}`;
    const event = new CustomEvent(eventName, { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
    /* Auto-close on primary/secondary unless the consumer called
       preventDefault (e.g. to keep the modal open while an async confirm
       handler runs). Tertiary never auto-closes — it's an auxiliary action. */
    if (event.defaultPrevented) return;
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

if (typeof customElements !== 'undefined' && !customElements.get('ds-confirmation-modal')) {
  customElements.define('ds-confirmation-modal', DsConfirmationModal);
}
