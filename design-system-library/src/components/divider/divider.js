/* =============================================================================
   <ds-divider orientation="horizontal" type="full" pattern="solid" thickness="thin">

   `pattern` is the line style (solid / dashed / dotted). Named `pattern`
   instead of `style` because every HTMLElement already exposes an inline
   `style` property and using that as a custom attribute conflicts.

   For `type="with-text"`, the divider renders as a flex row with two line
   pseudo-elements flanking the label (default-slot text or `label` attr).
   ============================================================================= */

import { enumAttr } from '../../utils/attr.js';

const ORIENTATIONS = ['horizontal', 'vertical'];
const TYPES        = ['full-width', 'inset', 'middle-inset', 'with-text'];
const PATTERNS     = ['solid', 'dashed', 'dotted'];
const THICKNESSES  = ['thin', 'medium'];

export class DsDivider extends HTMLElement {
  static get observedAttributes() {
    return ['orientation', 'type', 'pattern', 'thickness', 'label'];
  }

  connectedCallback() {
    if (!this._mounted) {
      // For with-text variants, capture default-slot text once
      this._fallbackLabel = this.textContent.trim();
      this._mounted = true;
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._mounted) this._sync();
  }

  _sync() {
    const orientation = enumAttr(this, 'orientation', ORIENTATIONS, 'horizontal');
    const type        = enumAttr(this, 'type',        TYPES,        'full-width');
    const pattern     = enumAttr(this, 'pattern',     PATTERNS,     'solid');
    const thickness   = enumAttr(this, 'thickness',   THICKNESSES,  'thin');

    [...this.classList].forEach((c) => {
      if (c.startsWith('ds-divider')) this.classList.remove(c);
    });

    this.classList.add(
      'ds-divider',
      `ds-divider--${orientation}`,
      `ds-divider--${type}`,
      `ds-divider--${pattern}`,
      `ds-divider--${thickness}`,
    );

    // Accessibility: separator semantics
    this.setAttribute('role', 'separator');
    if (orientation === 'vertical') this.setAttribute('aria-orientation', 'vertical');
    else this.removeAttribute('aria-orientation');

    if (type === 'with-text') {
      const label = this.getAttribute('label') ?? this._fallbackLabel ?? 'Label';
      this.textContent = label;
    } else if (this.textContent) {
      // Strip any leftover text from a previous with-text render
      this.textContent = '';
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-divider')) {
  customElements.define('ds-divider', DsDivider);
}
