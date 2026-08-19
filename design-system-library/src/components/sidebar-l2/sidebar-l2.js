/* =============================================================================
   <ds-sidebar-l2 title="Settings Home" show-back rtl></ds-sidebar-l2>

   Groups + items configured via the `groups` property:

     sidebar.groups = [
       {
         id: 'global', label: 'Global Settings', expanded: true,
         items: [
           { id: 'group',   label: 'Custom Group' },
           { id: 'patches', label: 'Installed Patches', count: 81 },
           { id: 'cfg',     label: 'Configuration', sub: true, active: true },
         ],
       },
       { id: 'admin', label: 'User Administration', expanded: true, items: [...] },
     ];

   Events:
     - ds-sidebar-l2-select  detail: { groupId, item }
     - ds-sidebar-l2-toggle  detail: { groupId, expanded }
     - ds-sidebar-l2-back
     - ds-sidebar-l2-search  detail: { query }
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
import { escapeHtml } from '../../utils/escape.js';
/* Truncated item labels reveal their full text via the shared <ds-tooltip>;
   the back/collapse control reuses the shared <ds-icon-button>. */
import '../tooltip/tooltip.js';
import '../icon-button/icon-button.js';

function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-sidebar-l2-tooltip-css', '../tooltip/tooltip.css');
_injectCss('ds-sidebar-l2-icon-button-css', '../icon-button/icon-button.css');

