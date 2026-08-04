/* =============================================================================
   <ds-badge variant="subtle" state="success" size="medium" shape="pill"
             icon="check" label="Active">
   </ds-badge>

   - Light DOM rendering so consumers can override fonts / inline styles freely.
   - Public attributes: variant | state | size | shape | icon | rtl.
   - Default slot is the label; an `icon` slot accepts custom leading content.
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const VARIANTS = ['intense', 'subtle'];
const STATES   = ['default', 'active', 'critical', 'moderate', 'important', 'success', 'acknowledge'];
const SIZES    = ['small', 'medium', 'large'];
const SHAPES   = ['pill', 'rounded'];

export class DsBadge extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'state', 'size', 'shape', 'icon', 'label', 'rtl', 'interactive', 'disabled'];
  }

  connectedCallback() {
    if (!this._mounted) {
      /* Disabled guard (capture phase) — block a consumer's click/activation
         when disabled. This lets the CSS keep pointer-events ON (so the
         not-allowed cursor shows) without re-enabling interaction. */
      this.addEventListener('click', (e) => {
        if (boolAttr(this, 'disabled')) { e.stopImmediatePropagation(); e.preventDefault(); }
      }, true);
      this.addEventListener('keydown', (e) => {
        if (boolAttr(this, 'disabled') && (e.key === 'Enter' || e.key === ' ')) {
          e.stopImmediatePropagation(); e.preventDefault();
        }
      }, true);
      this._render();
      this._mounted = true;
    } else {
      this._update();
    }
  }

  attributeChangedCallback() {
    if (this._mounted) this._update();
  }

  _classes() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'intense');
    const state   = enumAttr(this, 'state',   STATES,   'default');
    const size    = enumAttr(this, 'size',    SIZES,    'medium');
    const shape   = enumAttr(this, 'shape',   SHAPES,   'pill');
    return [
      'ds-badge',
      `ds-badge--${variant}`,
      `ds-badge--${state}`,
      `ds-badge--${size}`,
      `ds-badge--${shape}`,
    ];
  }

  _iconPx() {
    // Spec: 8×8 / 12×12 / 16×16 per size
    const size = enumAttr(this, 'size', SIZES, 'medium');
    return size === 'small' ? 8 : size === 'large' ? 16 : 12;
  }

  /* Make a badge keyboard-focusable + screen-reader-clickable when the
     consumer sets `interactive`. Disabled overrides interactive so the
     badge drops out of the tab order. */
  _syncInteractive() {
    const interactive = boolAttr(this, 'interactive');
    const disabled    = boolAttr(this, 'disabled');
    if (interactive && !disabled) {
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.hasAttribute('role'))     this.setAttribute('role', 'button');
    } else if (disabled) {
      this.setAttribute('tabindex', '-1');
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('tabindex');
      this.removeAttribute('role');
      this.removeAttribute('aria-disabled');
    }
  }

  _render() {
    // We render into the host element itself (light DOM).
    // The custom element IS the badge, so apply classes to `this`.
    this.classList.add(...this._classes());
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    this._syncInteractive();

    // If the consumer used an `icon` attribute, prepend a <ds-icon>.
    // If they used <something slot="icon">, leave their content alone.
    const iconName = this.getAttribute('icon');
    const hasIconSlot = this.querySelector('[slot="icon"]');
    const labelAttr = this.getAttribute('label');

    if (iconName && !hasIconSlot && !this.querySelector('.ds-badge__icon')) {
      const wrap = document.createElement('span');
      wrap.className = 'ds-badge__icon';
      wrap.innerHTML = `<ds-icon name="${iconName}" size="${this._iconPx()}"></ds-icon>`;
      this.prepend(wrap);
    }
    if (labelAttr && !this.querySelector('.ds-badge__label')) {
      const span = document.createElement('span');
      span.className = 'ds-badge__label';
      span.textContent = labelAttr;
      this.appendChild(span);
    }
  }

  _update() {
    // Replace the modifier classes; keep any consumer classes untouched.
    [...this.classList].forEach((c) => {
      if (c.startsWith('ds-badge')) this.classList.remove(c);
    });
    this.classList.add(...this._classes());
    if (boolAttr(this, 'rtl')) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');
    this._syncInteractive();

    // Update icon if `icon` attribute changed
    const iconName = this.getAttribute('icon');
    const iconWrap = this.querySelector('.ds-badge__icon');
    if (iconName) {
      const px = this._iconPx();
      if (iconWrap) {
        iconWrap.innerHTML = `<ds-icon name="${iconName}" size="${px}"></ds-icon>`;
      } else if (!this.querySelector('[slot="icon"]')) {
        const w = document.createElement('span');
        w.className = 'ds-badge__icon';
        w.innerHTML = `<ds-icon name="${iconName}" size="${px}"></ds-icon>`;
        this.prepend(w);
      }
    } else if (iconWrap && !iconWrap.querySelector('[slot="icon"]')) {
      iconWrap.remove();
    }

    // Update label
    const labelAttr = this.getAttribute('label');
    const labelEl = this.querySelector('.ds-badge__label');
    if (labelAttr && labelEl) labelEl.textContent = labelAttr;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-badge')) {
  customElements.define('ds-badge', DsBadge);
}
