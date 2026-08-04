/* =============================================================================
   <ds-sidebar-l1 collapsed rtl></ds-sidebar-l1>

   Items configured via the `items` property:

     sidebar.items = [
       { id: 'home',   label: 'Home',     icon: 'home',          active: true },
       { id: 'devices',label: 'Devices',  icon: 'laptop' },
       { id: 'reports',label: 'Reports',  icon: 'file-report',   disabled: true },
       { id: 'add',    label: 'Add',      icon: 'add',           state: 'add' },
     ];
     sidebar.bottomItems = [
       { id: 'help', label: 'Help', icon: 'info-circle' },
     ];

   The collapse toggle is rendered automatically as the last bottom item.

   Events:
     - ds-sidebar-l1-select   detail: { id, item }
     - ds-sidebar-l1-toggle   detail: { collapsed }
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
/* Collapsed (icon-only) items reveal their label via the shared <ds-tooltip>. */
import '../tooltip/tooltip.js';

/* Auto-load tooltip.css once (light-DOM, so the stylesheet must be present even
   on pages that load sidebar-l1.css individually). Idempotent. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-sidebar-l1-tooltip-css', '../tooltip/tooltip.css');

export class DsSidebarL1 extends HTMLElement {
  static get observedAttributes() { return ['collapsed', 'rtl', 'show-collapse']; }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items; delete this.items; this._pendingItems = v;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'bottomItems')) {
      const v = this.bottomItems; delete this.bottomItems; this._pendingBottom = v;
    }
    this._items = [];
    this._bottom = [];
  }

  connectedCallback() {
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('nav');
      this._root.className = 'ds-sidebar-l1';
      this._root.setAttribute('aria-label', this.getAttribute('aria-label') || 'Main navigation');
      this.appendChild(this._root);
    }
    if (this._pendingItems !== undefined) { this.items = this._pendingItems; this._pendingItems = undefined; }
    if (this._pendingBottom !== undefined) { this.bottomItems = this._pendingBottom; this._pendingBottom = undefined; }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  disconnectedCallback() { this._ro?.disconnect(); }

  get items() { return this._items; }
  set items(v) { this._items = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  get bottomItems() { return this._bottom; }
  set bottomItems(v) { this._bottom = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  get collapsed() { return boolAttr(this, 'collapsed'); }
  set collapsed(v) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }

  _render() {
    const collapsed = boolAttr(this, 'collapsed');
    const rtl = boolAttr(this, 'rtl');
    this._root.className = 'ds-sidebar-l1' + (collapsed ? ' ds-sidebar-l1--collapsed' : '');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const renderItem = (it) => {
      const tag = it.disabled ? 'button' : (it.href ? 'a' : 'button');
      const stateClass = it.active ? ' ds-sidebar-l1__item--active' : (it.state === 'add' ? ' ds-sidebar-l1__item--add' : '');
      const ariaDisabled = it.disabled ? 'aria-disabled="true" tabindex="-1"' : '';
      const ariaCurrent = it.active ? 'aria-current="page"' : '';
      const href = it.href ? `href="${it.href}"` : '';
      const ariaLabel = `aria-label="${it.label || ''}"`;
      const iconHTML = it.icon ? `<ds-icon name="${it.icon}" size="20"></ds-icon>` : '';
      const labelStr = it.label || '';
      /* Single word → stays on one line and truncates with an ellipsis (never
         splits a word); multi-word wraps to 2 lines (see CSS). */
      const singleWord = labelStr.trim() !== '' && !/\s/.test(labelStr.trim());
      const labelCls = `ds-sidebar-l1__label${singleWord ? ' ds-sidebar-l1__label--single' : ''}`;
      const itemHTML = `<${tag} class="ds-sidebar-l1__item${stateClass}" data-id="${it.id ?? ''}" ${href} ${ariaDisabled} ${ariaCurrent} ${ariaLabel}>
          <span class="ds-sidebar-l1__icon-wrap" aria-hidden="true">${iconHTML}</span>
          <span class="${labelCls}" data-label="${labelStr.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"><span class="ds-sidebar-l1__label-text">${labelStr}</span></span>
        </${tag}>`;
      /* Collapsed = icon only → wrap in a ds-tooltip so the menu name shows on
         hover/focus (to the right of the rail). Expanded shows the label, no tip. */
      const body = collapsed
        ? `<ds-tooltip class="ds-sidebar-l1__tip" text="${(it.label || '').replace(/"/g, '&quot;')}" show-icon="false" position="right">${itemHTML}</ds-tooltip>`
        : itemHTML;
      return `<li>${body}</li>`;
    };

    const listHTML = `<ul class="ds-sidebar-l1__list" role="list">${this._items.map(renderItem).join('')}</ul>`;

    /* Bottom collapse toggle is OFF by default — opt in with `show-collapse`. */
    const showCollapse = boolAttr(this, 'show-collapse');
    const toggleItem = {
      id: '__toggle__',
      label: collapsed ? 'Expand' : 'Collapse',
      icon: collapsed ? 'left-pane-show' : 'left-pane-hide',
    };
    const bottomItemsHTML = this._bottom.map(renderItem).join('');
    const bottomHTML = bottomItemsHTML
      ? `<ul class="ds-sidebar-l1__bottom" role="list">${bottomItemsHTML}</ul>`
      : '';
    const toggleHTML = showCollapse
      ? `<ul class="ds-sidebar-l1__toggle-row" role="list">${renderItem(toggleItem)}</ul>`
      : '';

    /* Sliding active chip — a rounded square behind the active item's icon
       that glides vertically between items on select instead of snapping. */
    this._root.innerHTML =
      '<span class="ds-sidebar-l1__indicator" aria-hidden="true"></span>'
      + listHTML + bottomHTML + toggleHTML;
    this._indicator = this._root.querySelector('.ds-sidebar-l1__indicator');
    this._wire();
    this._positionActiveIndicator(false);   /* snap onto the active icon */
    this._syncLabelTooltips();               /* add a hover title to any cut label */

    if (!this._ro && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => {
        this._syncLabelTooltips();           /* recheck truncation as width changes */
        if (this._animating) return;
        this._positionActiveIndicator(false);
      });
      this._ro.observe(this._root);
    }
  }

  /* Surface the full name as a native tooltip ONLY when the label is actually
     truncated (single-word ellipsis or multi-word 2-line clamp). Hidden labels
     (collapsed rail) measure 0 → no title; the collapsed items already carry a
     ds-tooltip. */
  _syncLabelTooltips() {
    this._root.querySelectorAll('.ds-sidebar-l1__label').forEach((lbl) => {
      const txt = lbl.querySelector('.ds-sidebar-l1__label-text');
      if (!txt) return;
      const cut = txt.scrollWidth > txt.clientWidth + 1 || lbl.scrollHeight > lbl.clientHeight + 1;
      if (cut) lbl.setAttribute('title', txt.textContent);
      else lbl.removeAttribute('title');
    });
  }

  /* Glide the chip over the active item's icon-wrap. getBoundingClientRect
     handles the nested icon-wrap (offsetParent is the item, not the root). */
  _positionActiveIndicator(animate) {
    const ind = this._indicator;
    if (!ind) return;
    const active = this._root.querySelector('.ds-sidebar-l1__list .ds-sidebar-l1__item--active');
    const wrap = active?.querySelector('.ds-sidebar-l1__icon-wrap');
    if (!wrap || active.offsetParent === null) { ind.style.opacity = '0'; return; }
    const wr = wrap.getBoundingClientRect();
    const rr = this._root.getBoundingClientRect();
    if (!animate) ind.style.transition = 'none';
    ind.style.opacity = '1';
    ind.style.left = `${wr.left - rr.left + this._root.scrollLeft}px`;
    ind.style.top = `${wr.top - rr.top + this._root.scrollTop}px`;
    ind.style.width = `${wr.width}px`;
    ind.style.height = `${wr.height}px`;
    if (!animate) {
      void ind.offsetWidth;
      ind.style.transition = '';
    } else {
      this._animating = true;
      clearTimeout(this._animTimer);
      this._animTimer = setTimeout(() => { this._animating = false; }, 260);
    }
  }

  _wire() {
    this._root.querySelectorAll('.ds-sidebar-l1__item').forEach((el) => {
      const id = el.dataset.id;
      el.addEventListener('click', (e) => {
        if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
        if (id === '__toggle__') {
          this.collapsed = !this.collapsed;
          this.dispatchEvent(new CustomEvent('ds-sidebar-l1-toggle', { bubbles: true, detail: { collapsed: this.collapsed } }));
          return;
        }
        const item = this._items.find((i) => i.id === id);
        if (!item) return;
        // Update active state locally so the UI reflects the click immediately.
        this._items.forEach((i) => { i.active = (i === item); });
        /* Lightweight (no rebuild) so the chip can glide: toggle the active
           class on the main-list items, then slide the indicator. */
        this._root.querySelectorAll('.ds-sidebar-l1__list .ds-sidebar-l1__item').forEach((node) => {
          const isAct = node === el;
          node.classList.toggle('ds-sidebar-l1__item--active', isAct);
          if (isAct) node.setAttribute('aria-current', 'page');
          else node.removeAttribute('aria-current');
        });
        this._positionActiveIndicator(true);
        this.dispatchEvent(new CustomEvent('ds-sidebar-l1-select', { bubbles: true, detail: { id, item } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-sidebar-l1')) {
  customElements.define('ds-sidebar-l1', DsSidebarL1);
}
