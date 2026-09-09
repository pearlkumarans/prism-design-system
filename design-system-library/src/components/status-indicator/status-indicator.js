import { boolAttr, enumAttr } from '../../utils/attr.js';
import { escapeHtml } from '../../utils/escape.js';
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import '../../icons/icon.js';

const STATUSES = ['neutral', 'success', 'warning', 'critical', 'info', 'alert'];
const SIZES = ['small', 'medium', 'large'];

export class DsStatusIndicator extends HTMLElement {
  static get observedAttributes() { return ['status', 'size', 'label', 'icon', 'show-label', 'disabled', 'interactive', 'rtl', 'pulse']; }

  connectedCallback() {
    if (!this._root) {
      this._labelText = this.textContent.trim() || this.getAttribute('label') || 'Status';
      this.innerHTML = '';
      this._root = document.createElement('span');
      this.appendChild(this._root);
    }
    this._render();
    /* A framework may append the label text AFTER upgrade (captured empty above).
       Reclaim the stray text into _labelText and re-render. */
    watchLateChildren(this, (leaked) => {
      const text = (leaked || []).map((n) => n.textContent).join('').trim();
      (leaked || []).forEach((n) => n.remove());
      if (text && !this.getAttribute('label')) this._labelText = text;
      this._render();
    });
  }

  disconnectedCallback() { stopLateChildren(this); }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* status/size/disabled/interactive/rtl are visual-only — repaint the root
       chrome (classes/aria/dir/tabindex + the icon px) in place instead of
       rebuilding innerHTML (which re-parsed the ds-icon). label/icon/show-label
       change the content, so they rebuild. */
    if (name === 'status' || name === 'size' || name === 'disabled'
        || name === 'interactive' || name === 'rtl' || name === 'pulse') this._paintChrome();
    else this._render();
  }

  /* Root chrome only (classes / aria-label / dir / interactive tab stop) + an
     in-place bump of the icon px — no innerHTML rebuild. */
  _paintChrome() {
    const status = enumAttr(this, 'status', STATUSES, 'neutral');
    const size = enumAttr(this, 'size', SIZES, 'small');
    const label = this.getAttribute('label') || this._labelText || 'Status';
    const showLabel = !this.hasAttribute('show-label') || this.getAttribute('show-label') !== 'false';
    const disabled = boolAttr(this, 'disabled');
    const interactive = boolAttr(this, 'interactive');
    const rtl = boolAttr(this, 'rtl');
    /* pulse → animated "live" halo on the dot. Suppressed while disabled (a
       disabled status is static), and it only renders on the dot — the icon
       variant has no dot, so pulse is a no-op there. */
    const pulse = boolAttr(this, 'pulse');

    this._root.className = `ds-status-indicator ds-status-indicator--${status} ds-status-indicator--${size}`
      + (disabled ? ' ds-status-indicator--disabled' : '')
      + (interactive ? ' ds-status-indicator--interactive' : '')
      + (pulse && !disabled ? ' ds-status-indicator--pulse' : '');
    if (!showLabel) this._root.setAttribute('aria-label', label);
    else this._root.removeAttribute('aria-label');
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');
    /* Interactive → keyboard-focusable so the :focus-visible ring is reachable.
       Role stays the consumer's call (plain span per spec otherwise). */
    if (interactive && !disabled) this._root.setAttribute('tabindex', '0');
    else this._root.removeAttribute('tabindex');
    const iconPx = String(size === 'small' ? 12 : size === 'medium' ? 14 : 16);
    const ic = this._root.querySelector('.ds-status-indicator__icon ds-icon');
    if (ic && ic.getAttribute('size') !== iconPx) ic.setAttribute('size', iconPx);
  }

  _render() {
    const size = enumAttr(this, 'size', SIZES, 'small'); /* spec default: small */
    const label = this.getAttribute('label') || this._labelText || 'Status';
    const icon = this.getAttribute('icon') || '';
    const showLabel = !this.hasAttribute('show-label') || this.getAttribute('show-label') !== 'false';

    /* Root chrome (classes / aria-label / dir / interactive tab stop) — shared. */
    this._paintChrome();

    const iconPx = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
    /* Spec: an icon REPLACES the dot (Figma renders both — that's a flagged
       Figma bug; code enforces the swap). */
    this._root.innerHTML = `
      ${icon
        ? `<span class="ds-status-indicator__icon" aria-hidden="true"><ds-icon name="${escapeHtml(icon)}" size="${iconPx}"></ds-icon></span>`
        : '<span class="ds-status-indicator__dot" aria-hidden="true"></span>'}
      ${showLabel ? `<span class="ds-status-indicator__label">${escapeHtml(label)}</span>` : ''}
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-status-indicator')) {
  customElements.define('ds-status-indicator', DsStatusIndicator);
}
