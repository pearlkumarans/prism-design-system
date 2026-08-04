/* =============================================================================
   <ds-module-rail icons-only rtl></ds-module-rail>

   Vertical product/module rail for LEFT-navigation layouts — the top tab modules
   relocated to a side rail. Data-driven; captures every state in one component:
     · default (icon + label) / icons-only (narrow → tooltips)
     · solid active chip (theme-aware accent)
     · overflow → bottom "more" (3-dot) button + flyout (keeps ≥80px below it)
     · RTL mirroring · hover chip

   Items configured via the `items` property:

     rail.items = [
       { id: 'home', label: 'Home', icon: 'home', active: true },
       { id: 'inv',  label: 'Inventory', icon: 'layers' },
     ];

   Attributes:
     icons-only   — narrow rail, labels hidden; HOVER expands a menu overlay that
                    reveals each module's text label (no per-icon tooltip in this mode)
     rtl          — mirror (also auto-detected from an ancestor [dir="rtl"])
     more-label   — label/aria for the overflow button (default "More")

   Events:
     ds-module-rail-select   detail: { id, item }
   ============================================================================= */

import { boolAttr } from '../../utils/attr.js';
import '../../icons/icon.js';

/* Auto-load this component's stylesheet once (light-DOM). Idempotent. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-module-rail-css', './module-rail.css');

export class DsModuleRail extends HTMLElement {
  static get observedAttributes() { return ['icons-only', 'rtl', 'more-label']; }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, 'items')) {
      const v = this.items; delete this.items; this._pending = v;
    }
    this._items = [];
    this._overflowIds = [];
    this._onDocClick = this._onDocClick.bind(this);
  }

  connectedCallback() {
    this.classList.add('ds-module-rail');
    if (this._pending !== undefined) { this.items = this._pending; this._pending = undefined; }
    if (!this._wired) {
      this.addEventListener('click', this._onClick.bind(this));
      this.addEventListener('mouseover', this._onOver.bind(this));
      this.addEventListener('mouseout', this._onOut.bind(this));
      /* icons-only hover-expand: entering the rail opens the label menu overlay. */
      this.addEventListener('mouseenter', () => this._openMenu());
      this.addEventListener('mouseleave', () => this._scheduleMenuClose());
      this._wired = true;
    }
    document.addEventListener('click', this._onDocClick);
    if (typeof ResizeObserver !== 'undefined' && !this._ro) {
      this._ro = new ResizeObserver(() => this._reflow());
      this._ro.observe(this);
    }
    this._render();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    this._ro?.disconnect(); this._ro = null;
    this._fly?.remove(); this._fly = null;
    this._tip?.remove(); this._tip = null;
    clearTimeout(this._menuCloseT);
    this._menu?.remove(); this._menu = null;
  }

  attributeChangedCallback() { if (this.isConnected) this._render(); }

  get items() { return this._items; }
  set items(v) { this._items = Array.isArray(v) ? v.slice() : []; if (this.isConnected) this._render(); }

  get iconsOnly() { return boolAttr(this, 'icons-only'); }
  set iconsOnly(v) { v ? this.setAttribute('icons-only', '') : this.removeAttribute('icons-only'); }

  /* ── internals ─────────────────────────────────────────────────────────── */
  _isRtl() {
    return boolAttr(this, 'rtl')
      || this.closest('[dir="rtl"]') != null
      || (typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl');
  }
  _moreLabel() { return this.getAttribute('more-label') || (this._isRtl() ? 'المزيد' : 'More'); }
  _esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  _render() {
    const icons = boolAttr(this, 'icons-only');
    this.classList.toggle('ds-module-rail--icons', icons);
    if (!icons) this._closeMenu();
    const itemsHTML = this._items.map((t) => {
      const active = t.active ? ' ds-module-rail__item--active' : '';
      const ic = t.icon || 'product';
      const single = !/\s/.test(t.label || '');   /* single word → 1-line ellipsis, never split */
      return `<button type="button" class="ds-module-rail__item${active}" data-id="${this._esc(t.id)}" aria-label="${this._esc(t.label)}"${t.active ? ' aria-current="page"' : ''}>`
        + `<ds-icon class="ds-module-rail__ic" name="${this._esc(ic)}" size="20"></ds-icon>`
        + `<span class="ds-module-rail__lbl${single ? ' ds-module-rail__lbl--single' : ''}">${this._esc(t.label)}</span></button>`;
    }).join('');
    this.innerHTML = itemsHTML
      + `<button type="button" class="ds-module-rail__more" data-more aria-label="${this._esc(this._moreLabel())}" aria-haspopup="true" aria-expanded="false"><ds-icon name="more-horizontal" size="20"></ds-icon></button>`;
    requestAnimationFrame(() => this._reflow());
  }

  /* Fold any items that don't fit into the bottom "more" (3-dot) menu, always
     leaving the more button ≥80px above the rail's bottom edge. */
  _reflow() {
    if (!this.isConnected || this.offsetParent === null) return;   /* hidden */
    this._closeFlyout();
    const more = this.querySelector('.ds-module-rail__more');
    const items = [...this.querySelectorAll('.ds-module-rail__item')];
    items.forEach((i) => { i.style.display = ''; });
    if (more) more.style.display = 'none';
    const rect = this.getBoundingClientRect();
    if (!rect.height) return;
    const fitsAll = items.every((it) => it.getBoundingClientRect().bottom <= rect.bottom + 1);
    this._overflowIds = [];
    if (fitsAll) return;
    /* Show the "more" button in normal flow, then hide the items that don't fit
       so it sits continuously right after the last visible icon (no gap). */
    if (more) more.style.display = 'flex';
    const reserve = (more ? more.getBoundingClientRect().height : 38) + 8;
    const limit = rect.bottom - reserve;
    items.forEach((it) => {
      if (it.getBoundingClientRect().bottom > limit) { it.style.display = 'none'; this._overflowIds.push(it.dataset.id); }
    });
    if (more) {
      more.style.display = this._overflowIds.length ? 'flex' : 'none';
      more.classList.toggle('ds-module-rail__more--active', this._activeInOverflow());
    }
  }
  _activeInOverflow() {
    const a = this._items.find((i) => i.active);
    return a ? this._overflowIds.includes(a.id) : false;
  }

  /* Programmatic active change (mirrors a select without firing the event). */
  setActive(id) {
    this._items.forEach((i) => { i.active = (i.id === id); });
    this.querySelectorAll('.ds-module-rail__item').forEach((el) => {
      const on = el.dataset.id === id;
      el.classList.toggle('ds-module-rail__item--active', on);
      if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    const more = this.querySelector('.ds-module-rail__more');
    if (more) more.classList.toggle('ds-module-rail__more--active', this._activeInOverflow());
  }

  /* ── events ────────────────────────────────────────────────────────────── */
  _onClick(e) {
    const more = e.target.closest('.ds-module-rail__more');
    if (more) {
      const open = more.getAttribute('aria-expanded') === 'true';
      if (open) this._closeFlyout(); else this._openFlyout(more);
      return;
    }
    const btn = e.target.closest('.ds-module-rail__item');
    if (!btn) return;
    this._select(btn.dataset.id);
    if (this._tip) this._tip.hidden = true;
  }
  _select(id) {
    const item = this._items.find((i) => i.id === id);
    if (!item) return;
    this.setActive(id);
    this._closeFlyout();
    this._closeMenu();
    this.dispatchEvent(new CustomEvent('ds-module-rail-select', { bubbles: true, detail: { id, item } }));
  }

  /* ── icons-only hover-expand menu ──────────────────────────────────────────
     A body-portaled overlay that sits on top of the collapsed rail and reveals
     every module as an icon + text row. Portaled (like the flyout / tooltip) so
     it never shifts layout or gets clipped by an overflow:hidden ancestor. */
  _scheduleMenuClose() {
    clearTimeout(this._menuCloseT);
    this._menuCloseT = setTimeout(() => this._closeMenu(), 140);
  }
  _closeMenu() {
    clearTimeout(this._menuCloseT);
    this._menu?.classList.remove('ds-module-rail__menu--open');   /* animates back to collapsed */
  }
  _openMenu() {
    if (!this.classList.contains('ds-module-rail--icons') || !this._items.length) return;
    clearTimeout(this._menuCloseT);
    if (this._tip) this._tip.hidden = true;   /* no per-icon tooltip in this mode */
    if (!this._menu) {
      this._menu = document.createElement('div');
      this._menu.className = 'ds-module-rail__menu';
      document.body.appendChild(this._menu);
      this._menu.addEventListener('click', (e) => {
        const it = e.target.closest('.ds-module-rail__menuitem'); if (!it) return;
        this._select(it.dataset.id);
      });
      this._menu.addEventListener('mouseenter', () => clearTimeout(this._menuCloseT));
      this._menu.addEventListener('mouseleave', () => this._scheduleMenuClose());
    }
    const rtl = this._isRtl();
    this._menu.classList.toggle('ds-module-rail__menu--rtl', rtl);
    this._menu.innerHTML = this._items.map((t) => {
      const active = t.active ? ' is-active' : '';
      return `<button type="button" class="ds-module-rail__menuitem${active}" data-id="${this._esc(t.id)}"${t.active ? ' aria-current="page"' : ''}>`
        + `<span class="ds-module-rail__menuic"><ds-icon name="${this._esc(t.icon || 'product')}" size="20"></ds-icon></span>`
        + `<span class="ds-module-rail__menulbl">${this._esc(t.label)}</span></button>`;
    }).join('');
    /* Size to content but never taller than the viewport; anchor to the rail's
       top, nudging up only if the panel would overflow the bottom edge. */
    const vh = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 800;
    const vw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 1200;
    const r = this.getBoundingClientRect();
    /* Anchor the menu to the SAME y as the rail (never nudge up → no jerk, and the
       brand above the rail stays visible). It spans from the rail's top edge to its
       bottom edge, capped to the viewport; any overflow scrolls inside. */
    const top = Math.max(0, r.top);
    this._menu.style.top = top + 'px';
    this._menu.style.height = Math.min(r.height, Math.max(0, vh - top)) + 'px';
    this._menu.style.maxHeight = '';
    this._menu.style.minHeight = '';
    if (rtl) { this._menu.style.right = (vw - r.right) + 'px'; this._menu.style.left = 'auto'; }
    else { this._menu.style.left = r.left + 'px'; this._menu.style.right = 'auto'; }
    /* Add the open class one frame later so the width/opacity transition runs
       from the collapsed (rail-width) state instead of snapping open. */
    const menu = this._menu;
    requestAnimationFrame(() => { if (this.isConnected) menu.classList.add('ds-module-rail__menu--open'); });
  }

  /* ── overflow flyout ───────────────────────────────────────────────────── */
  _closeFlyout() {
    if (this._fly) this._fly.hidden = true;
    const m = this.querySelector('.ds-module-rail__more');
    if (m) m.setAttribute('aria-expanded', 'false');
  }
  _openFlyout(btn) {
    if (!this._fly) {
      this._fly = document.createElement('div');
      this._fly.className = 'ds-module-rail__flyout'; this._fly.hidden = true;
      document.body.appendChild(this._fly);
      this._fly.addEventListener('click', (e) => {
        const it = e.target.closest('.ds-module-rail__flyitem'); if (!it) return;
        this._select(it.dataset.id);
      });
    }
    const list = this._items.filter((t) => this._overflowIds.includes(t.id));
    this._fly.innerHTML = list.map((t) => `<button type="button" class="ds-module-rail__flyitem${t.active ? ' is-active' : ''}" data-id="${this._esc(t.id)}">`
      + `<ds-icon name="${this._esc(t.icon || 'product')}" size="18"></ds-icon><span>${this._esc(t.label)}</span></button>`).join('');
    this._fly.hidden = false;
    const r = btn.getBoundingClientRect();
    this._fly.style.bottom = (window.innerHeight - r.bottom) + 'px';
    this._fly.style.top = 'auto';
    if (this._isRtl()) { this._fly.style.right = (window.innerWidth - r.left + 8) + 'px'; this._fly.style.left = 'auto'; }
    else { this._fly.style.left = (r.right + 8) + 'px'; this._fly.style.right = 'auto'; }
    btn.setAttribute('aria-expanded', 'true');
  }
  _onDocClick(e) {
    if (this._fly && !this._fly.hidden && !e.target.closest('.ds-module-rail__flyout') && !e.target.closest('.ds-module-rail__more')) this._closeFlyout();
  }

  /* ── tooltips (icons-only) ─────────────────────────────────────────────── */
  _ensureTip() {
    if (!this._tip) {
      this._tip = document.createElement('div');
      this._tip.className = 'ds-module-rail__tip'; this._tip.hidden = true;
      document.body.appendChild(this._tip);
    }
    return this._tip;
  }
  _showTip(el) {
    const label = el.getAttribute('aria-label'); if (!label) return;
    const tip = this._ensureTip();
    tip.textContent = label;
    const rtl = this._isRtl();
    const r = el.getBoundingClientRect();
    tip.style.top = (r.top + r.height / 2) + 'px';
    if (rtl) { tip.classList.add('ds-module-rail__tip--rtl'); tip.style.left = (r.left - 9) + 'px'; }
    else { tip.classList.remove('ds-module-rail__tip--rtl'); tip.style.left = (r.right + 9) + 'px'; }
    tip.hidden = false;
  }
  _onOver(e) {
    const more = e.target.closest('.ds-module-rail__more');
    const item = e.target.closest('.ds-module-rail__item');
    const el = more || item;
    if (!el) { if (this._tip) this._tip.hidden = true; return; }
    /* Items get a tooltip when the label is hidden (icons-only) OR when it's
       shown but truncated (text cut). The "more" button always gets one. */
    if (item) {
      const iconsOnly = this.classList.contains('ds-module-rail--icons');
      if (iconsOnly) { if (this._tip) this._tip.hidden = true; return; }  /* label shown in hover menu */
      const lbl = item.querySelector('.ds-module-rail__lbl');
      const truncated = lbl && (lbl.scrollWidth > lbl.clientWidth + 1 || lbl.scrollHeight > lbl.clientHeight + 1);
      if (!truncated) { if (this._tip) this._tip.hidden = true; return; }
    }
    this._showTip(el);
  }
  _onOut(e) {
    const to = e.relatedTarget;
    if (!to || !to.closest || !to.closest('.ds-module-rail__item, .ds-module-rail__more')) { if (this._tip) this._tip.hidden = true; }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-module-rail')) {
  customElements.define('ds-module-rail', DsModuleRail);
}