export class DsSidebarL2 extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'show-back', 'show-search', 'search-placeholder', 'rtl', 'variant', 'collapse-toggle', 'collapsed'];
  }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, 'groups')) {
      const v = this.groups; delete this.groups; this._pending = v;
    }
    this._groups = [];
    this._query = '';
  }

  connectedCallback() {
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('nav');
      this._root.className = 'ds-sidebar-l2';
      this.appendChild(this._root);
    }
    if (this._pending !== undefined) { this.groups = this._pending; this._pending = undefined; }
    this._render();
    this._syncCollapseToggle();
  }

  attributeChangedCallback(name) {
    if (!this._root) return;
    /* `collapsed` only flips the toggle icon + CSS state — no full re-render. */
    if (name === 'collapsed') { this._syncCollapseToggle(); return; }
    this._render();
    this._syncCollapseToggle();
  }

  disconnectedCallback() { this._ro?.disconnect(); }

  get groups() { return this._groups; }
  set groups(v) { this._groups = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  get collapsed() { return boolAttr(this, 'collapsed'); }
  set collapsed(v) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }

  /* Hide/show toggle (enable via `collapse-toggle`) — a floating control on the
     L2 inner edge that collapses ONLY the sub-nav. It lives on the host (sibling
     of the nav) so it stays visible when the panel is 0-width; clicking toggles
     the `collapsed` attribute + fires `ds-sidebar-l2-collapse`. */
  _syncCollapseToggle() {
    const enabled = boolAttr(this, 'collapse-toggle');
    if (!enabled) { if (this._collapseBtn) this._collapseBtn.style.display = 'none'; return; }
    if (!this._collapseBtn) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ds-sidebar-l2__collapse';
      btn.innerHTML = '<ds-icon size="16"></ds-icon>';
      btn.addEventListener('click', () => {
        const next = !boolAttr(this, 'collapsed');
        this.collapsed = next;
        this.dispatchEvent(new CustomEvent('ds-sidebar-l2-collapse', { bubbles: true, detail: { collapsed: next } }));
      });
      this.appendChild(btn);
      this._collapseBtn = btn;
    }
    this._collapseBtn.style.display = '';
    const collapsed = boolAttr(this, 'collapsed');
    const rtl = boolAttr(this, 'rtl');
    /* Same chevron for both states — the --flip class (below) mirrors it so it
       points IN to HIDE (expanded) and OUT to SHOW (collapsed). */
    this._collapseBtn.querySelector('ds-icon')?.setAttribute('name', 'chevron-left');
    /* Mirror for the show state and for RTL (XOR) so it always points the right way. */
    this._collapseBtn.classList.toggle('ds-sidebar-l2__collapse--flip', collapsed !== rtl);
    this._collapseBtn.setAttribute('aria-label', collapsed ? 'Show sub-menu' : 'Hide sub-menu');
    this._collapseBtn.setAttribute('aria-expanded', String(!collapsed));
  }

  _render() {
    const title = this.getAttribute('title') || '';
    const showBack = boolAttr(this, 'show-back');
    const showSearch = !this.hasAttribute('show-search') || this.getAttribute('show-search') !== 'false';
    const placeholder = this.getAttribute('search-placeholder') || 'Search...';
    const rtl = boolAttr(this, 'rtl');
    /* The back+title header is a settings sub-navigation pattern only. A standard
       module L2 (per spec) is search + groups — its context comes from L1, so it
       has no title/back. Gate the header behind variant="settings". */
    const isSettings = this.getAttribute('variant') === 'settings';

    this._root.setAttribute('aria-label', title || 'Section navigation');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const headerHTML = (isSettings && (showBack || title))
      ? `<div class="ds-sidebar-l2__header">
           ${showBack ? `<ds-icon-button class="ds-sidebar-l2__back" shape="square" type="tertiary-grey" size="small" icon="${rtl ? 'chevron-right' : 'chevron-left'}" label="Back" no-tooltip data-back></ds-icon-button>` : ''}
           ${title ? `<h2 class="ds-sidebar-l2__title">${title}</h2>` : ''}
         </div>`
      : '';

    const searchHTML = showSearch
      ? `<div class="ds-sidebar-l2__search">
           <span class="ds-sidebar-l2__search-icon" aria-hidden="true"><ds-icon name="search" size="16"></ds-icon></span>
           <input type="search" placeholder="${placeholder}" aria-label="Search navigation" data-search value="${this._query.replace(/"/g, '&quot;')}" />
         </div>`
      : '';

    const q = this._query.toLowerCase().trim();
    const renderItem = (groupId, it) => {
      const matches = !q || (it.label || '').toLowerCase().includes(q);
      if (!matches) return '';
      const disabled = !!it.disabled;
      const tag = (it.href && !disabled) ? 'a' : 'button';
      const href = (it.href && !disabled) ? `href="${escapeHtml(it.href)}"` : '';
      const cls = 'ds-sidebar-l2__item' + (it.active ? ' ds-sidebar-l2__item--active' : '');
      const ariaCurrent = it.active ? 'aria-current="page"' : '';
      const ariaDisabled = disabled ? 'aria-disabled="true" tabindex="-1"' : '';
      /* Optional leading icon (16×16, off by default — Figma: Leading Icon). */
      const leading = it.icon
        ? `<span class="ds-sidebar-l2__item-icon" aria-hidden="true"><ds-icon name="${escapeHtml(it.icon)}" size="16"></ds-icon></span>`
        : '';
      const right = it.newTag
        ? `<span class="ds-sidebar-l2__item-new" aria-label="New" title="New"><ds-icon name="sparkles" size="12"></ds-icon></span>`
        : it.count != null
          ? `<span class="ds-sidebar-l2__item-badge" aria-label="${it.count} ${escapeHtml(it.label)}">${this._fmtCount(it.count)}</span>`
          : (it.sub || it.hasChildren)
            ? `<span class="ds-sidebar-l2__item-chevron" aria-hidden="true"><ds-icon name="chevron-right" size="12"></ds-icon></span>`
            : '';
      return `<li>
        <${tag} class="${cls}" ${href} ${ariaCurrent} ${ariaDisabled} data-group="${escapeHtml(groupId)}" data-item="${escapeHtml(it.id ?? '')}">
          ${leading}
          <span class="ds-sidebar-l2__item-label">${escapeHtml(it.label || '')}</span>
          ${right}
        </${tag}>
      </li>`;
    };

    const treeHTML = `<ul class="ds-sidebar-l2__tree" role="list">${
      this._groups.map((g) => {
        // Standalone item (no children, no expand/collapse)
        if (g.type === 'item') {
          const matches = !q || (g.label || '').toLowerCase().includes(q);
          if (!matches) return '';
          return `<li>${renderItem('__top__', g)}</li>`;
        }
        const expanded = g.expanded !== false;
        const visibleItems = (g.items || []).map((it) => renderItem(g.id, it)).join('');
        // When searching, hide groups that have no matching items.
        if (q && !visibleItems) return '';
        return `<li class="ds-sidebar-l2__group${expanded ? '' : ' ds-sidebar-l2__group--collapsed'}">
          <button class="ds-sidebar-l2__group-header" type="button"
                  aria-expanded="${expanded}" data-group-toggle="${escapeHtml(g.id)}">
            <ds-icon name="chevron-down" size="10"></ds-icon>
            <span>${escapeHtml(g.label || '')}</span>
          </button>
          <ul class="ds-sidebar-l2__items" role="list">${visibleItems}</ul>
        </li>`;
      }).join('')
    }</ul>`;

    /* Sliding active indicator — a filled rect behind the active item that
       glides between items on select instead of the bg snapping. */
    this._root.innerHTML =
      '<span class="ds-sidebar-l2__indicator" aria-hidden="true"></span>'
      + headerHTML + searchHTML + treeHTML;
    this._indicator = this._root.querySelector('.ds-sidebar-l2__indicator');
    this._wire();
    this._positionActiveIndicator(false);   /* snap onto the active item */
    /* Defer truncation measurement to after layout. */
    requestAnimationFrame(() => this._applyTruncationTips());

    if (!this._ro && typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => {
        if (this._animating) return;
        this._positionActiveIndicator(false);
        this._applyTruncationTips();
      });
      this._ro.observe(this._root);
    }
  }

  /* Wrap only TRUNCATED item labels in a text-only <ds-tooltip> so the hidden
     full text surfaces on hover/focus. Non-truncated items get no tooltip (no
     redundant tip on text that's already fully visible). Idempotent. */
  _applyTruncationTips() {
    if (!this._root) return;
    this._root.querySelectorAll('.ds-sidebar-l2__item').forEach((item) => {
      const label = item.querySelector('.ds-sidebar-l2__item-label');
      if (!label) return;
      const wrapped = item.parentElement?.classList?.contains('ds-sidebar-l2__tip');
      const truncated = label.scrollWidth > label.clientWidth + 1;
      if (truncated && !wrapped) {
        const tip = document.createElement('ds-tooltip');
        tip.className = 'ds-sidebar-l2__tip';
        tip.setAttribute('text', (label.textContent || '').trim());
        tip.setAttribute('show-icon', 'false');
        tip.setAttribute('position', 'right');
        item.parentNode.insertBefore(tip, item);
        tip.appendChild(item);
      } else if (!truncated && wrapped) {
        /* No longer truncated (panel widened) — unwrap. */
        const tip = item.parentElement;
        tip.parentNode.insertBefore(item, tip);
        tip.remove();
      } else if (truncated && wrapped) {
        item.parentElement.setAttribute('text', (label.textContent || '').trim());
      }
    });
  }

  /* Position the indicator over the active item's box. getBoundingClientRect
     (relative to the root rect + scroll) is robust against positioned ancestors
     and layout-timing quirks that make offsetTop read 0. Hidden when no active
     item is visible (collapsed group / filtered out). */
  _positionActiveIndicator(animate) {
    const ind = this._indicator;
    if (!ind) return;
    const btn = this._root.querySelector('.ds-sidebar-l2__item--active');
    /* Hide the pill when the active item isn't actually visible. A collapsed
       group uses max-height:0/overflow:hidden (NOT display:none), so the item
       still reports offsetHeight/offsetParent — explicitly check its group. */
    const inCollapsedGroup = btn?.closest('.ds-sidebar-l2__group--collapsed');
    if (!btn || inCollapsedGroup || btn.offsetParent === null || btn.offsetHeight === 0) {
      ind.style.opacity = '0';
      return;
    }
    const br = btn.getBoundingClientRect();
    const rr = this._root.getBoundingClientRect();
    if (!animate) ind.style.transition = 'none';
    ind.style.opacity = '1';
    ind.style.left = `${br.left - rr.left + this._root.scrollLeft}px`;
    ind.style.top = `${br.top - rr.top + this._root.scrollTop}px`;
    ind.style.width = `${br.width}px`;
    ind.style.height = `${br.height}px`;
    if (!animate) {
      void ind.offsetWidth;
      ind.style.transition = '';
    } else {
      this._animating = true;
      clearTimeout(this._animTimer);
      this._animTimer = setTimeout(() => { this._animating = false; }, 260);
    }
  }

  _fmtCount(n) {
    if (n >= 1000000) return Math.round(n / 100000) / 10 + 'M';
    if (n >= 1000) return Math.round(n / 100) / 10 + 'K';
    return String(n);
  }

  _wire() {
    this._root.querySelector('[data-back]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-sidebar-l2-back', { bubbles: true }));
    });
    const search = this._root.querySelector('[data-search]');
    if (search) {
      search.addEventListener('input', (e) => {
        this._query = e.target.value || '';
        this.dispatchEvent(new CustomEvent('ds-sidebar-l2-search', { bubbles: true, detail: { query: this._query } }));
        const focusValue = this._query;
        this._render();
        const next = this._root.querySelector('[data-search]');
        if (next) {
          next.value = focusValue;
          next.focus();
          // restore caret to end
          const len = focusValue.length;
          try { next.setSelectionRange(len, len); } catch {}
        }
      });
      search.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._query) {
          e.preventDefault();
          this._query = '';
          this._render();
          this._root.querySelector('[data-search]')?.focus();
        }
      });
    }
    this._root.querySelectorAll('[data-group-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.groupToggle;
        const group = this._groups.find((g) => g.id === id);
        if (!group) return;
        group.expanded = group.expanded === false ? true : false;
        this._render();
        this.dispatchEvent(new CustomEvent('ds-sidebar-l2-toggle', { bubbles: true, detail: { groupId: id, expanded: group.expanded } }));
      });
    });
    this._root.querySelectorAll('.ds-sidebar-l2__item').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
        const groupId = el.dataset.group;
        const itemId = el.dataset.item;
        let item = null;
        if (groupId === '__top__') {
          item = this._groups.find((g) => g.type === 'item' && g.id === itemId);
        } else {
          const group = this._groups.find((g) => g.id === groupId);
          item = group?.items?.find((i) => i.id === itemId);
        }
        if (!item) return;
        // Clear active across both top-level standalone items and grouped items.
        this._groups.forEach((g) => {
          if (g.type === 'item') g.active = (g === item);
          else g.items?.forEach((i) => { i.active = (i === item); });
        });
        /* Lightweight update (no rebuild) so the indicator can glide: toggle
           the active class on the existing DOM, then slide the indicator. */
        this._root.querySelectorAll('.ds-sidebar-l2__item').forEach((node) => {
          const isAct = node === el;
          node.classList.toggle('ds-sidebar-l2__item--active', isAct);
          if (isAct) node.setAttribute('aria-current', 'page');
          else node.removeAttribute('aria-current');
        });
        this._positionActiveIndicator(true);
        this.dispatchEvent(new CustomEvent('ds-sidebar-l2-select', { bubbles: true, detail: { groupId, item } }));
      });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-sidebar-l2')) {
  customElements.define('ds-sidebar-l2', DsSidebarL2);
}
