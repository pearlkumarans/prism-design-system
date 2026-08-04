import { boolAttr, enumAttr } from '../../utils/attr.js';

const STATUSES = ['neutral', 'success', 'warning', 'critical', 'info', 'alert'];
const SIZES = ['small', 'medium', 'large'];

export class DsStatusIndicator extends HTMLElement {
  static get observedAttributes() { return ['status', 'size', 'label', 'icon', 'show-label', 'disabled', 'interactive', 'rtl']; }

  connectedCallback() {
    if (!this._root) {
      this._labelText = this.textContent.trim() || this.getAttribute('label') || 'Status';
      this.innerHTML = '';
      this._root = document.createElement('span');
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  _render() {
    const status = enumAttr(this, 'status', STATUSES, 'neutral');
    const size = enumAttr(this, 'size', SIZES, 'small'); /* spec default: small */
    const label = this.getAttribute('label') || this._labelText || 'Status';
    const icon = this.getAttribute('icon') || '';
    const showLabel = !this.hasAttribute('show-label') || this.getAttribute('show-label') !== 'false';
    const disabled = boolAttr(this, 'disabled');
    const interactive = boolAttr(this, 'interactive');
    const rtl = boolAttr(this, 'rtl');

    this._root.className = `ds-status-indicator ds-status-indicator--${status} ds-status-indicator--${size}`
      + (disabled ? ' ds-status-indicator--disabled' : '')
      + (interactive ? ' ds-status-indicator--interactive' : '');
    /* Plain span per spec — no role; consumers wrap dynamic regions in
       aria-live themselves. Dot-only mode still needs an accessible name. */
    if (!showLabel) this._root.setAttribute('aria-label', label);
    else this._root.removeAttribute('aria-label');
    /* Reflect rtl as dir="rtl" so the dot+icon+label flex order auto-mirrors
       (dot moves to the right of the label in RTL). */
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const iconPx = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
    /* Spec: an icon REPLACES the dot (Figma renders both — that's a flagged
       Figma bug; code enforces the swap). */
    this._root.innerHTML = `
      ${icon
        ? `<span class="ds-status-indicator__icon" aria-hidden="true"><ds-icon name="${icon}" size="${iconPx}"></ds-icon></span>`
        : '<span class="ds-status-indicator__dot" aria-hidden="true"></span>'}
      ${showLabel ? `<span class="ds-status-indicator__label">${label}</span>` : ''}
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-status-indicator')) {
  customElements.define('ds-status-indicator', DsStatusIndicator);
}
