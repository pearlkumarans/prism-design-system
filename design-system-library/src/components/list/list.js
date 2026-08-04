/* =============================================================================
   <ds-list style="disc|circle|square|icon|number|letter|badge"
            size="small|medium|large" rtl>
     <ds-list-item>List item text</ds-list-item>
     <ds-list-item level="2">Nested item</ds-list-item>
     <ds-list-item icon="arrow-narrow-right">Custom icon item</ds-list-item>  (style=icon)
   </ds-list>

   Styles (Figma node 18416:860839):
     unordered → disc (default) · circle · square · icon (Custom Icon)
     ordered   → number · letter · badge (Custom Number)
   `disc/circle/square/icon` render as <ul>; `number/letter/badge` as <ol>.

   Back-compat: the legacy `ordered` boolean still works (→ number style);
   `<ds-list-item level="N">` children and the `items` property are unchanged.

   Each item supports:
     - level: 1 (default) | 2 (24px indent) | 3 (48px indent)
     - icon:  icon name (Custom Icon style only)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const SIZES = ['small', 'medium', 'large'];
const STYLES = ['disc', 'circle', 'square', 'icon', 'number', 'letter', 'badge'];
const ORDERED_STYLES = ['number', 'letter', 'badge'];
const DEFAULT_ICON = 'arrow-narrow-right';

export class DsList extends HTMLElement {
  static get observedAttributes() { return ['size', 'list-style', 'style-variant', 'ordered', 'rtl']; }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items;
      delete this.items;
      this._pendingItems = v;
    }
    this._items = null; // null → use slotted children
  }

  connectedCallback() {
    this._initialChildren = [...this.children].filter((c) =>
      c.tagName && c.tagName.toLowerCase() === 'ds-list-item'
    );
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    if (this._pendingItems !== undefined) {
      this.items = this._pendingItems;
      this._pendingItems = undefined;
    }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v.slice() : null;
    if (this._root) this._render();
  }

  /* Resolve the effective style: explicit `style-variant`/`list-style` wins;
     else legacy `ordered` → number; else disc. */
  _style() {
    const explicit = this.getAttribute('style-variant') || this.getAttribute('list-style');
    if (explicit && STYLES.includes(explicit)) return explicit;
    if (boolAttr(this, 'ordered')) return 'number';
    return 'disc';
  }

  _render() {
    const size = enumAttr(this, 'size', SIZES, 'small');
    const style = this._style();
    const ordered = ORDERED_STYLES.includes(style);
    const rtl = boolAttr(this, 'rtl');

    this._root.className = `ds-list ds-list--${size} ds-list--${style}`;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const tag = ordered ? 'ol' : 'ul';

    let itemsHTML = '';
    if (this._items && this._items.length) {
      itemsHTML = this._items.map((it) => this._renderItem(it, style)).join('');
    } else if (this._initialChildren && this._initialChildren.length) {
      itemsHTML = this._initialChildren.map((node) => this._renderItem({
        text: node.innerHTML,
        level: node.getAttribute('level') || '1',
        icon: node.getAttribute('icon'),
      }, style)).join('');
    }

    this._root.innerHTML = `<${tag} class="ds-list__inner">${itemsHTML}</${tag}>`;
  }

  _renderItem(item, style) {
    const isObj = typeof item === 'object' && item !== null;
    const text = typeof item === 'string' ? item : (item.text ?? item.label ?? '');
    const level = String((isObj && item.level) || 1);
    const icon = isObj && item.icon ? item.icon : DEFAULT_ICON;
    const iconHTML = style === 'icon'
      ? `<span class="ds-list__icon" aria-hidden="true"><ds-icon name="${icon}" size="100%"></ds-icon></span>`
      : '';
    return `<li class="ds-list__item" data-level="${level}">${iconHTML}<span class="ds-list__text">${text}</span></li>`;
  }
}

/* ---- Sub-component: <ds-list-item> ----------------------------------- */
export class DsListItem extends HTMLElement {
  // Declarative shell — the parent <ds-list> reads its attrs/innerHTML and
  // renders the real <li>. Hidden so it doesn't double-render.
  connectedCallback() { this.style.display = 'none'; }
}

if (typeof customElements !== 'undefined') {
  if (!customElements.get('ds-list')) customElements.define('ds-list', DsList);
  if (!customElements.get('ds-list-item')) customElements.define('ds-list-item', DsListItem);
}
