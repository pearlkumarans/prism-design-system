/* =============================================================================
   <ds-right-pane theme="dark" rtl></ds-right-pane>

   Default rail with the Figma icon set. Override via attributes:

     Top:    show-update, show-sdp, show-mobile-app, show-get-started,
             show-help, show-road-map, show-review
     Bottom: show-announcement, show-accessibility, show-get-quote,
             show-upload-logs, show-call, show-tickets, show-chat
     plus hide-theme-toggle.

   Or supply a fully custom list via the `topItems` / `bottomItems` properties:

     pane.topItems = [{ id, icon, label, active? }, ...];
     pane.bottomItems = [...];

   Responsive height: when the rail is shorter than its icon set, the icons that
   don't fit collapse into a "more" (⋮) button pinned at the bottom; clicking it
   opens a menu listing the hidden items. Restores automatically as height grows.

   Events:
     - ds-right-pane-select   detail: { id }   (also fires from the ⋮ overflow menu)
     - ds-right-pane-theme    detail: { theme }   (after toggle)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { escapeHtml } from '../../utils/escape.js';
/* The "more" (⋮) overflow menu — shown when the rail is too short to fit every
   icon — reuses the real <ds-dropdown-menu> panel (same pattern as ds-breadcrumb). */
import '../dropdown-menu/dropdown-menu.js';
/* The rail is icon-only, so each item reveals its label as a hover/focus
   tooltip — the component depends on <ds-tooltip>. Register it and auto-load its
   CSS so tooltips work on any page that uses ds-right-pane, not just full-bundle
   pages (same self-contained-dependency pattern as ds-icon-button). */
import '../tooltip/tooltip.js';
if (typeof document !== 'undefined') {
  const id = 'ds-right-pane-tooltip-css';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL('../tooltip/tooltip.css', import.meta.url).href;
    document.head.appendChild(link);
  }
}

const THEMES = ['light', 'dark'];

/* Default icon set + order matches the Figma Right Pane (16359:74562):
   Top    → Update (highlight) · Product (logo, swap via product-logo) · Mobile · Get started · Help · Road map · Review
   Bottom → Announcement · Accessibility · Get a quote · Upload logs · Call · Tickets · Chat
   The Update slot carries a persistent alert-tint highlight (bg-alert-primary)
   signalling an available update, per Figma. */
const DEFAULT_TOP = [
  { id: 'update',      icon: 'update',      label: 'Check for updates', highlight: true },
  { id: 'product',     logo: 'sdp',         label: 'Product', tooltip: 'Jump to SDP' }, /* product logo slot — swap via product-logo="endpoint-central" etc.; override `tooltip` to match */
  { id: 'mobile',      icon: 'mobile',      label: 'Mobile app' },
  { id: 'get-started', icon: 'rocket',      label: 'Getting started' },
  { id: 'help',        icon: 'help-circle', label: 'Help' },
  { id: 'roadmap',     icon: 'light-bulb',  label: 'Road map' },
  { id: 'review',      icon: 'review',      label: 'Review' },
];
const DEFAULT_BOTTOM = [
  { id: 'announcement', icon: 'announcement',        label: 'Announcement' },
  { id: 'accessibility',icon: 'accessibility',       label: 'Accessibility' },
  { id: 'get-quote',    icon: 'price-tag',           label: 'Get a quote' },
  { id: 'upload-logs',  icon: 'upload',              label: 'Upload logs' },
  { id: 'call',         icon: 'calling',             label: 'Call' },
  { id: 'tickets',      icon: 'ticket',              label: 'Tickets' },
  { id: 'chat',         icon: 'message-text-square',  label: 'Chat', fab: true },
];

const SHOW_ATTR_TOP = {
  'update':      'show-update',
  'product':     'show-product',
  'mobile':      'show-mobile-app',
  'get-started': 'show-get-started',
  'help':        'show-help',
  'roadmap':     'show-road-map',
  'review':      'show-review',
};
const SHOW_ATTR_BOTTOM = {
  'announcement': 'show-announcement',
  'accessibility':'show-accessibility',
  'get-quote':    'show-get-quote',
  'upload-logs':  'show-upload-logs',
  'call':         'show-call',
  'tickets':      'show-tickets',
  'chat':         'show-chat',
};

