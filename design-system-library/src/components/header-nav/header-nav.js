/* =============================================================================
   <ds-header-nav variant="patch-manager-plus" product-name="Patch Manager Plus"
                  show-search show-settings show-bookmark
                  show-notifications show-avatar show-bento show-customer-selector>
   </ds-header-nav>

   Search model (per product type):
     - COMBINED products → centre = horizontal tab nav; search = plain ICON in
       the right cluster (no centre field).
         · endpoint-central       (all modules)
         · endpoint-central-msp   (+ customer selector)
     - POINT / LEFT-ONLY products → primary nav lives in a left sidebar, so the
       centre holds a full, CENTER-ALIGNED search FIELD.
         · ec-left-only · mdm · patch-manager-plus · (extended family)

   Right-cluster boolean toggles (default ON for all):
     show-search, show-notifications, show-settings, show-customer-selector,
     show-avatar, show-bento, show-bookmark

   JS properties:
     tabs            : [{ id, label, active, href? }]   — endpoint-central only
     userInitials    : string                           — fallback avatar
     customerLabel   : string                           — defaults to "All Customers"
     searchPlaceholder: string                          — defaults to "Search…"

   Events:
     ds-header-nav-tab-select   { id }
     ds-header-nav-search       { value }   on Enter in search box
     ds-header-nav-action       { action }  for any utility-cluster icon click
   ============================================================================= */

import { boolAttr, enumAttr } from '../../utils/attr.js';
import { escapeHtml } from '../../utils/escape.js';
/* Centre search uses the shared search-field component. */
import '../search-field/search-field.js';

/* ds-search-field is light-DOM (styled via `ds-search-field {…}` in its own
   CSS). Auto-load that stylesheet so the centre search field is styled even on
   pages that link header-nav.css individually without search-field.css. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
_injectCss('ds-header-nav-search-field-css', '../search-field/search-field.css');

/* Spec ships 4 product variants. The set is extended below with the rest of
   the ManageEngine endpoint-management product family — same chrome, different
   logo + product name. Add a new product by adding to PRODUCT_DEFAULTS and
   dropping a logo SVG in /logos/<key>.svg. */
const VARIANTS = [
  'endpoint-central',
  'endpoint-central-msp',
  'msp-central',
  'ec-left-only',
  'mdm',
  'patch-manager-plus',
  'browser-security-plus',
  'application-control-plus',
  'device-control-plus',
  'dex-manager-plus',
  'endpoint-dlp-plus',
  'malware-protection-plus',
  'os-deployer',
  'patch-connect-plus',
  'ransomware-protection-plus',
  'remote-access-plus',
  'vulnerability-manager-plus',
  'ad360',
  'log360',
  'pam360',
  'servicedesk-plus',
  'site24x7',
];

/* Default right-cluster toggles per spec are ALL ON. Use a "default-on, set-to-
   false to hide" convention on the attribute (matches dropdown-menu's pattern). */
/* Sample tenants/customers — Endpoint Central style: a head office + remote
   offices + business units. Override via `headerNav.customers = [...]`. */
const DEFAULT_CUSTOMERS = [
  { label: 'All Customers',                  value: 'all' },
  { label: 'Head Office — Chennai',          value: 'ho-chennai' },
  { label: 'Remote Office — Bangalore',      value: 'ro-blr' },
  { label: 'Remote Office — Hyderabad',      value: 'ro-hyd' },
  { label: 'Remote Office — Pune',           value: 'ro-pune' },
  { label: 'Remote Office — Singapore',      value: 'ro-sg' },
  { label: 'Remote Office — New Jersey',     value: 'ro-nj' },
  { label: 'Engineering — R&D',              value: 'eng-rd' },
  { label: 'Finance & Operations',           value: 'finance' },
  { label: 'Sales & Customer Success',       value: 'sales' },
];

const defaultOn = (host, attr) => {
  if (!host.hasAttribute(attr)) return true;
  return host.getAttribute(attr) !== 'false';
};

/* Each variant maps to a product display name + a logo file under
   /logos/<key>.svg. Logo SVGs are full-colour ManageEngine product marks. */
