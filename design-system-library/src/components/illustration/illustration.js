/* =============================================================================
   <ds-illustration name="access-denied" size="medium"></ds-illustration>

   Renders an inline SVG referencing the illustrations sprite. Unlike
   <ds-icon>, the sprite preserves its own multi-color fills (no currentColor).

   Sprite location:
     - Default: /illustrations.svg (served via vite publicDir in dev).
     - Override at runtime via window.UEMS_ILLUSTRATION_SPRITE.
   ============================================================================= */

const DEFAULT_SPRITE = '/illustrations.svg';
const SVG_NS = 'http://www.w3.org/2000/svg';

export class DsIllustration extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'width', 'height'];
  }

  connectedCallback() {
    this.setAttribute('aria-hidden', 'true');
    if (!this._svg) {
      /* Build the <svg><use> once via the DOM API and patch attributes on change
         (keyed repaint) rather than re-parsing innerHTML each time. setAttribute
         doesn't parse HTML, so consumer values need no escaping to be safe. */
      this._svg = document.createElementNS(SVG_NS, 'svg');
      this._svg.setAttribute('focusable', 'false');
      this._svg.setAttribute('aria-hidden', 'true');
      this._use = document.createElementNS(SVG_NS, 'use');
      this._svg.appendChild(this._use);
      this.innerHTML = '';
      this.appendChild(this._svg);
    }
    this._paint();
  }

  attributeChangedCallback() {
    if (this._svg) this._paint();
  }

  _paint() {
    const name = this.getAttribute('name') || '';
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    const sprite =
      (typeof window !== 'undefined' && window.UEMS_ILLUSTRATION_SPRITE) ||
      DEFAULT_SPRITE;

    const hasW = width != null && width !== '';
    const hasH = height != null && height !== '';
    if (hasW) this._svg.setAttribute('width', width); else this._svg.removeAttribute('width');
    if (hasH) this._svg.setAttribute('height', height); else this._svg.removeAttribute('height');
    if (!hasW && !hasH) { this._svg.setAttribute('width', '100%'); this._svg.setAttribute('height', '100%'); }

    this._use.setAttribute('href', `${sprite}#illu-${name}`);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-illustration')) {
  customElements.define('ds-illustration', DsIllustration);
}