export class DsRightPane extends HTMLElement {
  static get observedAttributes() {
    return [
      'theme', 'rtl', 'hide-theme-toggle', 'product-logo',
      'show-direction', 'direction-icon', 'direction-label',
      ...Object.values(SHOW_ATTR_TOP),
      ...Object.values(SHOW_ATTR_BOTTOM),
    ];
  }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, 'topItems')) {
      const v = this.topItems; delete this.topItems; this._pendingTop = v;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'bottomItems')) {
      const v = this.bottomItems; delete this.bottomItems; this._pendingBottom = v;
    }
  }

  connectedCallback() {
    if (!this._root) {
      this.innerHTML = '';
      this._root = document.createElement('aside');
      this._root.className = 'ds-right-pane';
      this._root.setAttribute('aria-label', 'Utilities');
      this.appendChild(this._root);
    }
    if (this._pendingTop !== undefined) { this._customTop = this._pendingTop; this._pendingTop = undefined; }
    if (this._pendingBottom !== undefined) { this._customBottom = this._pendingBottom; this._pendingBottom = undefined; }
    this._render();
  }

  attributeChangedCallback() { if (this._root) this._render(); }

  set topItems(v) { this._customTop = Array.isArray(v) ? v.slice() : null; if (this._root) this._render(); }
  get topItems() { return this._customTop || DEFAULT_TOP; }
  set bottomItems(v) { this._customBottom = Array.isArray(v) ? v.slice() : null; if (this._root) this._render(); }
  get bottomItems() { return this._customBottom || DEFAULT_BOTTOM; }

  _isShown(id, attrName, defaultOn = true) {
    if (!attrName) return true;
    if (!this.hasAttribute(attrName)) return defaultOn;
    return this.getAttribute(attrName) !== 'false';
  }

  _render() {
    const theme = enumAttr(this, 'theme', THEMES, 'light');
    /* RTL from our own `rtl` attribute OR an ancestor's `dir="rtl"` (apps often
       flip direction on <html> only). Inward-pointing tooltips and the mirrored
       layout depend on this, so honour the ambient direction too — the host must
       still re-render us on a dir flip (toggling `rtl` is the trigger). */
    const rtl = boolAttr(this, 'rtl')
      || (typeof document !== 'undefined'
          && (this.closest('[dir="rtl"]') != null
              || document.documentElement.getAttribute('dir') === 'rtl'));
    const hideToggle = boolAttr(this, 'hide-theme-toggle');

    if (rtl) this._root.setAttribute('dir', 'rtl');
    else this._root.removeAttribute('dir');

    const topSrc = this._customTop || DEFAULT_TOP;
    const bottomSrc = this._customBottom || DEFAULT_BOTTOM;

    const topItems = topSrc.filter((it) => this._isShown(it.id, SHOW_ATTR_TOP[it.id]));
    const bottomItems = bottomSrc.filter((it) => this._isShown(it.id, SHOW_ATTR_BOTTOM[it.id]));

    const themeBtn = hideToggle ? '' : `<li>
      <button type="button" class="ds-right-pane__btn"
              data-id="__theme__"
              aria-label="Switch to ${theme === 'dark' ? 'light' : 'dark'} theme">
        <ds-icon name="${theme === 'dark' ? 'sun' : 'moon'}" size="20"></ds-icon>
      </button>
    </li>`;

    /* Optional language / text-direction toggle — opt in with `show-direction`
       (default off, so existing consumers are unchanged). Sits directly above the
       theme toggle at the top of the bottom stack. Emits ds-right-pane-select
       with id="direction" via the shared click handler below. */
    const showDirection = this._isShown('direction', 'show-direction', false);
    const directionBtn = showDirection ? `<li>
      <button type="button" class="ds-right-pane__btn"
              data-id="direction"
              aria-label="${this.getAttribute('direction-label') || 'Switch language and direction'}">
        <ds-icon name="${this.getAttribute('direction-icon') || 'globe'}" size="20"></ds-icon>
      </button>
    </li>` : '';

    const logoBase = (typeof window !== 'undefined' && window.UEMS_LOGO_BASE) || '../icons/logos';

    const renderItem = (it) => {
      // Divider — non-interactive horizontal rule between item groups
      if (it.type === 'divider') {
        return `<li class="ds-right-pane__divider" aria-hidden="true"></li>`;
      }
      // Multi-color logo (full-color SVG, not currentColor sprite).
      // The product slot's logo is swappable via the product-logo attribute.
      const logoName = it.id === 'product'
        ? (this.getAttribute('product-logo') || it.logo)
        : it.logo;
      // FAB slot (e.g. Chat): render our own icon-button component with its
      // built-in `primary` variant — no bespoke rail styling. It carries its own
      // aria-label + hover tooltip, so it's excluded from the rail's tooltip
      // re-parent pass below; the click delegation matches it via data-id.
      if (it.fab) {
        return `<li>
          <ds-icon-button class="ds-right-pane__fab" data-id="${escapeHtml(it.id)}"
                          type="primary" shape="square" size="xl"
                          icon="${escapeHtml(it.icon)}"
                          label="${escapeHtml(it.label || it.id)}"
                          tooltip-position="${rtl ? 'right' : 'left'}"></ds-icon-button>
        </li>`;
      }
      const content = logoName
        ? `<img class="ds-right-pane__logo" src="${logoBase}/${escapeHtml(logoName)}.svg" alt="" />`
        : `<ds-icon name="${escapeHtml(it.icon)}" size="20"></ds-icon>`;
      const cls = [
        'ds-right-pane__btn',
        it.logo ? 'ds-right-pane__btn--logo' : '',
        it.highlight ? 'ds-right-pane__btn--highlight' : '',
      ].filter(Boolean).join(' ');
      return `<li>
        <button type="button" class="${cls}"
                data-id="${escapeHtml(it.id)}"
                ${it.tooltip ? `data-tooltip="${escapeHtml(it.tooltip)}"` : ''}
                ${it.active ? 'aria-pressed="true"' : ''}
                aria-label="${escapeHtml(it.label || it.id)}">
          ${content}
        </button>
      </li>`;
    };

    /* "More" (⋮) overflow trigger — pinned at the very bottom, hidden until the
       rail can't fit every icon (toggled by _reflow). */
    const moreBtn = `<li class="ds-right-pane__more-li" hidden>
      <button type="button" class="ds-right-pane__btn ds-right-pane__more" data-id="__more__"
              aria-haspopup="menu" aria-expanded="false" aria-label="More">
        <ds-icon name="more-vertical" size="20"></ds-icon>
      </button>
    </li>`;

    this._root.innerHTML = `
      <ul class="ds-right-pane__top" role="list">${topItems.map(renderItem).join('')}</ul>
      <div class="ds-right-pane__spacer" aria-hidden="true"></div>
      <ul class="ds-right-pane__bottom" role="list">${directionBtn}${themeBtn}${bottomItems.map(renderItem).join('')}${moreBtn}</ul>
    `;

    this._root.querySelectorAll('.ds-right-pane__btn, .ds-right-pane__fab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id === '__theme__') {
          const next = theme === 'dark' ? 'light' : 'dark';
          this.setAttribute('theme', next);
          this.dispatchEvent(new CustomEvent('ds-right-pane-theme', { bubbles: true, detail: { theme: next } }));
        } else if (id === '__more__') {
          this._toggleMenu();
        } else {
          this.dispatchEvent(new CustomEvent('ds-right-pane-select', { bubbles: true, detail: { id } }));
        }
      });
    });

    /* Reveal each item's label (its aria-label) as a tooltip. The tip points
       inward — left of the icon in LTR, right in RTL — and ds-tooltip portals
       its bubble to <body>, so wrapping doesn't disturb the rail's flex layout.
       The theme toggle is skipped: hosts may attach richer hover UI to it (e.g.
       the shell's appearance menu). Custom text via an item's `tooltip` field. */
    const tipPos = rtl ? 'right' : 'left';
    this._root.querySelectorAll('.ds-right-pane__btn').forEach((btn) => {
      if (btn.dataset.id === '__theme__' || btn.closest('ds-tooltip')) return;
      const text = btn.dataset.tooltip || btn.getAttribute('aria-label');
      if (!text) return;
      const tip = document.createElement('ds-tooltip');
      tip.setAttribute('text', text);
      tip.setAttribute('position', tipPos);
      tip.setAttribute('show-icon', 'false');
      btn.parentNode.insertBefore(tip, btn);
      tip.appendChild(btn);
    });

    /* Overflow: when the rail is shorter than its icon set, collapse the ones
       that don't fit into the ⋮ "more" menu (measured after layout). */
    this._setupOverflow(topItems, bottomItems);
    this._ensureObserver();
    this._scheduleReflow();
  }

  // ---- Height overflow → "more" (⋮) menu ----------------------------------
  /* Build the ordered list of collapsible items (top stack, then bottom support)
     the fitter can hide. The theme toggle, direction toggle and the ⋮ button
     itself are pinned and never collapse. */
  _setupOverflow(topItems, bottomItems) {
    this._moreBtn = this._root.querySelector('.ds-right-pane__more');
    this._moreLi = this._moreBtn ? this._moreBtn.closest('li') : null;
    const byId = new Map();
    [...topItems, ...bottomItems].forEach((it) => { if (it && it.id) byId.set(it.id, it); });
    const pinned = new Set(['__theme__', '__more__', 'direction']);
    const topUl = this._root.querySelector('.ds-right-pane__top');
    const botUl = this._root.querySelector('.ds-right-pane__bottom');
    const lis = [...(topUl ? topUl.children : []), ...(botUl ? botUl.children : [])];
    this._collapsible = lis.map((li) => {
      const btn = li.querySelector && li.querySelector('.ds-right-pane__btn');
      const id = btn && btn.dataset.id;
      if (!id || pinned.has(id) || !byId.has(id)) return null;
      return { li, item: byId.get(id) };
    }).filter(Boolean);
  }

  _ensureObserver() {
    if (this._ro || typeof ResizeObserver === 'undefined') return;
    /* Observe the HOST (its height tracks the container); hiding inner items
       doesn't resize the host, so there's no observer→reflow feedback loop. */
    this._ro = new ResizeObserver(() => this._scheduleReflow());
    this._ro.observe(this);
  }

  _scheduleReflow() {
    /* rAF gives the fast, post-layout measure. The independent setTimeout is a
       backstop for two cases: ds-icon / ds-tooltip laying out a frame or two late
       (inflating the content height after the first measure), and rAF being
       paused while the pane is in a background tab. _reflow is idempotent, so
       running it from both is harmless. */
    cancelAnimationFrame(this._reflowRaf);
    this._reflowRaf = requestAnimationFrame(() => this._reflow());
    clearTimeout(this._reflowT);
    this._reflowT = setTimeout(() => this._reflow(), 260);
  }

  /* Fit pass: reveal all, then — if the content overflows the rail height — show
     the ⋮ button and hide collapsible items from the tail until it fits. */
  _reflow() {
    if (!this._root || !this._moreLi || !this._collapsible) return;
    this._collapsible.forEach((e) => { e.li.hidden = false; });
    this._moreLi.hidden = true;
    if (!this._root.clientHeight) return;
    const fits = () => this._root.scrollHeight <= this._root.clientHeight + 1;
    if (fits()) { this._hiddenItems = []; this._closeMenu(); return; }
    this._moreLi.hidden = false;                 // reserve the ⋮ slot
    for (let i = this._collapsible.length - 1; i >= 0 && !fits(); i--) {
      this._collapsible[i].li.hidden = true;
    }
    this._hiddenItems = this._collapsible.filter((e) => e.li.hidden).map((e) => e.item);
    if (!this._hiddenItems.length) { this._moreLi.hidden = true; return; }
    /* Keep an open menu in sync with a live resize. */
    if (this._menu && this._menu.hasAttribute('open')) {
      this._menu.items = this._menuItems();
      this._menu.positionFrom(this._moreBtn, { align: 'before', vAlign: 'top', gap: 8 });
    }
  }

  _menuItems() {
    return (this._hiddenItems || []).map((it) => ({
      label: it.label || it.id, value: it.id,
      icon: it.logo ? undefined : it.icon,   // logo items have no sprite icon → label only
    }));
  }

  _ensureMenu() {
    if (this._menu) return this._menu;
    const dd = document.createElement('ds-dropdown-menu');
    dd.setAttribute('type', 'default');
    dd.classList.add('ds-right-pane__overflow-dd');
    dd.addEventListener('ds-dropdown-select', (e) => {
      const id = e.detail && e.detail.value;
      this._closeMenu();
      if (id) this.dispatchEvent(new CustomEvent('ds-right-pane-select', { bubbles: true, composed: true, detail: { id } }));
    });
    dd.addEventListener('ds-dropdown-close', () => this._closeMenu());
    document.body.appendChild(dd);
    this._menu = dd;
    return dd;
  }

  _toggleMenu() { (this._menu && this._menu.hasAttribute('open')) ? this._closeMenu() : this._openMenu(); }

  _openMenu() {
    if (!this._hiddenItems || !this._hiddenItems.length || !this._moreBtn) return;
    const dd = this._ensureMenu();
    dd.items = this._menuItems();
    dd.openFrom(this._moreBtn, { align: 'before', vAlign: 'top', gap: 8 });
    this._moreBtn.setAttribute('aria-expanded', 'true');
    this._onDocClick = (e) => {
      if (this._moreBtn.contains(e.target) || (this._menu && this._menu.contains(e.target))) return;
      this._closeMenu();
    };
    document.addEventListener('click', this._onDocClick, true);
    this._onEsc = (e) => { if (e.key === 'Escape') { this._closeMenu(); this._moreBtn.focus(); } };
    document.addEventListener('keydown', this._onEsc);
  }

  _closeMenu() {
    /* Re-entry guard: close() dispatches ds-dropdown-close, whose listener calls
       back here — the flag breaks that cycle. */
    if (this._closing) return;
    this._closing = true;
    if (this._menu) this._menu.close();
    if (this._moreBtn) this._moreBtn.setAttribute('aria-expanded', 'false');
    if (this._onDocClick) { document.removeEventListener('click', this._onDocClick, true); this._onDocClick = null; }
    if (this._onEsc) { document.removeEventListener('keydown', this._onEsc); this._onEsc = null; }
    this._closing = false;
  }

  disconnectedCallback() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._reflowRaf) { cancelAnimationFrame(this._reflowRaf); this._reflowRaf = 0; }
    clearTimeout(this._reflowT);
    this._closeMenu();
    if (this._menu && this._menu.parentNode) this._menu.parentNode.removeChild(this._menu);
    this._menu = null;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-right-pane')) {
  customElements.define('ds-right-pane', DsRightPane);
}