const PRODUCT_DEFAULTS = {
  'endpoint-central':         { name: 'Endpoint Central',           logo: 'endpoint-central'         },
  'endpoint-central-msp':     { name: 'Endpoint Central MSP',       logo: 'endpoint-central'         },
  'msp-central':              { name: 'MSP Central',                logo: 'msp-central'              },
  'ec-left-only':             { name: 'Endpoint Central',           logo: 'endpoint-central'         },
  'mdm':                      { name: 'Mobile Device Manager Plus', logo: 'mdm'                      },
  'patch-manager-plus':       { name: 'Patch Manager Plus',         logo: 'patch-manager-plus'       },
  'browser-security-plus':    { name: 'Browser Security Plus',      logo: 'browser-security-plus'    },
  'application-control-plus': { name: 'Application Control Plus',   logo: 'application-control-plus' },
  'device-control-plus':      { name: 'Device Control Plus',        logo: 'device-control-plus'      },
  'dex-manager-plus':         { name: 'DEX Manager Plus',           logo: 'dex-manager-plus'         },
  'endpoint-dlp-plus':        { name: 'Endpoint DLP Plus',          logo: 'endpoint-dlp-plus'        },
  'malware-protection-plus':  { name: 'Malware Protection Plus',    logo: 'malware-protection-plus'  },
  'os-deployer':              { name: 'OS Deployer',                logo: 'os-deployer'              },
  'patch-connect-plus':       { name: 'Patch Connect Plus',         logo: 'patch-connect-plus'       },
  'ransomware-protection-plus': { name: 'Ransomware Protection Plus', logo: 'ransomware-protection-plus' },
  'remote-access-plus':       { name: 'Remote Access Plus',         logo: 'remote-access-plus'       },
  'vulnerability-manager-plus': { name: 'Vulnerability Manager Plus', logo: 'vulnerability-manager-plus' },
  /* Adjacent ManageEngine products (separate suites) — branding only. */
  'ad360':                    { name: 'AD360',                     logo: 'ad360'                    },
  'log360':                   { name: 'Log360',                    logo: 'log360'                   },
  'pam360':                   { name: 'PAM360',                    logo: 'pam360'                   },
  'servicedesk-plus':         { name: 'ServiceDesk Plus',          logo: 'sdp'                      },
  'site24x7':                 { name: 'Site24x7',                  logo: 'site24x7'                 },
};

let _hnUid = 0;

export class DsHeaderNav extends HTMLElement {
  static get observedAttributes() {
    return [
      'variant', 'product-name', 'search-placeholder',
      'show-search', 'show-notifications', 'show-settings',
      'show-customer-selector', 'show-avatar', 'show-bento',
      'show-bookmark', 'show-zia',
      'center', 'search',
      'rtl',
    ];
  }

  constructor() {
    super();
    this._uid = ++_hnUid;
    if (Object.prototype.hasOwnProperty.call(this, 'tabs')) {
      const v = this.tabs;
      delete this.tabs;
      this._pendingTabs = v;
    }
    this._tabs = [];
    /* One document-level outside-click handler for the overflow + customer menus,
       bound once and managed by connect/disconnect. _wire() used to add a fresh
       anonymous listener on every render (accumulating, unremovable); this looks
       elements up live so it survives re-renders without stale references. */
    this._onDocClick = (e) => {
      const overflow = this.querySelector('.ds-header-nav__overflow-menu');
      if (overflow && overflow.hasAttribute('open')) {
        const wrap = this.querySelector('.ds-header-nav__overflow-wrap');
        if (!(wrap && wrap.contains(e.target))) {
          overflow.close?.();
          this.querySelector('[data-action="overflow"]')?.setAttribute('aria-expanded', 'false');
        }
      }
      const customer = this.querySelector('.ds-header-nav__customer-menu');
      if (customer && customer.hasAttribute('open')) {
        const wrap = this.querySelector('.ds-header-nav__customer-wrap');
        if (!(wrap && wrap.contains(e.target))) {
          customer.close?.();
          this.querySelector('[data-action="customer-selector"]')?.setAttribute('aria-expanded', 'false');
        }
      }
    };
  }

  connectedCallback() {
    if (!this._mounted) {
      this.innerHTML = '';
      this._mounted = true;
    }
    if (this._pendingTabs !== undefined) {
      this.tabs = this._pendingTabs;
      this._pendingTabs = undefined;
    }
    this._render();
    /* Idempotent (same reference) — safe to call on every connect. */
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    if (this._onWinLoad) { window.removeEventListener('load', this._onWinLoad); this._onWinLoad = null; }
    this._resizeObs?.disconnect?.();
  }

  attributeChangedCallback() {
    if (this._mounted) this._render();
  }

  get tabs() { return this._tabs; }
  set tabs(v) {
    this._tabs = Array.isArray(v) ? v.slice() : [];
    /* Remember the caller's natural order. The overflow reflow reorders _tabs to
       keep the active tab visible; resetting to this order before each reflow keeps
       repeated tab switches from cumulatively scrambling the row. */
    this._tabsOrder = this._tabs.map((t) => t.id);
    if (this._mounted) this._render();
  }

