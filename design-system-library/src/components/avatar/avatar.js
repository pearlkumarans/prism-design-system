/* =============================================================================
   <ds-avatar> — Web Component
   Spec: ./avatar.md
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { getInitials } from '../../utils/initials.js';

/* Icon glyph size per avatar size — fixed per spec (Small 16 / Medium 20 /
   Large 24), NOT a diameter multiplier. */
const ICON_PX = { small: 16, medium: 20, large: 24 };
const SIZES = ['small', 'medium', 'large'];

const STYLES = `
  :host {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: var(--radius-full); overflow: hidden; position: relative;
    background-color: var(--uems-bg-tertiary);
    color: var(--uems-text-secondary);
    font-family: var(--font-family-sans);
    font-weight: var(--font-weight-semibold);
    user-select: none; box-sizing: border-box;
    width: 32px; height: 32px; font-size: var(--font-size-12);
  }
  /* Initials use Zoho Puvi Medium (spec §Typography), not semibold. */
  .initials { font-weight: var(--font-weight-medium); }
  :host([size="small"])  { width: 24px; height: 24px; font-size: var(--font-size-10); }
  :host([size="medium"]) { width: 32px; height: 32px; font-size: var(--font-size-12); }
  :host([size="large"])  { width: 52px; height: 52px; font-size: var(--font-size-16); }

  :host([editable]) { cursor: pointer; }
  :host([editable]:focus-visible) { outline: 2px solid var(--uems-border-accent-focus); outline-offset: 2px; }

  /* Content wrapper must fill the whole circle so the initials / placeholder
     fill edge-to-edge (otherwise the base surface shows as a ring). */
  [part="content"] {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .initials, .placeholder {
    width: 100%; height: 100%; display: inline-flex;
    align-items: center; justify-content: center;
    box-sizing: border-box; border-radius: var(--radius-full);
    /* Figma: initials + placeholder carry a subtle accent ring. */
    border: 1px solid var(--uems-border-accent-subtle);
  }
  /* Initials + placeholder: BG-Quaternary-Solid (#5F6C89) fill, white fg
     (MD §Design tokens — live binding, not BG-Accent-Secondary). */
  .initials   { background-color: var(--uems-bg-quaternary-solid); color: var(--uems-text-white); }
  .placeholder{ background-color: var(--uems-bg-quaternary-solid); color: var(--uems-icon-white); }

  /* Hover type — Figma "Hover": solid black surface + white image icon. */
  .hover-fill {
    width: 100%; height: 100%; display: inline-flex;
    align-items: center; justify-content: center;
    background-color: var(--grey-modern-950); color: var(--uems-icon-white);
  }

  .overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    /* Match the circular avatar so the backdrop blur clips to the circle —
       backdrop-filter ignores the host's overflow/border-radius, so the
       overlay must round itself or the blur leaks as a square. */
    border-radius: var(--radius-full);
    overflow: hidden;
    /* sit above the (now full-size) content layer */
    z-index: 1;
    /* Hover scrim — LIGHT frosted glass: a stronger 12px backdrop blur with
       only a faint dim, so the avatar behind stays softly visible. */
    background-color: rgba(21, 24, 30, 0.12);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: var(--uems-icon-white, #FFFFFF);
    /* hidden by default; fade in on hover/focus for an editable avatar */
    opacity: 0;
    pointer-events: none;
    transition: opacity 160ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  /* Hover state — black scrim + white image icon, revealed on hover for
     every type (image / initials / placeholder). Editable additionally
     reveals it on keyboard focus. Disabled never reacts (pointer-events:none
     stops :hover from firing). */
  :host(:hover) .overlay,
  :host([editable]:focus-visible) .overlay,
  :host([editable]:focus-within) .overlay { opacity: 1; }

  /* Disabled — BG-Disabled surface + Text/Icon-Disabled fg; image dimmed.
     No blanket opacity (it muddied the initials). */
  :host([disabled]) { pointer-events: none; }
  :host([disabled]) .initials    { background-color: var(--uems-bg-disabled); color: var(--uems-text-disabled); border-color: transparent; }
  :host([disabled]) .placeholder { background-color: var(--uems-bg-disabled); color: var(--uems-icon-disabled); border-color: transparent; }
  :host([disabled]) .hover-fill  { background-color: var(--uems-bg-disabled); color: var(--uems-icon-disabled); }
  :host([disabled]) img          { opacity: 0.5; }
`;

