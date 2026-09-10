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
import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';
import { escapeHtml } from '../../utils/escape.js';
import '../../icons/icon.js';
import '../text-link/text-link.js';

let _uid = 0;
const SIZES = ['small', 'medium', 'large'];
const STYLES = ['disc', 'circle', 'square', 'icon', 'number', 'letter', 'badge'];
const ORDERED_STYLES = ['number', 'letter', 'badge'];
const DEFAULT_ICON = 'arrow-narrow-right';

export class DsList extends HTMLElement {
  static get observedAttributes() { return ['size', 'list-style', 'style-variant', 'ordered', 'rtl', 'title', 'heading-level']; }

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
    /* Frameworks insert <ds-list-item> after upgrade; _render reads their content,
       so merge any that leak in and drop the now-consumed nodes. */
    watchLateChildren(this, (late) => {
      const items = late.filter((n) => n.tagName && n.tagName.toLowerCase() === 'ds-list-item');
      if (!items.length) return;
      this._initialChildren.push(...items);
      items.forEach((n) => n.remove());
      this._render();
    });
  }

  disconnectedCallback() { stopLateChildren(this); }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* size/rtl are visual-only — repaint the root chrome (class + dir) without
       rebuilding the <ul>/<ol> (which would re-parse every item + its ds-icon).
       list-style/style-variant/ordered change the tag + markers → rebuild. */
    if (name === 'size' || name === 'rtl') this._paintChrome();
    else this._render();
  }

  _paintChrome() {
    const size = enumAttr(this, 'size', SIZES, 'small');
    const style = this._style();
    this._root.className = `ds-list ds-list--${size} ds-list--${style}`;
    if (boolAttr(this, 'rtl')) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');
  }

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
    const style = this._style();
    const ordered = ORDERED_STYLES.includes(style);

    this._paintChrome();

    const tag = ordered ? 'ol' : 'ul';

    let itemsHTML = '';
    if (this._items && this._items.length) {
      /* `items` are DATA (often server-sourced) → escape each string once. */
      itemsHTML = this._items.map((it) => {
        const isObj = typeof it === 'object' && it !== null;
        const raw = typeof it === 'string' ? it : (it.text ?? it.label ?? '');
        return this._renderItem({
          html: escapeHtml(raw),
          level: (isObj && it.level) || 1,
          icon: isObj ? it.icon : null,
          href: isObj ? it.href : null,
          target: isObj ? it.target : null,
        }, style);
      }).join('');
    } else if (this._initialChildren && this._initialChildren.length) {
      /* Slotted <ds-list-item> innerHTML is AUTHOR markup (they wrote it in their
         own template) → keep it as-is so inline markup (a link, <b>) renders and
         entities aren't double-escaped. `items` above is the escaped data path. */
      itemsHTML = this._initialChildren.map((node) => this._renderItem({
        html: node.innerHTML,
        level: node.getAttribute('level') || '1',
        icon: node.getAttribute('icon'),
        href: node.getAttribute('href'),
        target: node.getAttribute('target'),
      }, style)).join('');
    }

    /* Optional heading above the list. The <ul>/<ol> is labelled by it for a11y. */
    const titleText = this.getAttribute('title');
    let titleHTML = '';
    let labelledby = '';
    if (titleText) {
      const lvl = this._headingLevel();
      if (!this._titleId) this._titleId = `ds-list-title-${++_uid}`;
      titleHTML = `<h${lvl} class="ds-list__title" id="${this._titleId}">${escapeHtml(titleText)}</h${lvl}>`;
      labelledby = ` aria-labelledby="${this._titleId}"`;
    }

    this._root.innerHTML = `${titleHTML}<${tag} class="ds-list__inner"${labelledby}>${itemsHTML}</${tag}>`;
  }

  /* Heading level for the title (1–6, default 3). */
  _headingLevel() {
    const n = parseInt(this.getAttribute('heading-level'), 10);
    return (n >= 1 && n <= 6) ? n : 3;
  }

  _renderItem(item, style) {
    /* `item.html` arrives already-safe: escaped for the data path, trusted
       author markup for the slotted path. Level is clamped to digits so it's
       safe in the attribute; icon is a raw field → escaped here. */
    const level = String(item.level ?? 1).replace(/[^0-9]/g, '') || '1';
    const icon = escapeHtml(item.icon || DEFAULT_ICON);
    const iconHTML = style === 'icon'
      ? `<span class="ds-list__icon" aria-hidden="true"><ds-icon name="${icon}" size="100%"></ds-icon></span>`
      : '';
    /* Clickable item: an `href` renders the text as a ds-text-link (secondary,
       underline-on-hover). Items without an href stay plain text — mixed lists work.
       `_blank` targets get rel="noopener". href is a raw field → escaped here. */
    let text = item.html;
    if (item.href) {
      const href = escapeHtml(String(item.href));
      const target = item.target ? ` target="${escapeHtml(String(item.target))}"` : '';
      const rel = item.target === '_blank' ? ' rel="noopener"' : '';
      /* List size maps 1:1 to text-link size (12/14/16), so the link matches the
         row's text size. No underline (not even on hover) — the secondary color +
         hover/focus states carry the affordance. */
      const linkSize = enumAttr(this, 'size', SIZES, 'small');
      text = `<ds-text-link class="ds-list__link" variant="secondary" size="${linkSize}" underline="none" href="${href}"${target}${rel}>${item.html}</ds-text-link>`;
    }
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
