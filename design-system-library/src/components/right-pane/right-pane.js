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

   Events:
     - ds-right-pane-select   detail: { id }
     - ds-right-pane-theme    detail: { theme }   (after toggle)
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
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
  { id: 'chat',         icon: 'message-chat-square', label: 'Chat' },
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
    const rtl = boolAttr(this, 'rtl');
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
      const content = logoName
        ? `<img class="ds-right-pane__logo" src="${logoBase}/${logoName}.svg" alt="" />`
        : `<ds-icon name="${it.icon}" size="20"></ds-icon>`;
      const cls = [
        'ds-right-pane__btn',
        it.logo ? 'ds-right-pane__btn--logo' : '',
        it.highlight ? 'ds-right-pane__btn--highlight' : '',
      ].filter(Boolean).join(' ');
      return `<li>
        <button type="button" class="${cls}"
                data-id="${it.id}"
                ${it.tooltip ? `data-tooltip="${it.tooltip}"` : ''}
                ${it.active ? 'aria-pressed="true"' : ''}
                aria-label="${it.label || it.id}">
          ${content}
        </button>
      </li>`;
    };

    this._root.innerHTML = `
      <ul class="ds-right-pane__top" role="list">${topItems.map(renderItem).join('')}</ul>
      <div class="ds-right-pane__spacer" aria-hidden="true"></div>
      <ul class="ds-right-pane__bottom" role="list">${directionBtn}${themeBtn}${bottomItems.map(renderItem).join('')}</ul>
    `;

    this._root.querySelectorAll('.ds-right-pane__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (id === '__theme__') {
          const next = theme === 'dark' ? 'light' : 'dark';
          this.setAttribute('theme', next);
          this.dispatchEvent(new CustomEvent('ds-right-pane-theme', { bubbles: true, detail: { theme: next } }));
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
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-right-pane')) {
  customElements.define('ds-right-pane', DsRightPane);
}
