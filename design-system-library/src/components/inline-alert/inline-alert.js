/* =============================================================================
   <ds-inline-alert type="error" style-variant="subtle" title="..." description="..."
                    action="Retry" show-dismiss show-icon rtl>
   </ds-inline-alert>

   - `style-variant` is used (not `style`) because `style` is a reserved DOM property.
   - `dismiss` fires `ds-inline-alert-dismiss`.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* The dismiss/close affordance reuses <ds-icon-button>; the action reuses <ds-text-link>. */
import '../icon-button/icon-button.js';
import '../text-link/text-link.js';

/* Auto-load icon-button.css once (light-DOM, so it's present even on pages that
   load inline-alert.css individually). Idempotent. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-inline-alert-icon-button-css', '../icon-button/icon-button.css');
_injectCss('ds-inline-alert-text-link-css', '../text-link/text-link.css');

const TYPES = ['info', 'success', 'warning', 'error', 'neutral'];
const STYLES = ['subtle', 'intense'];
const ACTION_POS = ['inline', 'bottom'];   // inline is the default
const ICON_FOR = {
  info: 'info-circle',
  success: 'circle-tick',
  warning: 'exclamation-triangle',
  error: 'exclamation-circle',
  neutral: 'info-circle',
};

export class DsInlineAlert extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'style-variant', 'title', 'description', 'action', 'action-position', 'accent-bar', 'show-dismiss', 'show-icon', 'rtl'];
  }

  connectedCallback() {
    if (!this._root) {
      /* Preserve any custom body content the consumer nested inside the alert
         (e.g. a <ds-list>) so it survives the attribute-driven re-render. Held
         in a persistent element that _sync re-parents into the rebuilt body. */
      if (this.childNodes.length) {
        this._customEl = document.createElement('div');
        this._customEl.className = 'ds-inline-alert__custom';
        while (this.firstChild) this._customEl.appendChild(this.firstChild);
      }
      this._root = document.createElement('div');
      this.innerHTML = '';
      this.appendChild(this._root);
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._root) this._sync();
  }

  _sync() {
    const type = enumAttr(this, 'type', TYPES, 'info');
    const styleV = enumAttr(this, 'style-variant', STYLES, 'subtle');
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const action = this.getAttribute('action') || '';
    const showDismiss = boolAttr(this, 'show-dismiss');
    const showIcon = !this.hasAttribute('show-icon') || this.getAttribute('show-icon') !== 'false';
    const rtl = boolAttr(this, 'rtl');
    const apos = enumAttr(this, 'action-position', ACTION_POS, 'inline');
    const accent = boolAttr(this, 'accent-bar');
    const live = (type === 'error' || type === 'warning') ? 'assertive' : 'polite';
    const role = (type === 'error' || type === 'warning') ? 'alert' : 'status';

    this._root.className = `ds-inline-alert ds-inline-alert--${styleV} ds-inline-alert--${type} ds-inline-alert--action-${apos}`
      + (accent ? ' ds-inline-alert--accent' : '');
    this._root.setAttribute('role', role);
    this._root.setAttribute('aria-live', live);
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const iconHTML = showIcon
      ? `<span class="ds-inline-alert__icon"><ds-icon name="${ICON_FOR[type]}" size="20"></ds-icon></span>`
      : '';
    const titleHTML = title ? `<div class="ds-inline-alert__title">${title}</div>` : '';
    const descHTML = description ? `<div class="ds-inline-alert__description">${description}</div>` : '';
    /* Action link per spec: leading arrow + label, single line, inherits the
       alert's title colour. Renders as a button-role anchor so consumers can
       attach a click handler via the ds-inline-alert-action event. */
    const actionHTML = action
      ? `<div class="ds-inline-alert__action">
           <ds-text-link data-action role="button" tabindex="0" variant="primary" size="medium" underline="always"
                         leading-icon="${rtl ? 'arrow-narrow-left' : 'arrow-narrow-right'}">${action}</ds-text-link>
         </div>`
      : '';
    const dismissHTML = showDismiss
      ? `<ds-icon-button class="ds-inline-alert__dismiss" shape="square" type="tertiary-grey" size="large" icon="close" label="Dismiss alert" no-tooltip data-dismiss></ds-icon-button>`
      : '';

    const accentHTML = accent ? `<span class="ds-inline-alert__accent" aria-hidden="true"></span>` : '';
    /* Inline → description + action share a row; Bottom → action stacks under */
    const bodyInner = apos === 'inline'
      ? `${titleHTML}<div class="ds-inline-alert__desc-row">${descHTML}${actionHTML}</div>`
      : `${titleHTML}${descHTML}${actionHTML}`;

    this._root.innerHTML = `
      ${accentHTML}${iconHTML}
      <div class="ds-inline-alert__body">
        ${bodyInner}
      </div>
      ${dismissHTML}
    `;

    /* Re-parent the preserved custom body (e.g. a <ds-list>) into the freshly
       rebuilt body — after the description, before any action link. */
    if (this._customEl) {
      const body = this._root.querySelector('.ds-inline-alert__body');
      const actionEl = body.querySelector('.ds-inline-alert__action');
      if (actionEl) body.insertBefore(this._customEl, actionEl);
      else body.appendChild(this._customEl);
    }

    const dismissBtn = this._root.querySelector('[data-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('ds-inline-alert-dismiss', { bubbles: true }));
        this.remove();
      });
    }
    const actionBtn = this._root.querySelector('[data-action]');
    if (actionBtn) {
      const fire = () => this.dispatchEvent(new CustomEvent('ds-inline-alert-action', { bubbles: true }));
      actionBtn.addEventListener('click', fire);
      actionBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-inline-alert')) {
  customElements.define('ds-inline-alert', DsInlineAlert);
}
