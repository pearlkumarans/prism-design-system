/* =============================================================================
   <ds-illustration name="access-denied" size="medium"></ds-illustration>

   Renders an inline SVG referencing the illustrations sprite. Unlike
   <ds-icon>, the sprite preserves its own multi-color fills (no currentColor).

   Sprite location:
     - Default: /illustrations.svg (served via vite publicDir in dev).
     - Override at runtime via window.UEMS_ILLUSTRATION_SPRITE.
   ============================================================================= */

const DEFAULT_SPRITE = '/illustrations.svg';

export class DsIllustration extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'width', 'height'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const name = this.getAttribute('name') || '';
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    const sprite =
      (typeof window !== 'undefined' && window.UEMS_ILLUSTRATION_SPRITE) ||
      DEFAULT_SPRITE;

    this.setAttribute('aria-hidden', 'true');

    const sizeAttrs = [];
    if (width)  sizeAttrs.push(`width="${width}"`);
    if (height) sizeAttrs.push(`height="${height}"`);

    this.innerHTML = `
      <svg ${sizeAttrs.join(' ') || 'width="100%" height="100%"'} focusable="false" aria-hidden="true">
        <use href="${sprite}#illu-${name}"></use>
      </svg>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-illustration')) {
  customElements.define('ds-illustration', DsIllustration);
}
