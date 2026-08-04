/* =============================================================================
   <ds-content [framed]>
     <!-- page body goes here -->
   </ds-content>

   Main content area for app-shell pages. Sits inside `.body` next to the
   sidebars; takes the remaining space and scrolls vertically.

   Attributes:
     framed   — When set, the content area gets a rounded top-left corner
                + soft left drop shadow. Use this when L2 is hidden (L1-only
                layout) so the content still feels framed.

   Light DOM (no shadow root) — host element acts as the container so apps
   can style children freely (matches ds-sidebar-l1 / ds-sidebar-l2).

   Auto-frame: when L2 is hidden (previous sibling has class `is-hidden`),
   the component automatically toggles its framed state.
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';

export class DsContent extends HTMLElement {
  static get observedAttributes() { return ['framed']; }

  connectedCallback() {
    if (!this._mounted) {
      this.classList.add('ds-content');
      this._mounted = true;
      this._wireAutoFrame();
    }
    this._render();
  }

  attributeChangedCallback() {
    if (this._mounted) this._render();
  }

  _render() {
    const framed = boolAttr(this, 'framed');
    this.classList.toggle('ds-content--framed', framed);
  }

  /* Auto-frame: observe the previous sibling (typically ds-sidebar-l2).
     When it gains `is-hidden`, set framed=true; when it loses it, framed=false.
     Apps can still override with the explicit `framed` attribute. */
  _wireAutoFrame() {
    const prev = this.previousElementSibling;
    if (!prev) return;
    const apply = () => {
      if (this.hasAttribute('framed')) return;  // explicit override wins
      const isFramed = prev.classList.contains('is-hidden');
      this.classList.toggle('ds-content--framed', isFramed);
    };
    apply();
    this._observer = new MutationObserver(apply);
    this._observer.observe(prev, { attributes: true, attributeFilter: ['class'] });
  }

  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-content')) {
  customElements.define('ds-content', DsContent);
}
