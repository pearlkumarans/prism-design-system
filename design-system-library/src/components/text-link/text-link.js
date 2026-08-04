import { boolAttr, enumAttr } from '../../utils/attr.js';

const STYLES = ['primary', 'secondary', 'subtle', 'danger'];
const SIZES = ['small', 'medium', 'large'];
const UNDERLINES = ['always', 'hover', 'none'];

export class DsTextLink extends HTMLElement {
  static get observedAttributes() { return ['variant', 'size', 'underline', 'href', 'leading-icon', 'trailing-icon', 'disabled', 'rtl', 'target']; }

  connectedCallback() {
    if (!this._anchor) {
      this._slottedText = this.textContent.trim() || 'Text Link';
      this.innerHTML = '';
      this._anchor = document.createElement('a');
      this.appendChild(this._anchor);
    }
    this._render();
  }

  attributeChangedCallback() { if (this._anchor) this._render(); }

  _render() {
    const variant = enumAttr(this, 'variant', STYLES, 'primary');
    const size = enumAttr(this, 'size', SIZES, 'small');
    const underline = enumAttr(this, 'underline', UNDERLINES, 'none');
    const href = this.getAttribute('href');
    const leadingIcon = this.getAttribute('leading-icon');
    const trailingIcon = this.getAttribute('trailing-icon');
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl');

    this._anchor.className = `ds-text-link ds-text-link--${variant} ds-text-link--${size} ds-text-link--underline-${underline}`;
    const target = this.getAttribute('target');
    if (href && !disabled) this._anchor.setAttribute('href', href);
    else this._anchor.removeAttribute('href');
    /* External links: honour target and harden with rel so opener can't be hijacked. */
    if (target && !disabled) {
      this._anchor.setAttribute('target', target);
      if (target === '_blank') this._anchor.setAttribute('rel', 'noopener noreferrer');
      else this._anchor.removeAttribute('rel');
    } else { this._anchor.removeAttribute('target'); this._anchor.removeAttribute('rel'); }
    if (disabled) this._anchor.setAttribute('aria-disabled', 'true');
    else this._anchor.removeAttribute('aria-disabled');
    if (rtl) this._anchor.setAttribute('dir', 'rtl');
    else this._anchor.removeAttribute('dir');

    const iconPx = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
    this._anchor.innerHTML = `
      ${leadingIcon ? `<span class="ds-text-link__icon"><ds-icon name="${leadingIcon}" size="${iconPx}"></ds-icon></span>` : ''}
      <span>${this._slottedText}</span>
      ${trailingIcon ? `<span class="ds-text-link__icon"><ds-icon name="${trailingIcon}" size="${iconPx}"></ds-icon></span>` : ''}
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-text-link')) {
  customElements.define('ds-text-link', DsTextLink);
}
