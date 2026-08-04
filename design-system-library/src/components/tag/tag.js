/* =============================================================================
   <ds-tag variant="success" size="small" leading="status" status="success"
           label="Marketing"></ds-tag>

   Interactive chip. Defaults per spec: variant=neutral, size=small,
   show-close=true. Leading: none (default) | status (dot) | icon (+ icon
   attr); `dot` is accepted as a legacy alias of `status`.

   Interaction (spec): the tag is one tab stop (tabindex=0); the close button
   is tabindex=-1 and reached via the tag — Backspace/Delete on the focused
   tag mirrors a close click. Emits `ds-tag-close` before removing itself.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const VARIANTS = ['neutral', 'primary', 'success', 'warning', 'error', 'outline'];
const SIZES = ['small', 'medium', 'large'];

/* Dot fill per forwarded status — same matrix as ds-status-indicator */
const STATUS_DOT = {
  neutral:  'var(--uems-bg-quaternary-solid)',
  success:  'var(--uems-bg-success-solid)',
  warning:  'var(--uems-bg-warning-solid)',
  critical: 'var(--uems-text-error)',
  info:     'var(--uems-bg-info-solid)',
};

/* No explicit `status`? The dot follows the tag's variant so a Primary tag
   gets a blue dot, Success green, Error red, etc. An explicit `status`
   attribute always overrides. */
const VARIANT_STATUS = {
  neutral: 'neutral',
  primary: 'info',
  success: 'success',
  warning: 'warning',
  error:   'critical',
  outline: 'neutral',
};

export class DsTag extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'label', 'icon', 'leading', 'status', 'show-close', 'disabled', 'rtl'];
  }

  connectedCallback() {
    if (!this._root) {
      this._slottedLabel = this.textContent.trim();
      this.innerHTML = '';
      this._root = document.createElement('span');
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  _close(label) {
    this.dispatchEvent(new CustomEvent('ds-tag-close', { bubbles: true, detail: { label } }));
    this.remove();
  }

  _render() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'neutral');
    const size = enumAttr(this, 'size', SIZES, 'small'); /* spec default: small */
    const label = this.getAttribute('label') || this._slottedLabel || 'Tag';
    const icon = this.getAttribute('icon');
    let leading = this.getAttribute('leading'); // 'status' | 'icon' | null ('dot' = legacy alias)
    if (leading === 'dot') leading = 'status';
    const status = enumAttr(this, 'status', Object.keys(STATUS_DOT), VARIANT_STATUS[variant] || 'success');
    /* Spec: `Show Close` defaults to `true`. Use the "default-on, set to
       'false' to hide" attribute convention — boolAttr's presence-only check
       would default to false and break that contract. */
    const showClose = !this.hasAttribute('show-close')
      ? true
      : this.getAttribute('show-close') !== 'false';
    const disabled = boolAttr(this, 'disabled');
    const rtl = boolAttr(this, 'rtl');

    this._root.className = `ds-tag ds-tag--${variant} ds-tag--${size}`
      + (disabled ? ' ds-tag--disabled' : '')
      + (leading === 'status' ? ' ds-tag--leading-status' : '')
      + (leading === 'icon' && icon ? ' ds-tag--leading-icon' : '')
      + (showClose ? '' : ' ds-tag--no-close');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* One tab stop per tag; skipped entirely when disabled. */
    if (disabled) {
      this._root.removeAttribute('tabindex');
      this._root.setAttribute('aria-disabled', 'true');
    } else {
      this._root.setAttribute('tabindex', '0');
      this._root.removeAttribute('aria-disabled');
    }

    /* Leading icon: 12/16/16 per size (spec table) */
    const iconPx = size === 'small' ? 12 : 16;

    let leadingHTML = '';
    if (leading === 'status') {
      leadingHTML = `<span class="ds-tag__dot-box" aria-hidden="true"><span class="ds-tag__dot" style="--_tag-dot: ${STATUS_DOT[status]}"></span></span>`;
    } else if (leading === 'icon' && icon) {
      leadingHTML = `<span class="ds-tag__icon" aria-hidden="true"><ds-icon name="${icon}" size="${iconPx}"></ds-icon></span>`;
    }

    this._root.innerHTML = `
      ${leadingHTML}
      <span class="ds-tag__label">${label}</span>
      ${showClose ? `<button class="ds-tag__close" type="button" aria-label="Remove ${label}" tabindex="-1" data-close><ds-icon name="close" size="8"></ds-icon></button>` : ''}
    `;

    this._root.querySelector('[data-close]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._close(label);
    });

    /* Keyboard removal parity: Backspace/Delete on the focused tag. */
    if (!this._keysWired) {
      this._keysWired = true;
      this._root.addEventListener('keydown', (e) => {
        if ((e.key === 'Backspace' || e.key === 'Delete')
            && !boolAttr(this, 'disabled')
            && this._root.querySelector('[data-close]')) {
          e.preventDefault();
          this._close(this.getAttribute('label') || this._slottedLabel || 'Tag');
        }
      });
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-tag')) {
  customElements.define('ds-tag', DsTag);
}