export class DsAvatar extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'name', 'size', 'type', 'disabled', 'editable'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot.firstElementChild) {
      this.shadowRoot.innerHTML = `<style>${STYLES}</style><div part="content"></div><div class="overlay" part="overlay"></div>`;
    }
    this._render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _resolveType() {
    const attrType = enumAttr(this, 'type', ['image', 'initials', 'placeholder', 'hover'], null);
    if (attrType) return attrType;
    if (this.getAttribute('src')) return 'image';
    if (this.getAttribute('name')) return 'initials';
    return 'placeholder';
  }

  _render() {
    const size      = enumAttr(this, 'size', SIZES, 'medium');
    const name      = this.getAttribute('name') || '';
    const src       = this.getAttribute('src') || '';
    const editable  = boolAttr(this, 'editable');
    const disabled  = boolAttr(this, 'disabled');
    const type      = this._resolveType();
    const iconPx    = ICON_PX[size];
    const sprite    = (typeof window !== 'undefined' && window.UEMS_ICON_SPRITE) || '/icons.svg';

    // ARIA
    if (editable) {
      this.setAttribute('role', 'button');
      this.setAttribute('aria-label', name ? `Change profile photo for ${name}` : 'Change profile photo');
      this.tabIndex = disabled ? -1 : 0;
    } else {
      this.removeAttribute('role');
      if (name) this.setAttribute('aria-label', `${name} avatar`);
      else this.removeAttribute('aria-label');
      this.removeAttribute('tabindex');
    }
    this.setAttribute('aria-disabled', String(disabled));

    const content = this.shadowRoot.querySelector('[part="content"]');
    const overlay = this.shadowRoot.querySelector('[part="overlay"]');
    /* Guard the race where an attribute change triggers a render before the
       shadow template (with [part="content"]) has been built. */
    if (!content) return;

    if (type === 'image' && src) {
      content.innerHTML = `<img alt="${this._escape(name) || ''}" src="${this._escape(src)}" />`;
      content.querySelector('img').addEventListener('error', () => {
        // Graceful fallback when src fails
        this.removeAttribute('src');
      }, { once: true });
    } else if (type === 'initials' && name) {
      content.innerHTML = `<span class="initials">${this._escape(getInitials(name))}</span>`;
    } else if (type === 'hover') {
      // Figma "Hover" type — solid black surface + white image icon.
      content.innerHTML = `
        <span class="hover-fill">
          <svg width="${iconPx}" height="${iconPx}" focusable="false" aria-hidden="true">
            <use href="${sprite}#icon-image"></use>
          </svg>
        </span>`;
    } else {
      content.innerHTML = `
        <span class="placeholder">
          <svg width="${iconPx}" height="${iconPx}" focusable="false" aria-hidden="true">
            <use href="${sprite}#icon-user"></use>
          </svg>
        </span>`;
    }

    /* Overlay icon is always rendered so the hover state works for every type;
       it stays invisible (opacity:0) until :hover / editable focus. Disabled
       avatars keep pointer-events:none so the overlay never appears. */
    overlay.innerHTML = disabled
      ? ''
      : `<svg width="${iconPx}" height="${iconPx}" focusable="false" aria-hidden="true">
           <use href="${sprite}#icon-image"></use>
         </svg>`;
  }

  _escape(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-avatar')) {
  customElements.define('ds-avatar', DsAvatar);
}
