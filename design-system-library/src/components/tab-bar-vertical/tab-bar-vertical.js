/* =============================================================================
   <ds-tab-bar-vertical type="fill|underline" active-id="general" rtl>
   </ds-tab-bar-vertical>

   Items via property:
     el.items = [
       { id: 'general',  label: 'General',       icon: 'config' },
       { id: 'notify',   label: 'Notifications', icon: 'bell',   badge: '12' },
       { id: 'security', label: 'Security',      icon: 'shield', disabled: true },
     ];

   Events:
     - ds-tab-change   detail: { id, item }   on row activation
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';

const TYPES = ['fill', 'underline'];

let _uid = 0;

export class DsTabBarVertical extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'rtl', 'active-id', 'aria-label', 'aria-labelledby'];
  }

  constructor() {
    super();
    this._uid = ++_uid;
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items;
      delete this.items;
      this._pendingItems = v;
    }
    this._items = [];
  }

  connectedCallback() {
    if (!this._mounted) {
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
      this._mounted = true;
    }
    if (this._pendingItems !== undefined) {
      this.items = this._pendingItems;
      this._pendingItems = undefined;
    }
    this._render();
  }

  attributeChangedCallback(name) {
    if (!this._mounted) return;
    /* Selection just glides the indicator (bar / card) to the new tab — no
       rebuild. Everything else rebuilds. */
    if (name === 'active-id') this._syncActive(true);
    else this._render();
  }

  disconnectedCallback() { this._ro?.disconnect(); }

  // ---- Public API ---------------------------------------------------------
  get items() { return this._items; }
  set items(v) {
    this._items = Array.isArray(v) ? v.slice() : [];
    if (this._mounted) this._render();
  }

  get activeId() { return this.getAttribute('active-id') || (this._items[0] && this._items[0].id) || ''; }
  set activeId(v) {
    if (v == null || v === '') this.removeAttribute('active-id');
    else this.setAttribute('active-id', String(v));
  }

  // ---- Render -------------------------------------------------------------
  _render() {
    const type = enumAttr(this, 'type', TYPES, 'underline');
    const rtl = boolAttr(this, 'rtl');
    const activeId = this.activeId;

    const cls = `ds-tab-bar-vertical ds-tab-bar-vertical--${type}`;
    this._root.className = cls;
    this._root.setAttribute('role', 'tablist');
    this._root.setAttribute('aria-orientation', 'vertical');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    /* Mirror aria-label / aria-labelledby from host onto the inner tablist
       so screen readers announce the bar correctly. */
    const ariaLabel = this.getAttribute('aria-label');
    const ariaLabelledBy = this.getAttribute('aria-labelledby');
    if (ariaLabel) this._root.setAttribute('aria-label', ariaLabel);
    else this._root.removeAttribute('aria-label');
    if (ariaLabelledBy) this._root.setAttribute('aria-labelledby', ariaLabelledBy);
    else this._root.removeAttribute('aria-labelledby');

    /* One sliding indicator (underline bar / fill card) behind the rows; it
       glides vertically to the active tab on selection instead of snapping. */
    this._root.innerHTML =
      '<span class="ds-tab-bar-vertical__indicator" aria-hidden="true"></span>'
      + this._items.map((it, idx) => this._renderItem(it, idx, activeId, rtl)).join('');
    this._indicator = this._root.querySelector('.ds-tab-bar-vertical__indicator');

    this._wire();
    this._syncActive(false);   /* snap the indicator onto the active tab */

    if (!this._ro && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => {
        if (this._animating) return;
        this._positionIndicator(this._activeBtn, false);
      });
      this._ro.observe(this._root);
    }
  }

  /* Toggle active state + glide the indicator vertically to the active tab.
     animate=false snaps (initial / resize). */
  _syncActive(animate) {
    if (!this._mounted || !this._root) return;
    const activeId = this.activeId;
    let active = null;
    this._root.querySelectorAll('.ds-tab-bar-vertical__item').forEach((btn, i) => {
      const isActive = String(btn.dataset.id) === String(activeId) || (!activeId && i === 0);
      btn.classList.toggle('ds-tab-bar-vertical__item--active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.tabIndex = (isActive && !btn.disabled) ? 0 : -1;
      if (isActive) active = btn;
    });
    this._activeBtn = active;
    this._positionIndicator(active, animate);
  }

  /* Vertical: only top + height change between tabs (all rows share width/x).
     The bar's width / leading-edge x and the fill card's box come from CSS. */
  _positionIndicator(btn, animate) {
    const ind = this._indicator;
    if (!ind) return;
    if (!btn) { ind.style.opacity = '0'; return; }
    if (!animate) ind.style.transition = 'none';
    ind.style.opacity = '1';
    ind.style.top = `${btn.offsetTop}px`;
    ind.style.height = `${btn.offsetHeight}px`;
    if (!animate) {
      void ind.offsetWidth;
      ind.style.transition = '';
    } else {
      this._animating = true;
      clearTimeout(this._animTimer);
      this._animTimer = setTimeout(() => { this._animating = false; }, 260);
    }
  }

  _renderItem(item, idx, activeId, rtl) {
    const isActive = String(item.id) === String(activeId)
      || (!activeId && idx === 0);
    const isDisabled = !!item.disabled;
    const id = `ds-tbv-${this._uid}-${idx}`;
    const label = (rtl && item.labelRtl) ? item.labelRtl : (item.label ?? '');

    const iconHTML = item.icon
      ? `<span class="ds-tab-bar-vertical__item-icon" aria-hidden="true">
           <ds-icon name="${item.icon}" size="20"></ds-icon>
         </span>`
      : '';

    let badgeHTML = '';
    if (item.badge != null && item.badge !== false) {
      const badgeText = typeof item.badge === 'object' ? '' : String(item.badge);
      badgeHTML = `<span class="ds-tab-bar-vertical__item-badge"><ds-badge variant="subtle" state="default" size="small">${badgeText}</ds-badge></span>`;
    }

    const cls = [
      'ds-tab-bar-vertical__item',
      isActive ? 'ds-tab-bar-vertical__item--active' : '',
      isDisabled ? 'ds-tab-bar-vertical__item--disabled' : '',
    ].filter(Boolean).join(' ');

    return `<button
              type="button"
              role="tab"
              id="${id}"
              class="${cls}"
              ${item.panelId ? `aria-controls="${item.panelId}"` : ''}
              aria-selected="${isActive ? 'true' : 'false'}"
              ${isDisabled ? 'aria-disabled="true" disabled' : ''}
              tabindex="${isActive && !isDisabled ? 0 : -1}"
              data-id="${item.id}"
              data-index="${idx}">
              ${iconHTML}
              <span class="ds-tab-bar-vertical__item-label">${label}</span>
              ${badgeHTML}
            </button>`;
  }

  _wire() {
    this._root.querySelectorAll('.ds-tab-bar-vertical__item').forEach((btn) => {
      const idx = Number(btn.dataset.index);
      const item = this._items[idx];
      if (!item || item.disabled) return;

      btn.addEventListener('click', () => this._activate(item, btn));
      btn.addEventListener('keydown', (e) => this._onKeydown(e, idx));
    });
  }

  _activate(item, btn) {
    if (!item || item.disabled) return;
    if (String(this.activeId) === String(item.id)) return;
    this.activeId = item.id;
    /* Restore focus on the newly active row so keyboard users keep the
       tab stop correctly placed after a click. */
    requestAnimationFrame(() => {
      const next = this._root.querySelector(`[data-id="${item.id}"]`);
      next?.focus?.();
    });
    this.dispatchEvent(new CustomEvent('ds-tab-change', {
      bubbles: true,
      detail: { id: item.id, item },
    }));
  }

  _onKeydown(e, currentIdx) {
    /* Vertical tablist: ↑/↓ move selection, Home/End jump to ends, Enter/Space
       activate. ←/→ are intentionally no-ops per ARIA. */
    const focusable = [];
    this._items.forEach((it, i) => {
      if (!it.disabled) focusable.push(i);
    });
    if (!focusable.length) return;

    const at = focusable.indexOf(currentIdx);
    let nextIdx = null;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIdx = focusable[(at + 1) % focusable.length];
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nextIdx = focusable[(at - 1 + focusable.length) % focusable.length];
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = focusable[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = focusable[focusable.length - 1];
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const item = this._items[currentIdx];
      const btn = this._root.querySelector(`[data-index="${currentIdx}"]`);
      this._activate(item, btn);
      return;
    }

    if (nextIdx == null) return;
    const item = this._items[nextIdx];
    this._activate(item, this._root.querySelector(`[data-index="${nextIdx}"]`));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-tab-bar-vertical')) {
  customElements.define('ds-tab-bar-vertical', DsTabBarVertical);
}