  _render() {
    const variant = enumAttr(this, 'variant', VARIANTS, 'endpoint-central');
    const rtl = boolAttr(this, 'rtl');
    const product = PRODUCT_DEFAULTS[variant];
    const productName = this.getAttribute('product-name') || product.name;
    const customerLabel = this.getAttribute('customer-label') || 'All Customers';
    const searchPh = this.getAttribute('search-placeholder') || 'Search…';

    const showSearch     = defaultOn(this, 'show-search');
    const showNotifs     = defaultOn(this, 'show-notifications');
    const showSettings   = defaultOn(this, 'show-settings');
    /* Customer selector is an MSP feature — default ON only for the MSP
       product; OFF elsewhere unless explicitly enabled. */
    const showCustomer   = this.hasAttribute('show-customer-selector')
      ? this.getAttribute('show-customer-selector') !== 'false'
      : (variant === 'endpoint-central-msp' || variant === 'msp-central');
    const showAvatar     = defaultOn(this, 'show-avatar');
    const showBento      = defaultOn(this, 'show-bento');
    const showBookmark   = defaultOn(this, 'show-bookmark');
    /* Ask ZIA is opt-in (product feature, not a default utility) — off unless
       explicitly enabled. It renders at the far inline-start, before the brand. */
    const showZia        = this.hasAttribute('show-zia') && this.getAttribute('show-zia') !== 'false';

    this.classList.add('ds-header-nav');
    this.dataset.variant = variant;
    this.setAttribute('role', 'banner');
    if (rtl) this.setAttribute('dir', 'rtl');
    else this.removeAttribute('dir');

    /* Combined products (Endpoint Central + its MSP variant) use the top tab
       nav and a search ICON; everything else uses a centred search FIELD. */
    /* `center="search"` forces the centred search field even on combined
       products — used by the shell's LEFT-navigation mode, where the module
       tabs move to a left rail and the top bar centres a search box instead. */
    const forceSearch = this.getAttribute('center') === 'search';
    const isTopNav = (variant === 'endpoint-central' || variant === 'endpoint-central-msp' || variant === 'msp-central') && !forceSearch;
    /* Search placement:
         - top-nav (combined EC): the centre is the tab band, search is a right-cluster ICON.
         - point / left-only products: centre a search FIELD by default. Set
           `search="icon"` to instead hide the centre field and show the search ICON
           in the right cluster (like top-nav) — used by the shell for point products. */
    const searchMode = (this.getAttribute('search') || '').toLowerCase();
    const searchAsIcon = showSearch && (isTopNav || searchMode === 'icon');
    const searchAsField = showSearch && !isTopNav && searchMode !== 'icon';
    /* Centre a search field only when one is actually rendered; combined products
       centre the 72%-wide tab band. Both balance brand & cluster (see CSS). */
    this.classList.toggle('ds-header-nav--centered-search', searchAsField);
    this.classList.toggle('ds-header-nav--tabs', isTopNav);
    /* Point product with search as an ICON → no centre content; push the cluster
       to the inline-end (see CSS). */
    this.classList.toggle('ds-header-nav--search-icon', searchAsIcon && !isTopNav);

    const logoBase = (typeof window !== 'undefined' && window.UEMS_LOGO_BASE) || '/logos';

    /* Ask ZIA — first item of the utility cluster (its inline-start edge), with a
       separator on its inline-end (border, so it mirrors in RTL). Emits the
       standard ds-header-nav-action {action:'zia'} on click via the generic wiring. */
    const ziaHTML = `
      <div class="ds-header-nav__zia-wrap">
        <button type="button" class="ds-header-nav__zia" data-action="zia" aria-label="Ask Zia">
          <img class="ds-header-nav__zia-ic" src="${logoBase}/Zia-logo.svg" alt="" aria-hidden="true" />
          <span class="ds-header-nav__zia-label">Ask Zia</span>
        </button>
      </div>`;

    const brandHTML = `
      <div class="ds-header-nav__brand">
        <img class="ds-header-nav__logo"
             src="${(typeof window !== 'undefined' && window.UEMS_LOGO_BASE) || '/logos'}/${product.logo}.svg"
             alt="" aria-hidden="true" />
        <span class="ds-header-nav__product">${productName}</span>
      </div>`;

    const centreHTML = isTopNav
      ? this._renderTabs()
      : (searchAsField ? this._renderSearchBar(searchPh) : '');

    const cluster = [];
    if (showCustomer) {
      cluster.push(`
        <div class="ds-header-nav__customer-wrap">
          <button type="button" class="ds-header-nav__customer"
                  data-action="customer-selector"
                  aria-haspopup="listbox" aria-expanded="false">
            <span class="ds-header-nav__customer-label">${customerLabel}</span>
            <ds-icon name="chevron-down" size="14"></ds-icon>
          </button>
          <ds-dropdown-menu class="ds-header-nav__customer-menu" type="single"></ds-dropdown-menu>
        </div>`);
    }
    /* Ask ZIA sits between the customer selector and the search icon (its
       inline-end divider then separates it from the utility icons). */
    if (showZia) cluster.push(ziaHTML);
    /* Search as a right-cluster ICON: combined products (tab nav occupies the
       centre) and any product with search="icon" (point products opting out of the
       centred field). The centred FIELD path renders in centreHTML instead. */
    if (searchAsIcon) {
      cluster.push(this._iconBtn('search', 'search', 'Search'));
    }
    if (showSettings) cluster.push(this._iconBtn('settings', 'settings', 'Settings'));
    if (showBookmark) cluster.push(this._iconBtn('bookmark', 'bookmark', 'Bookmarks'));
    if (showNotifs)   cluster.push(this._iconBtn('notifications', 'notification', 'Notifications'));
    if (showAvatar)   cluster.push(`
      <button type="button" class="ds-header-nav__avatar"
              data-action="avatar" aria-label="User menu">
        <ds-avatar size="small" type="initials" name="${this.getAttribute('user-initials') || 'AM'}"></ds-avatar>
      </button>`);
    if (showBento)    cluster.push(this._iconBtn('bento', 'bento-menu', 'Apps'));

    /* Compact/mobile (below the container-query breakpoint, see header-nav.css):
       the inline tab band is hidden and replaced by the CURRENT tab's label plus
       a kebab (⋮) that opens the host shell's nav sheet. Only meaningful for the
       tab variants; CSS keeps these hidden until compact. Wired explicitly (no
       data-action) so the kebab stays out of the utility-icon logic. */
    const activeTab = (this._tabs || []).find((t) => t.active);
    const compactNavHTML = isTopNav ? `
      <span class="ds-header-nav__current" aria-hidden="true">${activeTab ? escapeHtml(activeTab.label) : ''}</span>
      <button type="button" class="ds-header-nav__menu-kebab" aria-label="Open navigation menu"
              aria-haspopup="true" aria-expanded="false">
        <ds-icon name="more-vertical" size="20"></ds-icon>
      </button>` : '';

    this.innerHTML = `
      ${brandHTML}
      ${compactNavHTML}
      ${centreHTML}
      <div class="ds-header-nav__cluster">${cluster.join('')}</div>
    `;

    this._wire(isTopNav);
    const menuBtn = this.querySelector('.ds-header-nav__menu-kebab');
    if (menuBtn) menuBtn.addEventListener('click', () => this._toggleMenu());
    if (isTopNav) {
      /* Clip synchronously before the first paint so a freshly-rendered tab set
         (all tabs shown at natural width) never paints with the active/last tab
         cut off by the list's overflow:hidden. The scheduled reflow re-runs after
         layout + fonts settle. */
      this._reflowOverflow();
      this._scheduleReflow();
      /* Observe the tabs <nav> directly: it shrinks when the right cluster
         grows (icons/fonts loading), and that's exactly the trigger that
         should re-clip tabs. Observing the host alone misses these shifts. */
      if (this._resizeObs) this._resizeObs.disconnect();
      this._resizeObs = new ResizeObserver(() => this._scheduleReflow());
      const tabsEl = this.querySelector('.ds-header-nav__tabs');
      if (tabsEl) this._resizeObs.observe(tabsEl);

      /* One-shot re-reflows after fonts and async assets resolve. */
      if (!this._asyncReflowsHooked) {
        this._asyncReflowsHooked = true;
        if (document.fonts?.ready) document.fonts.ready.then(() => this._scheduleReflow());
        /* If the page has already loaded (the usual SPA case), reflow now — adding
           a `load` listener would never fire and would leak (it also isn't removed
           on disconnect). Otherwise attach a removable handler, dropped on teardown. */
        if (document.readyState === 'complete') {
          this._scheduleReflow();
        } else {
          this._onWinLoad = () => this._scheduleReflow();
          window.addEventListener('load', this._onWinLoad, { once: true });
        }
      }
    }
  }

