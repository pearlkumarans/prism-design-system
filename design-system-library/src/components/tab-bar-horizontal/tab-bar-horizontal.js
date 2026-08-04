/* =============================================================================
   <ds-tab-bar-horizontal type="fill|underline" active-id="overview" rtl>
   </ds-tab-bar-horizontal>

   Items via property:
     el.items = [
       { id: 'overview', label: 'Overview',  icon: 'home' },
       { id: 'activity', label: 'Activity',  icon: 'activity', badge: '12' },
       { id: 'members',  label: 'Members',   icon: 'mail-user' },
       { id: 'settings', label: 'Settings',  icon: 'file-setting', disabled: true },
     ];

   Events:
     - ds-tab-change   detail: { id, item }   on tab activation
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
/* The overflow pager reuses <ds-icon-button> — import it so the bar is
   self-contained (the host page need not pre-register it). */
import '../icon-button/icon-button.js';

/* Auto-load icon-button.css once (light-DOM). Idempotent. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-tab-bar-horizontal-icon-button-css', '../icon-button/icon-button.css');

const TYPES = ['fill', 'underline'];

let _uid = 0;

export class DsTabBarHorizontal extends HTMLElement {
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
    /* Selection just glides the indicator to the new tab — no rebuild, so the
       underline/fill can slide across. Everything else rebuilds. */
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

    this._type = type;
    this._root.className = `ds-tab-bar-horizontal ds-tab-bar-horizontal--${type}`;
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const ariaLabel = this.getAttribute('aria-label');
    const ariaLabelledBy = this.getAttribute('aria-labelledby');

    /* Tabs live in a horizontally-scrolling tablist track; the indicator sits
       inside it so it scrolls with the tabs on overflow. The 1px baseline is on
       the outer container (full container width). */
    /* Trailing-edge pager (prev/next). Keyboard users page with arrow keys, so
       these are aria-hidden / tabindex -1 — a pointer-only convenience that
       mirrors the Figma "Show Overflow Fade" affordance. Shown via CSS only
       when the row overflows; each button's disabled state tracks scroll pos. */
    this._root.innerHTML =
      `<div class="ds-tab-bar-horizontal__scroller" role="tablist" aria-orientation="horizontal"
            ${ariaLabel ? `aria-label="${ariaLabel}"` : ''} ${ariaLabelledBy ? `aria-labelledby="${ariaLabelledBy}"` : ''}>
         <span class="ds-tab-bar-horizontal__indicator" aria-hidden="true"></span>
         ${this._items.map((it, idx) => this._renderItem(it, idx, activeId, rtl)).join('')}
       </div>
       <div class="ds-tab-bar-horizontal__pagination" aria-hidden="true">
         <ds-icon-button data-page="prev" shape="circle" type="tertiary-grey" size="small"
                         icon="${rtl ? 'chevron-right' : 'chevron-left'}" label="Scroll to previous tabs" no-tooltip tabindex="-1"></ds-icon-button>
         <ds-icon-button data-page="next" shape="circle" type="tertiary-grey" size="small"
                         icon="${rtl ? 'chevron-left' : 'chevron-right'}" label="Scroll to more tabs" no-tooltip tabindex="-1"></ds-icon-button>
       </div>`;
    this._scroller = this._root.querySelector('.ds-tab-bar-horizontal__scroller');
    this._indicator = this._root.querySelector('.ds-tab-bar-horizontal__indicator');
    this._pagination = this._root.querySelector('.ds-tab-bar-horizontal__pagination');
    this._prevBtn = this._root.querySelector('[data-page="prev"]');
    this._nextBtn = this._root.querySelector('[data-page="next"]');
    this._prevBtn?.addEventListener('click', () => this._page('prev'));
    this._nextBtn?.addEventListener('click', () => this._page('next'));
    /* Recompute fade/pager state as the row scrolls (passive — read-only). */
    this._scroller.addEventListener('scroll', () => this._updateOverflow(), { passive: true });

    this._wire();
    this._syncActive(false);   /* snap the indicator under the active tab */

    if (!this._ro && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => {
        this._updateOverflow();          /* fade/pager track width changes */
        if (this._animating) return;     /* don't snap the indicator mid-slide */
        this._positionIndicator(this._activeBtn, false);
      });
    }
    /* Re-observe the current scroller (rebuilt each render). */
    if (this._ro) { this._ro.disconnect(); this._ro.observe(this._scroller); }
    this._updateOverflow();              /* initial fade/pager state */
  }

  /* Toggle the overflow affordances from scroll position: data-overflow when
     the row exceeds its width at all; -start / -end when content is hidden on
     that logical edge. The pager buttons disable at their respective ends. */
  _updateOverflow() {
    const s = this._scroller;
    if (!s) return;
    const rtl = boolAttr(this, 'rtl');
    const max = s.scrollWidth - s.clientWidth;
    const overflowing = max > 1;
    /* scrollLeft is negative in RTL on modern engines — normalise to a 0..max
       distance-from-leading-edge so the same logic drives both directions. */
    const fromStart = rtl ? Math.abs(s.scrollLeft) : s.scrollLeft;
    const atStart = fromStart <= 1;
    const atEnd = fromStart >= max - 1;

    this._root.toggleAttribute('data-overflow', overflowing);
    this._root.toggleAttribute('data-overflow-start', overflowing && !atStart);
    this._root.toggleAttribute('data-overflow-end', overflowing && !atEnd);

    const setDisabled = (btn, val) => {
      if (btn && btn.hasAttribute('disabled') !== val) btn.toggleAttribute('disabled', val);
    };
    setDisabled(this._prevBtn, !overflowing || atStart);
    setDisabled(this._nextBtn, !overflowing || atEnd);
  }

  /* Page the row by ~80% of the viewport toward prev/next (reading direction).
     In RTL the scroll axis is mirrored, so flip the delta sign. */
  _page(dir) {
    const s = this._scroller;
    if (!s) return;
    const rtl = boolAttr(this, 'rtl');
    const amount = s.clientWidth * 0.8;
    const delta = (dir === 'next' ? 1 : -1) * (rtl ? -1 : 1) * amount;
    s.scrollBy({ left: delta, behavior: 'smooth' });
  }

  /* Toggle active state on the tabs + glide the indicator to the active one.
     animate=false snaps (initial / resize). */
  _syncActive(animate) {
    if (!this._mounted || !this._root) return;
    const activeId = this.activeId;
    let active = null;
    this._root.querySelectorAll('.ds-tab-bar-horizontal__item').forEach((btn, i) => {
      const isActive = String(btn.dataset.id) === String(activeId) || (!activeId && i === 0);
      btn.classList.toggle('ds-tab-bar-horizontal__item--active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.tabIndex = (isActive && !btn.disabled) ? 0 : -1;
      if (isActive) active = btn;
    });
    this._activeBtn = active;
    this._positionIndicator(active, animate);
    if (animate) this._scrollIntoView(active);   /* keep the picked tab visible on overflow */
  }

  /* Position the indicator over a tab. Underline → a 2px bar pinned to the tab's
     bottom edge (rounded top); Fill → the full tab box. offsetLeft is relative
     to the scroller, so the bar scrolls with the tabs. */
  _positionIndicator(btn, animate) {
    const ind = this._indicator;
    if (!ind) return;
    if (!btn) { ind.style.opacity = '0'; return; }
    if (!animate) ind.style.transition = 'none';
    ind.style.opacity = '1';
    ind.style.left = `${btn.offsetLeft}px`;
    ind.style.width = `${btn.offsetWidth}px`;
    if (this._type === 'underline') {
      ind.style.top = `${btn.offsetTop + btn.offsetHeight - 2}px`;
      ind.style.height = '2px';
    } else {
      ind.style.top = `${btn.offsetTop}px`;
      ind.style.height = `${btn.offsetHeight}px`;
    }
    if (!animate) {
      void ind.offsetWidth;
      ind.style.transition = '';
    } else {
      this._animating = true;
      clearTimeout(this._animTimer);
      this._animTimer = setTimeout(() => { this._animating = false; }, 260);
    }
  }

  /* Scroll the active tab fully into the scroller's viewport (overflow). The
     pager overlays the trailing edge while overflowing, so reserve its width on
     that side — otherwise a trailing active tab lands hidden behind the
     chevrons. The pager pins to inset-inline-end: the right in LTR, left in RTL. */
  _scrollIntoView(btn) {
    const s = this._scroller;
    if (!s || !btn) return;
    const gap = 8;
    const overlap = (this._root.hasAttribute('data-overflow') && this._pagination)
      ? this._pagination.offsetWidth + gap : gap;
    const rtl = boolAttr(this, 'rtl');
    const startPad = rtl ? overlap : gap;   /* leading edge (physical left)  */
    const endPad   = rtl ? gap : overlap;    /* trailing edge (physical right) */
    const left = btn.offsetLeft;
    const right = left + btn.offsetWidth;
    if (left < s.scrollLeft + startPad) s.scrollLeft = left - startPad;
    else if (right > s.scrollLeft + s.clientWidth - endPad) s.scrollLeft = right - s.clientWidth + endPad;
  }

  _renderItem(item, idx, activeId, rtl) {
    const isActive = String(item.id) === String(activeId)
      || (!activeId && idx === 0);
    const isDisabled = !!item.disabled;
    const id = `ds-tbh-${this._uid}-${idx}`;
    const label = (rtl && item.labelRtl) ? item.labelRtl : (item.label ?? '');

    const iconHTML = item.icon
      ? `<span class="ds-tab-bar-horizontal__item-icon" aria-hidden="true">
           <ds-icon name="${item.icon}" size="20"></ds-icon>
         </span>`
      : '';

    let badgeHTML = '';
    if (item.badge != null && item.badge !== false) {
      const isObj = typeof item.badge === 'object';
      const badgeText = isObj ? (item.badge.text != null ? String(item.badge.text) : '') : String(item.badge);
      const badgeVariant = isObj && item.badge.variant ? item.badge.variant : 'subtle';
      const badgeState   = isObj && item.badge.state   ? item.badge.state   : 'default';
      badgeHTML = `<span class="ds-tab-bar-horizontal__item-badge"><ds-badge variant="${badgeVariant}" state="${badgeState}" size="small">${badgeText}</ds-badge></span>`;
    }

    const cls = [
      'ds-tab-bar-horizontal__item',
      isActive ? 'ds-tab-bar-horizontal__item--active' : '',
      isDisabled ? 'ds-tab-bar-horizontal__item--disabled' : '',
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
              <span class="ds-tab-bar-horizontal__item-label" data-label="${String(label).replace(/"/g, '&quot;')}"><span>${label}</span></span>
              ${badgeHTML}
            </button>`;
  }

  _wire() {
    this._root.querySelectorAll('.ds-tab-bar-horizontal__item').forEach((btn) => {
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
    /* Horizontal tablist: ←/→ move selection (RTL flips them), Home/End jump,
       Enter/Space activate. ↑/↓ are intentionally no-ops per ARIA. */
    const focusable = [];
    this._items.forEach((it, i) => {
      if (!it.disabled) focusable.push(i);
    });
    if (!focusable.length) return;

    const rtl = boolAttr(this, 'rtl');
    const at = focusable.indexOf(currentIdx);
    let nextIdx = null;

    /* In RTL, ArrowRight visually moves toward earlier items; flip. */
    const KEY_NEXT = rtl ? 'ArrowLeft'  : 'ArrowRight';
    const KEY_PREV = rtl ? 'ArrowRight' : 'ArrowLeft';

    if (e.key === KEY_NEXT) {
      e.preventDefault();
      nextIdx = focusable[(at + 1) % focusable.length];
    } else if (e.key === KEY_PREV) {
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

if (typeof customElements !== 'undefined' && !customElements.get('ds-tab-bar-horizontal')) {
  customElements.define('ds-tab-bar-horizontal', DsTabBarHorizontal);
}
