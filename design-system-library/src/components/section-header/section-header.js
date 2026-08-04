import { boolAttr, enumAttr } from '../../utils/attr.js';

const SIZES = ['small', 'medium', 'large'];
const STYLES = ['default', 'with-description', 'with-border'];
const DIVIDERS = ['none', 'bottom', 'both'];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/**
 * <ds-section-header> — a compact heading that labels a section/sub-region.
 * Spec: design-system/handoff/SectionHeader.md (Figma 17392:399995)
 *
 * Styles:
 *   default          → title only
 *   with-description → title + description stacked in one text group
 *   with-border      → title + trailing rule (Border-Tertiary) + action on the
 *                      title row, and the description on a full-width 2nd row.
 */
export class DsSectionHeader extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'style-variant', 'divider', 'title', 'description',
            'action-label', 'show-action', 'heading-level', 'rtl'];
  }

  connectedCallback() {
    if (!this._root) {
      this._slottedAction = this.querySelector('[slot="action"]');
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  _render() {
    const size = enumAttr(this, 'size', SIZES, 'medium');
    const style = enumAttr(this, 'style-variant', STYLES, 'default');
    const divider = enumAttr(this, 'divider', DIVIDERS, 'none');

    /* `title` is a GLOBAL HTML attribute — leaving it on the host makes the
       browser show a native tooltip on hover. Cache the value internally and
       strip the attribute (the removal re-triggers render; the cache holds). */
    if (this.hasAttribute('title')) {
      this._title = this.getAttribute('title');
      this.removeAttribute('title');
      return; /* attributeChangedCallback re-renders with the cached value */
    }

    const title = this._title || 'Section Title';
    const description = this.getAttribute('description') || '';
    const actionLabel = this.getAttribute('action-label') || '';
    /* The right-side action link is OFF by default — opt in with `show-action`
       (plus an `action-label` or a slotted [slot="action"]). A label alone no
       longer renders a link. */
    const showAction = (actionLabel || this._slottedAction) &&
      this.hasAttribute('show-action') && this.getAttribute('show-action') !== 'false';
    const rtl = boolAttr(this, 'rtl');
    const isBorder = style === 'with-border';

    /* Description shows for the with-description and with-border presets only
       (Default is title-only, per the Figma Style presets). */
    const showDesc = !!description && (style === 'with-description' || isBorder);

    /* Heading element: explicit `heading-level` wins; otherwise derive from size
       (large → h2, medium → h3, small → h4) for a sensible default outline. */
    const lvlAttr = parseInt(this.getAttribute('heading-level'), 10);
    const level = (lvlAttr >= 1 && lvlAttr <= 6)
      ? lvlAttr
      : (size === 'large' ? 2 : size === 'medium' ? 3 : 4);
    const hTag = `h${level}`;

    let cls = `ds-section-header ds-section-header--${size}`;
    if (isBorder) cls += ' ds-section-header--with-border';
    if (divider === 'bottom') cls += ' ds-section-header--divider-bottom';
    if (divider === 'both') cls += ' ds-section-header--divider-both';
    this._root.className = cls;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const descHtml = `<p class="ds-section-header__description">${esc(description)}</p>`;

    this._root.innerHTML = `
      <div class="ds-section-header__content">
        <div class="ds-section-header__group">
          <${hTag} class="ds-section-header__title">${esc(title)}</${hTag}>
          ${(showDesc && !isBorder) ? descHtml : ''}
        </div>
        ${isBorder ? '<span class="ds-section-header__rule" aria-hidden="true"></span>' : ''}
        ${showAction ? '<div class="ds-section-header__action" data-action-slot></div>' : ''}
      </div>
      ${(showDesc && isBorder) ? descHtml : ''}
    `;

    if (showAction) {
      const slot = this._root.querySelector('[data-action-slot]');
      if (this._slottedAction) {
        slot.appendChild(this._slottedAction);
      } else {
        const linkSize = size === 'large' ? 'medium' : 'small';
        slot.innerHTML =
          `<ds-text-link variant="primary" size="${linkSize}" underline="hover">${esc(actionLabel)}</ds-text-link>`;
      }
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-section-header')) {
  customElements.define('ds-section-header', DsSectionHeader);
}