  _scheduleReflow() {
    if (this._reflowScheduled) return;
    this._reflowScheduled = true;
    /* Double rAF lets the browser finish style + layout before we measure. */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this._reflowScheduled = false;
      this._reflowOverflow();
    }));
  }

  /* Measure visible tabs and hide the ones that don't fit. The ··· button
     sits right next to the last visible tab; clipped tabs are tracked in
     this._clippedTabs so the dropdown can show them on click. */
  _reflowOverflow() {
    const list = this.querySelector('.ds-header-nav__tabs-list');
    const wrap = this.querySelector('.ds-header-nav__overflow-wrap');
    const btn  = this.querySelector('[data-action="overflow"]');
    if (!list || !wrap || !btn) return;

    /* Reset visibility before measuring natural widths. */
    let tabEls = [...list.querySelectorAll('.ds-header-nav__tab')];
    tabEls.forEach((el) => { el.style.display = ''; });

    /* Restore the caller's natural order before the "active is sacred" reorder
       below. That reorder mutates _tabs and the DOM to pull the active tab into
       view; without this reset, each successive tab switch would reorder from the
       ALREADY-reordered row, cumulatively scrambling the tabs (e.g. a stale
       "Agent Browsers BitLocker" sequence). Resetting makes every reflow
       deterministic: natural order, then one active tab moved forward. */
    if (Array.isArray(this._tabsOrder) && this._tabsOrder.length) {
      const rank = new Map(this._tabsOrder.map((id, i) => [id, i]));
      // Sort _tabs back to natural order (preserving active flags).
      this._tabs.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
      // Re-sync the DOM to natural order too.
      const byId = new Map();
      tabEls.forEach((el) => { if (el.dataset.tabId) byId.set(el.dataset.tabId, el); });
      const domOut = this._tabs.map((t) => byId.get(t.id)).filter(Boolean);
      const scrambled = domOut.some((el, i) => tabEls[i] !== el);
      if (scrambled) {
        const frag = document.createDocumentFragment();
        domOut.forEach((el) => frag.appendChild(el));
        list.appendChild(frag);
        tabEls = [...list.querySelectorAll('.ds-header-nav__tab')];
        tabEls.forEach((el) => { el.style.display = ''; });
      }
    }

    /* Available width = the tabs <nav> container minus the ··· button width.
       Use the parent <nav class="ds-header-nav__tabs"> as the budget so the
       last visible tab + ··· together stay within bounds. */
    const navEl = list.parentElement;
    /* Bail while the tab band is hidden (left-nav mode sets display:none on it):
       every tab measures 0 width, so the "keep the active tab visible" reorder
       below would compute lastFitIdx = -1 and yank the active tab to the front.
       The ResizeObserver re-runs this once the band is shown again. */
    if (!navEl || navEl.clientWidth === 0 || list.offsetParent === null) return;
    /* Reserve the ··· button + a safety margin so the last visible tab (especially
       the active one) is never left marginally overflowing and clipped by the
       list's overflow:hidden. Fallback 36 ≈ the button's real width when hidden. */
    const overflowBtnWidth = wrap.offsetWidth || 36;
    const available = navEl.clientWidth - overflowBtnWidth - 12;

    /* Active tab is sacred — it must always remain visible. If sequential
       clipping would hide it, move it into the visible window first. */
    const activeIdx = this._tabs.findIndex((t) => t.active);
    if (activeIdx >= 0) {
      const activeEl = tabEls[activeIdx];
      const activeW = activeEl?.offsetWidth || 0;
      /* Compute how many leading tabs fit alongside the active tab. */
      let acc = activeW;
      let lastFitIdx = -1;
      for (let i = 0; i < tabEls.length; i++) {
        if (i === activeIdx) continue;
        const w = tabEls[i].offsetWidth;
        if (acc + w <= available) {
          acc += w;
          lastFitIdx = i;
        } else {
          break;
        }
      }
      /* If the active tab is positioned after the natural clip point,
         physically move it into the visible window (just before clipping). */
      if (activeIdx > lastFitIdx + 1) {
        const newIdx = lastFitIdx + 1;
        const moved = this._tabs.splice(activeIdx, 1)[0];
        this._tabs.splice(newIdx, 0, moved);
        /* Re-sync DOM order to match. */
        const byId = new Map();
        tabEls.forEach((el) => { if (el.dataset.tabId) byId.set(el.dataset.tabId, el); });
        const frag = document.createDocumentFragment();
        this._tabs.forEach((t) => {
          const el = byId.get(t.id);
          if (el) frag.appendChild(el);
        });
        list.appendChild(frag);
        /* Refresh the element list after reordering. */
        tabEls.length = 0;
        list.querySelectorAll('.ds-header-nav__tab').forEach((el) => tabEls.push(el));
        tabEls.forEach((el) => { el.style.display = ''; });
      }
    }

    /* Sequential clipping: once a tab doesn't fit, every tab after it goes
       to the overflow too — even if a shorter trailing tab would have fit
       individually. Otherwise tabs would be skipped non-deterministically. */
    let acc = 0;
    let clipFromHere = false;
    this._clippedTabs = [];
    tabEls.forEach((el, i) => {
      const w = el.offsetWidth;
      if (!clipFromHere && acc + w <= available) {
        acc += w;
      } else {
        clipFromHere = true;
        el.style.display = 'none';
        this._clippedTabs.push(this._tabs[i]);
      }
    });

    /* Hide the ··· wrapper entirely when nothing's clipped — keeps the row
       clean without a stray button. */
    wrap.style.display = this._clippedTabs.length ? '' : 'none';
  }

  _renderTabs() {
    const tabsHTML = this._tabs.map((t) => `
      <a href="${escapeHtml(t.href || '#')}"
         class="ds-header-nav__tab${t.active ? ' ds-header-nav__tab--active' : ''}"
         data-tab-id="${escapeHtml(t.id)}"
         ${t.active ? 'aria-current="page"' : ''}>${escapeHtml(t.label)}</a>
    `).join('');
    /* The tabs list is wrapped in its own scrollable/clipped track so that the
       trailing overflow button lives as a sibling — always visible, never
       clipped by the tabs container's overflow:hidden. The overflow button
       opens a <ds-dropdown-menu> populated at click-time with whichever tabs
       got clipped by the container. */
    return `
      <nav class="ds-header-nav__tabs" aria-label="Primary navigation">
        <div class="ds-header-nav__tabs-list">${tabsHTML}</div>
        <div class="ds-header-nav__overflow-wrap">
          <button type="button" class="ds-header-nav__overflow"
                  data-action="overflow"
                  aria-label="More navigation items"
                  aria-expanded="false" aria-haspopup="menu">
            <ds-icon name="more-horizontal" size="20"></ds-icon>
          </button>
          <ds-dropdown-menu class="ds-header-nav__overflow-menu" type="single"
                            show-footer footer-text="Customise Menu" footer-icon="settings"></ds-dropdown-menu>
        </div>
      </nav>`;
  }

  _renderSearchBar(placeholder) {
    return `
      <ds-search-field class="ds-header-nav__search" size="small"
                       placeholder="${placeholder}" show-shortcut shortcut-label="⌘K"></ds-search-field>`;
  }

  _iconBtn(action, icon, label) {
    return `
      <button type="button" class="ds-header-nav__icon-btn"
              data-action="${action}" aria-label="${label}">
        <ds-icon name="${icon}" size="20"></ds-icon>
      </button>`;
  }

  _activateTab(id, { fromOverflow = false } = {}) {
    if (!id) return;
    const idx = this._tabs.findIndex((t) => t.id === id);
    if (idx < 0) return;

    /* When picked from overflow, place the activated tab at the *rightmost*
       position where it (and the visible tabs before it) actually fit. This
       handles wide tabs (e.g. "Software Deployment") that would otherwise be
       clipped immediately after being swapped into the last-visible slot. */
    if (fromOverflow) {
      const list  = this.querySelector('.ds-header-nav__tabs-list');
      const navEl = list?.parentElement;
      const wrap  = this.querySelector('.ds-header-nav__overflow-wrap');
      if (list && navEl) {
        const tabEls = [...list.querySelectorAll('.ds-header-nav__tab')];
        /* Reset visibility so every tab reports its real offsetWidth. */
        tabEls.forEach((el) => { el.style.display = ''; });
        const widthById = new Map();
        tabEls.forEach((el, i) => widthById.set(this._tabs[i].id, el.offsetWidth || 0));

        const wrapW     = wrap?.offsetWidth || 32;
        const available = (navEl.clientWidth || 0) - wrapW - 4;
        const activeW   = widthById.get(id) || 0;

        const others = this._tabs.filter((t) => t.id !== id);
        let acc = 0;
        let insertAt = 0;
        for (let i = 0; i < others.length; i++) {
          const w = widthById.get(others[i].id) || 0;
          if (acc + w + activeW <= available) {
            acc += w;
            insertAt = i + 1;
          } else {
            break;
          }
        }
        const moved = this._tabs[idx];
        this._tabs = others;
        this._tabs.splice(insertAt, 0, moved);
      }
    }
    this._tabs = this._tabs.map((t) => ({ ...t, active: t.id === id }));
    this._clearActiveIcon();
    this.dispatchEvent(new CustomEvent('ds-header-nav-tab-select', {
      bubbles: true, composed: true, detail: { id },
    }));

    /* Move-don't-rebuild: avoid full _render() in both paths so the customer
       dropdown, search pill, avatar, etc. don't repaint. For overflow we may
       need to reorder the tab DOM nodes; for a normal click we only need to
       toggle the active class. */
    const list = this.querySelector('.ds-header-nav__tabs-list');
    if (list) {
      if (fromOverflow) {
        /* Reorder DOM to match the new _tabs array */
        const byId = new Map();
        list.querySelectorAll('.ds-header-nav__tab').forEach((el) => {
          if (el.dataset.tabId) byId.set(el.dataset.tabId, el);
        });
        const frag = document.createDocumentFragment();
        this._tabs.forEach((t) => {
          const el = byId.get(t.id);
          if (el) frag.appendChild(el);
        });
        list.appendChild(frag);
      }
      list.querySelectorAll('.ds-header-nav__tab').forEach((el) => {
        const isActive = el.dataset.tabId === id;
        el.classList.toggle('ds-header-nav__tab--active', isActive);
        if (isActive) el.setAttribute('aria-current', 'page');
        else el.removeAttribute('aria-current');
      });
      /* Recompute clipping. Both paths reflow so a newly-active tab that
         sequential clipping had hidden (e.g. a late "Support" tab) is pulled
         into the visible window by the "active is sacred" step — never left
         highlighted-but-hidden in the ··· menu. Overflow path defers a frame
         (its own placement already ran); a normal click reflows synchronously
         so the row is right before first paint. */
      if (typeof this._reflowOverflow === 'function') {
        if (fromOverflow) requestAnimationFrame(() => this._reflowOverflow());
        else this._reflowOverflow();
      }
    }
  }

  /* Public: highlight a tab WITHOUT firing ds-header-nav-tab-select. For the
     shell to sync the header when navigation happens programmatically (deep link,
     or the left-rail driving selectTab) — calling _activateTab there would loop
     back through the event. Idempotent + no rebuild, so it's safe to call on
     every selectTab (a normal click already left the header on this tab). */
  /* Compact-mode nav menu (hamburger). Toggling emits ds-header-nav-menu-toggle
     so the host shell can open/close its off-canvas nav; setMenuOpen lets the
     shell push state back (e.g. when the drawer is closed by the backdrop). */
  _toggleMenu() {
    const open = this.querySelector('.ds-header-nav__menu-kebab')?.getAttribute('aria-expanded') === 'true';
    this.setMenuOpen(!open);
    this.dispatchEvent(new CustomEvent('ds-header-nav-menu-toggle', {
      bubbles: true, composed: true, detail: { open: !open },
    }));
  }
  setMenuOpen(open) {
    const btn = this.querySelector('.ds-header-nav__menu-kebab');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  /* Keep the compact-mode "current page" label in sync with the active tab. */
  _syncCurrent() {
    const el = this.querySelector('.ds-header-nav__current');
    if (!el) return;
    const active = (this._tabs || []).find((t) => t.active);
    el.textContent = active ? active.label : '';
  }

  setActiveTab(id) {
    this._tabs = this._tabs.map((t) => ({ ...t, active: t.id === id }));
    this._syncCurrent();
    const list = this.querySelector('.ds-header-nav__tabs-list');
    if (!list) return;
    list.querySelectorAll('.ds-header-nav__tab').forEach((el) => {
      const isActive = el.dataset.tabId === id;
      el.classList.toggle('ds-header-nav__tab--active', isActive);
      if (isActive) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    /* Re-run the overflow reflow: the newly-active tab may be one that sequential
       clipping had hidden in the ··· menu. The reflow's "active is sacred" step
       pulls it back into the visible window so its highlight is never on a
       clipped/hidden tab. Synchronous so the row is correct before first paint. */
    this._reflowOverflow();
  }

  /* Close any other open menu in this header so only one is open at a time. */
  _closeOtherMenus(except) {
    const customerMenu = this.querySelector('.ds-header-nav__customer-menu');
    const customerBtn  = this.querySelector('.ds-header-nav__customer');
    const overflowMenu = this.querySelector('.ds-header-nav__overflow-menu');
    const overflowBtn  = this.querySelector('[data-action="overflow"]');
    if (except !== 'customer' && customerMenu?.hasAttribute('open')) {
      customerMenu.close?.();
      customerBtn?.setAttribute('aria-expanded', 'false');
    }
    if (except !== 'overflow' && overflowMenu?.hasAttribute('open')) {
      overflowMenu.close?.();
      overflowBtn?.setAttribute('aria-expanded', 'false');
    }
  }

  /* Open/close the customer selector dropdown. Populated from the `customers`
     property; falls back to a sample EC list. */
  _toggleCustomerMenu() {
    const menu = this.querySelector('.ds-header-nav__customer-menu');
    const btn  = this.querySelector('.ds-header-nav__customer');
    if (!menu || !btn) return;

    if (menu.hasAttribute('open')) {
      menu.close?.();
      btn.setAttribute('aria-expanded', 'false');
      return;
    }

    this._closeOtherMenus('customer');

    const list = (this._customers && this._customers.length ? this._customers : DEFAULT_CUSTOMERS);
    const current = this.getAttribute('customer-label') || 'All Customers';
    menu.items = list.map((c) => ({
      label: c.label || c,
      value: c.value || c.label || c,
      selected: (c.label || c) === current,
    }));
    menu.open?.();
    btn.setAttribute('aria-expanded', 'true');
  }

  /* Open/close the overflow dropdown. Clipped tabs are pre-computed by
     `_reflowOverflow` after every render, so this just feeds them in. */
  _toggleOverflowMenu() {
    const menu = this.querySelector('.ds-header-nav__overflow-menu');
    const btn  = this.querySelector('[data-action="overflow"]');
    if (!menu || !btn) return;

    if (menu.hasAttribute('open')) {
      menu.close?.();
      btn.setAttribute('aria-expanded', 'false');
      return;
    }
    this._closeOtherMenus('overflow');

    const clipped = this._clippedTabs || [];
    if (clipped.length === 0) return;

    menu.items = clipped.map((t) => ({
      label: t.label,
      value: t.id,
      selected: !!t.active,
      newTag: !!t.newTag,
    }));

    menu.open?.();
    btn.setAttribute('aria-expanded', 'true');
  }

  _wire(isTopNav) {
    /* Tab clicks (endpoint-central) */
    if (isTopNav) {
      this.querySelectorAll('[data-tab-id]').forEach((a) => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          this._activateTab(a.dataset.tabId);
        });
      });

      /* Overflow ··· — populate the dropdown with clipped tabs and open it. */
      const overflowBtn = this.querySelector('[data-action="overflow"]');
      const overflowMenu = this.querySelector('.ds-header-nav__overflow-menu');
      if (overflowBtn && overflowMenu) {
        overflowBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._toggleOverflowMenu();
        });
        overflowMenu.addEventListener('ds-dropdown-select', (e) => {
          this._activateTab(e.detail?.value, { fromOverflow: true });
          overflowMenu.close?.();
          overflowBtn.setAttribute('aria-expanded', 'false');
        });
        /* Outside-click close is handled once by this._onDocClick (see
           constructor / connectedCallback) — not per-render here. */
      }
    }

    /* Search submit (Enter) — re-emit from the ds-search-field component. */
    const searchField = this.querySelector('ds-search-field.ds-header-nav__search');
    if (searchField) {
      searchField.addEventListener('ds-search-field-submit', (e) => {
        this.dispatchEvent(new CustomEvent('ds-header-nav-search', {
          bubbles: true, composed: true, detail: { value: e.detail?.value ?? '' },
        }));
      });
    }

    /* Customer selector — opens dropdown */
    const customerBtn  = this.querySelector('[data-action="customer-selector"]');
    const customerMenu = this.querySelector('.ds-header-nav__customer-menu');
    if (customerBtn && customerMenu) {
      customerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleCustomerMenu();
      });
      customerMenu.addEventListener('ds-dropdown-select', (e) => {
        const id = e.detail?.value;
        const item = (this._customers || DEFAULT_CUSTOMERS).find((c) => (c.value || c) === id);
        if (item) {
          const label = item.label || item;
          this.setAttribute('customer-label', label);
          const labelEl = this.querySelector('.ds-header-nav__customer-label');
          if (labelEl) labelEl.textContent = label;
          customerMenu.close?.();
          customerBtn.setAttribute('aria-expanded', 'false');
          this.dispatchEvent(new CustomEvent('ds-header-nav-customer', {
            bubbles: true, composed: true, detail: { value: id, label },
          }));
        }
      });
      /* Outside-click close is handled once by this._onDocClick (see
         constructor / connectedCallback) — not per-render here. */
    }

    /* Utility cluster + overflow.
       Icon buttons (notifications, settings, etc.) get a mutually-exclusive
       active highlight — picking one clears the tab highlight, and vice versa.
       Skip transient triggers (search, avatar, overflow, customer-selector, bento)
       which are dropdown / slide-over openers, not destinations. */
    const NON_DESTINATION = new Set(['customer-selector', 'search', 'avatar', 'overflow', 'bento', 'bookmark', 'notifications']);
    this.querySelectorAll('[data-action]').forEach((btn) => {
      if (btn.dataset.action === 'customer-selector') return;  // already wired
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (!NON_DESTINATION.has(action) && btn.classList.contains('ds-header-nav__icon-btn')) {
          this._setActiveIcon(action);
        }
        this.dispatchEvent(new CustomEvent('ds-header-nav-action', {
          bubbles: true, composed: true, detail: { action },
        }));
      });
    });
  }

  /* Mark the icon button matching `action` as active, clear the rest,
     and remove any active tab so the highlight is mutually exclusive. */
  _setActiveIcon(action) {
    this.querySelectorAll('.ds-header-nav__icon-btn').forEach((b) => {
      const isActive = b.dataset.action === action;
      b.classList.toggle('ds-header-nav__icon-btn--active', isActive);
      if (isActive) b.setAttribute('aria-pressed', 'true');
      else b.removeAttribute('aria-pressed');
    });
    this.querySelectorAll('.ds-header-nav__tab').forEach((el) => {
      el.classList.remove('ds-header-nav__tab--active');
      el.removeAttribute('aria-current');
    });
    this._tabs = this._tabs.map((t) => ({ ...t, active: false }));
  }

  /* Public: clear icon-btn highlight (called when a tab is activated). */
  _clearActiveIcon() {
    this.querySelectorAll('.ds-header-nav__icon-btn--active, .ds-header-nav__icon-btn[aria-pressed="true"]').forEach((b) => {
      b.classList.remove('ds-header-nav__icon-btn--active');
      b.removeAttribute('aria-pressed');
    });
  }

  set customers(v) { this._customers = Array.isArray(v) ? v.slice() : null; }
  get customers() { return this._customers || DEFAULT_CUSTOMERS; }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-header-nav')) {
  customElements.define('ds-header-nav', DsHeaderNav);
}
