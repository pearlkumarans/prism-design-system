import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Reuse the DS dropdown menu as the caret's overlay. */
import '../dropdown-menu/dropdown-menu.js';

/* Auto-load dropdown-menu.css once (split-button + the menu are light-DOM, so
   the stylesheet must be present on the page). Idempotent. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-split-button-dd-css', '../dropdown-menu/dropdown-menu.css');

const SIZES = ['large', 'medium', 'small', 'xsmall'];
const VARIANTS = ['primary', 'outline'];

export class DsSplitButton extends HTMLElement {
  static get observedAttributes() { return ['size', 'variant', 'label', 'icon', 'disabled', 'loading', 'rtl']; }

  constructor() {
    super();
    /* Caret menu items (array). Set as a property: el.menuItems = [{label,value}, …] */
    if (Object.prototype.hasOwnProperty.call(this, 'menuItems')) {
      const v = this.menuItems; delete this.menuItems; this._pendingMenu = v;
    }
    this._menuItems = [];
  }

  connectedCallback() {
    if (!this._root) {
      this._slottedLabel = this.textContent.trim();
      this.innerHTML = '';
      this._root = document.createElement('div');
      this.appendChild(this._root);
    }
    if (this._pendingMenu !== undefined) { this._menuItems = this._pendingMenu; this._pendingMenu = undefined; }
    this._render();
  }

  disconnectedCallback() { this._removeOutside(); }

  attributeChangedCallback() { if (this._root) this._render(); }

  // ---- Public API ---------------------------------------------------------
  get menuItems() { return this._menuItems; }
  set menuItems(v) { this._menuItems = Array.isArray(v) ? v.slice() : []; if (this._root) this._render(); }

  _render() {
    const size = enumAttr(this, 'size', SIZES, 'small');
    const variant = enumAttr(this, 'variant', VARIANTS, 'primary');
    const label = this.getAttribute('label') || this._slottedLabel || 'Action';
    const icon = this.getAttribute('icon');
    const disabled = boolAttr(this, 'disabled');
    const loading = boolAttr(this, 'loading');
    const rtl = boolAttr(this, 'rtl');

    this._removeOutside();
    this._root.className = `ds-split-button ds-split-button--${size} ds-split-button--${variant}`
      + (loading ? ' ds-split-button--loading' : '');
    this._root.setAttribute('role', 'group');
    this._root.setAttribute('aria-label', `${label} options`);
    if (disabled || loading) this._root.setAttribute('aria-disabled', 'true');
    else this._root.removeAttribute('aria-disabled');
    if (loading) this._root.setAttribute('aria-busy', 'true');
    else this._root.removeAttribute('aria-busy');
    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const iconPx = (size === 'small' || size === 'xsmall') ? 16 : 20;

    if (loading) {
      this._root.innerHTML = `
        <span class="ds-split-button__spinner" role="status" aria-label="Loading">
          <svg viewBox="0 0 24 24" width="${iconPx}" height="${iconPx}" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-dasharray="42 14"></circle>
          </svg>
        </span>`;
      return;
    }

    const hasMenu = this._menuItems.length > 0;
    this._root.innerHTML = `
      <button type="button" class="ds-split-button__main" data-main ${disabled ? 'disabled' : ''}>
        ${icon ? `<ds-icon name="${icon}" size="${iconPx}"></ds-icon>` : ''}
        <span>${label}</span>
      </button>
      <button type="button" class="ds-split-button__chev" aria-label="More ${label} options" aria-haspopup="menu" aria-expanded="false" data-chev ${disabled ? 'disabled' : ''}>
        <ds-icon name="chevron-down" size="${iconPx}"></ds-icon>
      </button>
      ${hasMenu ? `<ds-dropdown-menu class="ds-split-button__menu" type="action"${rtl ? ' rtl' : ''}></ds-dropdown-menu>` : ''}
    `;

    this._chevEl = this._root.querySelector('[data-chev]');
    this._menu = hasMenu ? this._root.querySelector('.ds-split-button__menu') : null;
    if (this._menu) this._menu.items = this._menuItems;

    this._root.querySelector('[data-main]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-split-button-main', { bubbles: true }));
    });
    this._chevEl?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ds-split-button-menu', { bubbles: true }));
      if (this._menu) this._toggleMenu();
    });

    if (this._menu) {
      /* Forward picks; the menu closes itself on select. */
      this._menu.addEventListener('ds-dropdown-select', (e) => {
        this.dispatchEvent(new CustomEvent('ds-split-button-menu-select', { bubbles: true, detail: e.detail }));
        this._syncExpanded();
        this._removeOutside();
      });
      this._menu.addEventListener('ds-dropdown-close', () => { this._syncExpanded(); this._removeOutside(); });
    }
  }

  // ---- Menu open/close ----------------------------------------------------
  _toggleMenu() {
    if (!this._menu) return;
    this._menu.toggle();
    this._syncExpanded();
    if (this._menu.hasAttribute('open')) {
      this._placeMenu();
      this._outside = (e) => { if (!this.contains(e.target)) this._closeMenu(); };
      document.addEventListener('pointerdown', this._outside, true);
      /* Re-evaluate placement while open — the space available can change as the
         page scrolls or the window resizes. rAF-throttled so it never thrashes. */
      this._reposition = () => {
        if (this._raf) return;
        this._raf = requestAnimationFrame(() => { this._raf = 0; this._placeMenu(); });
      };
      window.addEventListener('resize', this._reposition);
      window.addEventListener('scroll', this._reposition, true);
    } else {
      this._removeOutside();
    }
  }

  /* Auto-place the caret menu to whichever side/direction has room, so it never
     spills off the viewport. Default is below + trailing-aligned; flips to
     leading-aligned when clipped horizontally, and opens upward when there's no
     room below but more above. Uses logical alignment so RTL is handled. */
  _placeMenu() {
    const menu = this._menu;
    if (!menu || !menu.hasAttribute('open')) return;
    menu.classList.remove('ds-split-button__menu--align-start', 'ds-split-button__menu--above');

    const gap = 8;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const btn = this._root.getBoundingClientRect();
    let m = menu.getBoundingClientRect();

    /* Horizontal: flip inline alignment if the menu is clipped on either edge. */
    if (m.left < gap || m.right > vw - gap) {
      menu.classList.add('ds-split-button__menu--align-start');
      m = menu.getBoundingClientRect();
    }

    /* Vertical: open upward only when it genuinely fits better there. */
    const spaceBelow = vh - btn.bottom;
    const spaceAbove = btn.top;
    if (m.height + gap > spaceBelow && spaceAbove > spaceBelow) {
      menu.classList.add('ds-split-button__menu--above');
    }
  }

  _closeMenu() { this._menu?.close(); this._syncExpanded(); this._removeOutside(); }
  _syncExpanded() { this._chevEl?.setAttribute('aria-expanded', String(!!this._menu?.hasAttribute('open'))); }
  _removeOutside() {
    if (this._outside) { document.removeEventListener('pointerdown', this._outside, true); this._outside = null; }
    if (this._reposition) {
      window.removeEventListener('resize', this._reposition);
      window.removeEventListener('scroll', this._reposition, true);
      this._reposition = null;
    }
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
    this._menu?.classList.remove('ds-split-button__menu--align-start', 'ds-split-button__menu--above');
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-split-button')) {
  customElements.define('ds-split-button', DsSplitButton);
}
