import { boolAttr, enumAttr } from '../../utils/attr.js';
/* Reuse existing design-system components — register them as dependencies so the
   page header works on any page that loads page-header.js. Breadcrumb, tabs,
   status, divider, icon-button all delegate to the real components; Buttons/Badge
   are consumer-slotted. */
import '../divider/divider.js';
import '../icon-button/icon-button.js';
import '../tab-bar-horizontal/tab-bar-horizontal.js';
import '../status-indicator/status-indicator.js';
import '../breadcrumb/breadcrumb.js';
import '../description-list/description-list.js';
import '../dropdown-menu/dropdown-menu.js';

/* Auto-load the CSS of the components this one composes (light-DOM, so their
   stylesheets must be present even on pages that don't <link> them). Guarded +
   idempotent — no-ops if the page already linked them. */
function _injectCss(id, rel) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = new URL(rel, import.meta.url).href;
  document.head.appendChild(l);
}
[
  ['ds-ph-css', './page-header.css'],
  ['ds-ph-divider-css', '../divider/divider.css'],
  ['ds-ph-iconbtn-css', '../icon-button/icon-button.css'],
  ['ds-ph-tabbar-css', '../tab-bar-horizontal/tab-bar-horizontal.css'],
  ['ds-ph-status-css', '../status-indicator/status-indicator.css'],
  ['ds-ph-breadcrumb-css', '../breadcrumb/breadcrumb.css'],
  ['ds-ph-dl-css', '../description-list/description-list.css'],
  ['ds-ph-dropdown-css', '../dropdown-menu/dropdown-menu.css'],
].forEach(([id, rel]) => _injectCss(id, rel));

/* `structure` is kept only as a backward-compatible shorthand; the real model is
   the independent booleans (matches the refactored Figma component). */
const STRUCTURES = ['default', 'with-summary', 'with-tabs', 'full'];
const SLOT_NAMES = ['badge', 'actions', 'description'];

export class DsPageHeader extends HTMLElement {
  static get observedAttributes() {
    return [
      'structure', 'title', 'description',
      'show-breadcrumbs', 'show-back', 'show-chevron', 'show-star', 'show-badge',
      'show-filter', 'icon', 'show-icon',
      'show-description', 'show-actions', 'show-overflow',
      'show-summary', 'show-tabs', 'show-divider', 'rtl',
      'collapse-on-scroll', 'scroll-target',
    ];
  }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, 'breadcrumbs')) { this._pendingBc = this.breadcrumbs; delete this.breadcrumbs; }
    if (Object.prototype.hasOwnProperty.call(this, 'summary'))     { this._pendingSummary = this.summary; delete this.summary; }
    if (Object.prototype.hasOwnProperty.call(this, 'tabs'))        { this._pendingTabs = this.tabs; delete this.tabs; }
    if (Object.prototype.hasOwnProperty.call(this, 'titleMenu'))   { this._pendingTitleMenu = this.titleMenu; delete this.titleMenu; }
    this._breadcrumbs = []; this._summary = []; this._tabs = []; this._titleMenu = [];
    this._slots = { badge: [], actions: [], description: [] };
    this._title = '';
    this._actionOverflow = null;   /* the ⋮ + dropdown built on demand */
    this._hiddenActions = [];      /* actions currently folded into the ⋮ menu */
    this._actionsCollapsed = false;
    /* Close fns for any open inline menu (title / action-overflow), so their
       document-level outside-click listeners are dropped on disconnect. */
    this._pendingCloses = new Set();
  }

  /* `title` is our heading prop, but it is ALSO the reserved global HTML
     attribute the browser renders as a native tooltip over the WHOLE element.
     Capture the value internally and strip the attribute so no tooltip appears;
     the `title="…"` authoring API keeps working. The strip is guarded so the
     resulting attributeChangedCallback doesn't re-enter and clobber the value. */
  _captureTitle() {
    if (!this.hasAttribute('title')) return;
    this._title = this.getAttribute('title') || '';
    this._suppressTitleObs = true;
    this.removeAttribute('title');
    this._suppressTitleObs = false;
  }

  connectedCallback() {
    if (!this._root) {
      /* Light-DOM "slots": capture consumer-provided [slot] children BEFORE we
         clear innerHTML, hold the node references, and re-home them into the
         rendered placeholders each render. (Real <slot> only works in shadow DOM.) */
      SLOT_NAMES.forEach((s) => { this._slots[s] = Array.from(this.querySelectorAll(`:scope > [slot="${s}"]`)); });
      Object.values(this._slots).flat().forEach((n) => n.remove());
      this.innerHTML = '';
      this._root = document.createElement('header');
      this.appendChild(this._root);
    }
    if (this._pendingBc !== undefined) { this.breadcrumbs = this._pendingBc; this._pendingBc = undefined; }
    if (this._pendingSummary !== undefined) { this.summary = this._pendingSummary; this._pendingSummary = undefined; }
    if (this._pendingTabs !== undefined) { this.tabs = this._pendingTabs; this._pendingTabs = undefined; }
    if (this._pendingTitleMenu !== undefined) { this.titleMenu = this._pendingTitleMenu; this._pendingTitleMenu = undefined; }
    this._captureTitle();
    this._render();
    /* Static HTML has [slot] children at parse time; frameworks (Ember/React/Vue)
       insert them AFTER the element upgrades, so the capture above misses them.
       Watch for late [slot] direct children (e.g. actions) and re-home them. */
    if (!this._projectObs) {
      this._projectObs = new MutationObserver(() => this._reprojectSlots());
      this._projectObs.observe(this, { childList: true });
    }
    if (this.hasAttribute('collapse-on-scroll')) this._setupScrollCollapse();
    /* Watch the header's own width so actions fold into a ⋮ overflow when the
       header is narrow (container-based; works in a panel, not just a viewport).
       Defer observe() to the next frame — observing synchronously during the
       connectedCallback upgrade can miss later size changes in some engines. */
    if (typeof ResizeObserver !== 'undefined' && !this._ro) {
      this._ro = new ResizeObserver(() => this._fitActions());
      /* Observe the inner header (`_root`) — a reliable full-width flex block —
         not the inline host, whose size changes RO may not deliver. */
      requestAnimationFrame(() => { if (this.isConnected && this._ro && this._root) this._ro.observe(this._root); });
    }
    /* Fallback: viewport resizes always re-fit (RO delivery on the injected
       header can be unreliable across shells; a window listener is dependable
       for the dominant case). Throttled to one rAF. */
    if (!this._onWinResize) {
      this._onWinResize = () => {
        if (this._fitRaf) return;
        this._fitRaf = requestAnimationFrame(() => { this._fitRaf = null; this._fitActions(); });
      };
      window.addEventListener('resize', this._onWinResize);
    }
    this._fitActions();
  }

  disconnectedCallback() {
    this._teardownScrollCollapse();
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._projectObs) { this._projectObs.disconnect(); this._projectObs = null; }
    if (this._onWinResize) { window.removeEventListener('resize', this._onWinResize); this._onWinResize = null; }
    /* Drop any open inline-menu outside-click listener (title / action overflow). */
    this._pendingCloses.forEach((fn) => fn());
    this._pendingCloses.clear();
  }

  /* Re-home [slot] children a framework inserted AFTER the initial capture (they
     leak in as direct children of the host, outside `_root`). Idempotent: once a
     slot node is homed into its placeholder it is no longer a `:scope >` child. */
  _reprojectSlots() {
    const stray = SLOT_NAMES.some((s) => this.querySelector(`:scope > [slot="${s}"]`));
    if (!stray) return;
    SLOT_NAMES.forEach((s) => {
      const late = Array.from(this.querySelectorAll(`:scope > [slot="${s}"]`));
      if (late.length) { this._slots[s] = late; late.forEach((n) => n.remove()); }
    });
    this._render();
    this._fitActions();
  }

  attributeChangedCallback(name) {
    /* Our own strip of the `title` attribute — ignore so it doesn't clobber. */
    if (name === 'title' && this._suppressTitleObs) return;
    /* A consumer (re)set the title attribute: capture + strip to kill the native
       tooltip, then render. */
    if (name === 'title') this._captureTitle();
    if (this._root) this._render();
    if (name === 'collapse-on-scroll' || name === 'scroll-target') {
      this._teardownScrollCollapse();
      if (this.hasAttribute('collapse-on-scroll')) this._setupScrollCollapse();
    }
  }

  /* ── Collapse-on-scroll ──────────────────────────────────────────────
     Scroll down → collapse to title + actions (hide breadcrumbs, description,
     summary). Scroll up → restore. Tabs, if present, stay pinned/visible.
     The scroll source is: an explicit `scroll-target` selector, else the
     nearest scrollable ancestor (header is inside the scroller → pin it
     sticky), else a scrollable element beneath the header's parent. */
  _findScroller() {
    const sel = this.getAttribute('scroll-target');
    if (sel) {
      /* Resolve the selector SCOPED to the header's own view first. Several
         injected views can share a class (e.g. `.lay__scroll`), so a global
         document.querySelector would grab the FIRST match — often a hidden
         sibling view that never scrolls. Walk up from the header and return the
         nearest ancestor subtree's match; fall back to a document-wide lookup. */
      let scope = this.parentElement;
      while (scope) { const hit = scope.querySelector(sel); if (hit) return hit; scope = scope.parentElement; }
      const t = (this.getRootNode() || document).querySelector(sel);
      if (t) return t;
    }
    const scrollable = (n) => { const oy = getComputedStyle(n).overflowY; return oy === 'auto' || oy === 'scroll'; };
    let node = this.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      if (scrollable(node)) return node;
      node = node.parentElement;
    }
    if (this.parentElement) {
      const inner = Array.from(this.parentElement.querySelectorAll(':scope > *')).find((n) => n !== this && scrollable(n));
      if (inner) return inner;
    }
    return null;
  }

  _setupScrollCollapse() {
    if (this._scroller) return;
    const el = this._findScroller();
    /* Fall back to the window/document when there's no scrollable container
       (e.g. dashboards whose content simply overflows the page). */
    const useWindow = !el;
    const target = el || window;
    this._scroller = target;
    this._readTop = useWindow
      ? () => window.scrollY || document.documentElement.scrollTop || 0
      : () => el.scrollTop;
    this._lastScroll = this._readTop();
    /* Marks the feature as active so the CSS can apply the collapse transition
       (independent of whether the header is pinned). */
    this.classList.add('ds-page-header--collapsible');
    /* Pin sticky when the header lives INSIDE the scroller, or when the whole
       window scrolls; a header that's a sibling above an inner scroll region is
       already fixed in place, so it isn't pinned. */
    if (useWindow || el.contains(this)) this.classList.add('ds-page-header--sticky');
    const THRESH = 8;
    /* Remaining scroll below the current position. When the header is a sibling
       ABOVE the scroller, collapsing it shrinks the header and grows the scroll
       viewport → maxScrollTop drops → the browser CLAMPS scrollTop down. That clamp
       fires a scroll event that looks like "scrolled up" and would re-expand the
       header (growing it, re-collapsing…) = the jitter near the end. So we ignore an
       upward delta while pinned at the bottom — it's the clamp, not the user. */
    const bottomGap = () => useWindow
      ? (document.documentElement.scrollHeight - window.innerHeight - this._readTop())
      : (el.scrollHeight - el.clientHeight - el.scrollTop);
    this._onScroll = () => {
      const y = this._readTop();
      const atBottom = bottomGap() <= 2;
      if (y <= THRESH) this._applyCollapsed(false);
      else if (y > this._lastScroll + 2) this._applyCollapsed(true);
      else if (y < this._lastScroll - 2 && !atBottom) this._applyCollapsed(false);
      this._lastScroll = y;
    };
    target.addEventListener('scroll', this._onScroll, { passive: true });
  }

  /* Toggle the collapsed class AND shrink the slotted action buttons to xsmall
     while collapsed (restoring their original size on expand). Uses each
     button's own `size` attribute so the button's sizing system stays in charge. */
  _applyCollapsed(collapsed) {
    if (this._collapsedState === collapsed) return;
    this._collapsedState = collapsed;
    this.classList.toggle('ds-page-header--collapsed', collapsed);
    this._slots.actions.forEach((node) => {
      if (!node || !node.querySelectorAll) return;
      const btns = (node.tagName && node.tagName.toLowerCase() === 'ds-button')
        ? [node] : Array.from(node.querySelectorAll('ds-button'));
      btns.forEach((b) => {
        if (collapsed) {
          if (b._phPrevSize === undefined) b._phPrevSize = b.getAttribute('size');
          b.setAttribute('size', 'xsmall');
        } else if (b._phPrevSize !== undefined) {
          if (b._phPrevSize === null) b.removeAttribute('size');
          else b.setAttribute('size', b._phPrevSize);
          b._phPrevSize = undefined;
        }
      });
    });
  }

  _teardownScrollCollapse() {
    if (this._scroller && this._onScroll) this._scroller.removeEventListener('scroll', this._onScroll);
    this._applyCollapsed(false);   // restore action-button sizes before tearing down
    this._collapsedState = undefined;
    this._scroller = null; this._onScroll = null; this._readTop = null;
    this.classList.remove('ds-page-header--collapsed', 'ds-page-header--sticky', 'ds-page-header--collapsible');
  }

  set breadcrumbs(v) { this._breadcrumbs = Array.isArray(v) ? v : []; if (this._root) this._render(); }
  get breadcrumbs() { return this._breadcrumbs; }
  set summary(v) { this._summary = Array.isArray(v) ? v : []; if (this._root) this._render(); }
  get summary() { return this._summary; }
  set tabs(v) { this._tabs = Array.isArray(v) ? v : []; if (this._root) this._render(); }
  /* Title dropdown items: `[{ label, value?, icon? }, ...]`. When non-empty, the
     title chevron toggles a ds-dropdown-menu of these instead of only firing an
     event. Selecting one emits `ds-page-header-title-select`. */
  set titleMenu(v) { this._titleMenu = Array.isArray(v) ? v : []; if (this._root) this._render(); }
  get titleMenu() { return this._titleMenu; }
  get tabs() { return this._tabs; }

  _esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  _render() {
    /* Ensure any late-set title attribute is captured + stripped before we read. */
    this._captureTitle();
    const title = this._title || 'Page Title';
    const description = this.getAttribute('description') || '';
    const rtl = boolAttr(this, 'rtl');
    const hasStructure = this.hasAttribute('structure');
    const structure = enumAttr(this, 'structure', STRUCTURES, 'default');

    const showBreadcrumbs = !this.hasAttribute('show-breadcrumbs') || this.getAttribute('show-breadcrumbs') !== 'false';
    /* Opt-in toggles (default OFF): the attribute PRESENT (or ="true") enables;
       ="false" disables. Presence-only (bare hasAttribute) would treat
       show-star="false" as ON — a common authoring gotcha that broke the docs
       playground. This mirrors how show-breadcrumbs already reads. */
    const optIn = (name) => this.hasAttribute(name) && this.getAttribute(name) !== 'false';
    const showBack = optIn('show-back');
    /* Defaults match the refactored Figma component: chevron / star / badge OFF. */
    const showChevron = optIn('show-chevron');
    const showStar = optIn('show-star');
    /* Advanced-filter affordance — a filter icon button beside the title that
       stays hidden until the title row is hovered/focused (CSS). Emits
       `ds-page-header-filter` on click for the page to open its filter UI. */
    const showFilter = optIn('show-filter');
    const showBadge = this.hasAttribute('show-badge') ? this.getAttribute('show-badge') !== 'false' : this._slots.badge.length > 0;
    /* Leading title icon — shown whenever `icon` is set (opt out with show-icon="false"). */
    const icon = this.getAttribute('icon') || '';
    const showIcon = !!icon && this.getAttribute('show-icon') !== 'false';
    /* Description may be a plain-text attribute OR slotted rich content
       (`<span slot="description">… <ds-text-link>…</ds-text-link></span>`) for an
       inline link at the end of the sentence. Slotted content wins when present. */
    const hasSlotDescription = this._slots.description.length > 0;
    const showDescription = hasSlotDescription
      ? this.getAttribute('show-description') !== 'false'
      : (optIn('show-description') && !!description);
    const showActions = !this.hasAttribute('show-actions') || this.getAttribute('show-actions') !== 'false';
    /* Overflow ⋮ is OFF by default — opt in with the `show-overflow` attribute
       (a page/consumer that wants a header overflow menu adds it explicitly). */
    const showOverflow = this.hasAttribute('show-overflow') && this.getAttribute('show-overflow') !== 'false';

    /* Summary / Tabs are independent booleans (or derived from data / the legacy
       `structure` shorthand). */
    const showSummary = hasStructure
      ? (structure === 'with-summary' || structure === 'full')
      : (boolAttr(this, 'show-summary') || this._summary.length > 0);
    const showTabs = hasStructure
      ? (structure === 'with-tabs' || structure === 'full')
      : (boolAttr(this, 'show-tabs') || this._tabs.length > 0);
    /* Separator rule: the tab bar's own underline IS the bottom rule, so show the
       standalone divider only when the tab bar isn't actually rendered — i.e. no
       real tabs exist, even if `showTabs`/structure implies a tab row (otherwise a
       tabless "full"/"with-tabs" header would lose its bottom border). Override
       with show-divider. */
    const tabsRendered = showTabs && this._tabs.length > 0;
    const showDivider = this.hasAttribute('show-divider') ? boolAttr(this, 'show-divider') : !tabsRendered;

    this._root.className = 'ds-page-header';
    if (rtl) this._root.setAttribute('dir', 'rtl'); else this._root.removeAttribute('dir');

    /* Breadcrumb delegates to the real <ds-breadcrumb> — it handles separators,
       current-page marking, RTL and overflow. We just feed it <a>/<span> items
       (last = current page as a <span>); collapse to overflow past 4 crumbs. */
    const bcHTML = showBreadcrumbs && this._breadcrumbs.length
      ? `<ds-breadcrumb class="ds-page-header__breadcrumbs"${rtl ? ' rtl' : ''}${this._breadcrumbs.length > 4 ? ' overflow' : ''}>${
          this._breadcrumbs.map((b, i) => {
            const last = i === this._breadcrumbs.length - 1;
            return last
              ? `<span>${this._esc(b.label)}</span>`
              : `<a href="${b.href || '#'}">${this._esc(b.label)}</a>`;
          }).join('')
        }</ds-breadcrumb>`
      : '';

    /* Summary metadata delegates to the real <ds-description-list> in
       `horizontal-auto` (term hugs its value); page-header CSS lays the pairs out
       as a wrapping horizontal strip. `.items` is set after render (property). */
    const summaryHTML = showSummary && this._summary.length
      ? `<div class="ds-page-header__summary">
           <ds-description-list orientation="horizontal-auto"${rtl ? ' rtl' : ''} data-ph-summary></ds-description-list>
         </div>`
      : '';

    /* Tabs delegate to the real <ds-tab-bar-horizontal>. */
    const tabsHTML = showTabs && this._tabs.length
      ? `<div class="ds-page-header__tabs"><ds-tab-bar-horizontal type="underline" ${rtl ? 'rtl' : ''} data-page-header-tabs></ds-tab-bar-horizontal></div>`
      : '';

    const backIcon = rtl ? 'arrow-narrow-right' : 'arrow-narrow-left';

    this._root.innerHTML = `
      ${bcHTML}
      <div class="ds-page-header__title-row">
        ${/* Back + leading icon are common to the whole title+description block:
            they sit to its left (icon in a grey tile), not inline with the title. */''}
        <div class="ds-page-header__title-main">
          ${showBack ? `<button class="ds-page-header__back" type="button" aria-label="${rtl ? 'رجوع' : 'Back'}" data-back><ds-icon name="${backIcon}" size="20"></ds-icon></button>` : ''}
          ${showIcon ? `<span class="ds-page-header__icon" aria-hidden="true"><ds-icon name="${this._esc(icon)}" size="24"></ds-icon></span>` : ''}
          <div class="ds-page-header__title-stack">
            <div class="ds-page-header__leading">
              <h1 class="ds-page-header__title">${this._esc(title)}</h1>
              ${showChevron ? `<span class="ds-page-header__title-menu">
                <ds-icon-button class="ds-page-header__chevron" shape="square" type="tertiary-grey" size="small" icon="chevron-down" label="Title menu" no-tooltip aria-haspopup="menu" aria-expanded="false" data-chevron></ds-icon-button>
                ${this._titleMenu.length ? `<ds-dropdown-menu class="ds-page-header__title-menu-dd" type="default" data-title-dd></ds-dropdown-menu>` : ''}
              </span>` : ''}
              ${showStar ? `<button class="ds-page-header__star" type="button" aria-label="Add to favourites" aria-pressed="false" data-star><ds-icon name="star" size="20"></ds-icon></button>` : ''}
              ${showFilter ? `<ds-icon-button class="ds-page-header__title-filter" shape="square" type="tertiary-grey" size="small" icon="filter" label="Advanced filter" tooltip-position="bottom" data-title-filter></ds-icon-button>` : ''}
              ${showBadge ? `<span class="ds-page-header__badge" data-slot="badge"></span>` : ''}
            </div>
            ${/* Subtitle row: summary items OR description — one at a time. Summary
                wins when it has content; otherwise fall back to the description. */''}
            ${summaryHTML || (showDescription
              ? (hasSlotDescription
                  ? `<p class="ds-page-header__description" data-slot="description"></p>`
                  : `<p class="ds-page-header__description">${this._esc(description)}</p>`)
              : '')}
          </div>
        </div>
        ${(showActions || showOverflow) ? `<div class="ds-page-header__actions">
          ${showActions ? `<span class="ds-page-header__action-slot" data-slot="actions"></span>` : ''}
          ${showOverflow ? `<ds-icon-button class="ds-page-header__overflow" shape="square" type="tertiary-grey" size="xl" icon="more-vertical" label="More actions" data-overflow></ds-icon-button>` : ''}
        </div>` : ''}
      </div>
      ${tabsHTML}
      ${showDivider ? `<div class="ds-page-header__divider"><ds-divider></ds-divider></div>` : ''}
    `;

    /* Re-home captured light-DOM slot content. */
    if (showBadge)   { const h = this._root.querySelector('[data-slot="badge"]');   this._slots.badge.forEach((n) => h && h.appendChild(n)); }
    if (showActions) { const h = this._root.querySelector('[data-slot="actions"]'); this._slots.actions.forEach((n) => h && h.appendChild(n)); }
    if (showDescription && hasSlotDescription) { const h = this._root.querySelector('[data-slot="description"]'); this._slots.description.forEach((n) => h && h.appendChild(n)); }

    this._root.querySelector('[data-back]')?.addEventListener('click', () => this.dispatchEvent(new CustomEvent('ds-page-header-back', { bubbles: true })));
    this._root.querySelector('[data-overflow]')?.addEventListener('click', () => this.dispatchEvent(new CustomEvent('ds-page-header-overflow', { bubbles: true })));
    this._root.querySelector('[data-title-filter]')?.addEventListener('click', () => this.dispatchEvent(new CustomEvent('ds-page-header-filter', { bubbles: true })));
    /* Title chevron: with `titleMenu` items, toggle a real dropdown (its items
       proxy back a `ds-page-header-title-select`); without items, keep the
       original event-only behavior for consumers that own their own menu. */
    const chevron = this._root.querySelector('[data-chevron]');
    const titleDd = this._root.querySelector('[data-title-dd]');
    if (chevron && titleDd && this._titleMenu.length) {
      titleDd.items = this._titleMenu.map((it, i) => ({
        label: it.label,
        value: it.value != null ? String(it.value) : String(i),
        icon: it.icon,
      }));
      const closeDd = () => { titleDd.removeAttribute('open'); chevron.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', onDoc, true); this._pendingCloses.delete(closeDd); };
      const openDd  = () => { titleDd.setAttribute('open', ''); chevron.setAttribute('aria-expanded', 'true'); document.addEventListener('click', onDoc, true); this._pendingCloses.add(closeDd); this.dispatchEvent(new CustomEvent('ds-page-header-title-menu', { bubbles: true })); };
      const onDoc = (e) => { if (!chevron.parentNode.contains(e.target)) closeDd(); };
      chevron.addEventListener('click', (e) => { e.stopPropagation(); titleDd.hasAttribute('open') ? closeDd() : openDd(); });
      titleDd.addEventListener('ds-dropdown-select', (e) => {
        const value = e.detail?.value;
        const item = this._titleMenu.find((it, i) => (it.value != null ? String(it.value) : String(i)) === value);
        const ev = new CustomEvent('ds-page-header-title-select', { bubbles: true, cancelable: true, detail: { item, value } });
        this.dispatchEvent(ev);
        /* Default: reflect the chosen item as the new title (record-switcher
           pattern). A consumer whose title menu is a set of ACTIONS can call
           preventDefault() to keep the current title. */
        if (!ev.defaultPrevented && item && item.label != null) {
          this._title = item.label;
          this._render();   // updates the <h1> + rebuilds a closed menu
        } else {
          closeDd();
        }
      });
      titleDd.addEventListener('ds-dropdown-close', closeDd);
    } else if (chevron) {
      chevron.addEventListener('click', () => this.dispatchEvent(new CustomEvent('ds-page-header-title-menu', { bubbles: true })));
    }
    const star = this._root.querySelector('[data-star]');
    star?.addEventListener('click', () => {
      const next = star.getAttribute('aria-pressed') !== 'true';
      star.setAttribute('aria-pressed', String(next));
      this.dispatchEvent(new CustomEvent('ds-page-header-star', { bubbles: true, detail: { starred: next } }));
    });

    const tabBar = this._root.querySelector('[data-page-header-tabs]');
    if (tabBar) {
      const items = this._tabs.map((t, i) => ({
        id: t.id || `tab-${i}`, label: t.label, icon: t.icon,
        badge: t.count != null ? t.count : undefined, disabled: !!t.disabled,
      }));
      const activeIdx = this._tabs.findIndex((t) => t.active);
      const activeId = items[activeIdx >= 0 ? activeIdx : 0]?.id;
      if (activeId) tabBar.setAttribute('active-id', activeId);
      tabBar.items = items;
      tabBar.addEventListener('ds-tab-change', (e) => {
        const id = e.detail?.id;
        const idx = items.findIndex((it) => it.id === id);
        if (idx >= 0) {
          this._tabs.forEach((t, k) => { t.active = (k === idx); });
          this.dispatchEvent(new CustomEvent('ds-page-header-tab', { bubbles: true, detail: { tab: this._tabs[idx] } }));
        }
      });
    }

    /* Feed the summary <ds-description-list> (items is a property). Map the
       header's summary model → term/value(+status) pairs. */
    const summaryDl = this._root.querySelector('[data-ph-summary]');
    if (summaryDl) {
      summaryDl.items = this._summary.map((s) => ({
        term: s.label,
        description: s.value != null ? String(s.value) : '',
        status: s.status || undefined,
      }));
    }

    /* Render just rebuilt the DOM (dropping any prior ⋮ overflow) — re-evaluate
       whether actions need to fold at the current width. */
    this._actionsCollapsed = false;
    this._fitActions();
  }

  /* ── Actions overflow — fold secondary actions into a ⋮ menu when the header is
     narrow (≤480px) and carries 2+ actions. The last action (primary, rightmost
     per convention) stays visible; the rest move into the dropdown, which
     proxy-clicks the original button so consumer handlers still fire. ── */
  _fitActions() {
    if (!this._root) return;
    const wrap = this._root.querySelector('.ds-page-header__actions');
    const slot = this._root.querySelector('.ds-page-header__action-slot');
    if (!wrap || !slot) return;
    const nodes = this._slots.actions;
    /* Measure the inner header (`_root`) — it's the flex block that always fills
       the available width and IS the CSS query container. The host element is
       display:inline in light DOM (the `:host` rule can't style it), so its own
       width is unreliable. */
    const width = this._root.getBoundingClientRect().width;
    const shouldCollapse = nodes.length >= 2 && width > 0 && width <= 480;
    if (shouldCollapse) this._collapseActions(nodes, wrap);
    else this._expandActions(nodes);
  }

  _collapseActions(nodes, wrap) {
    /* Already folded and the ⋮ is still mounted → nothing to do (guards RO churn). */
    if (this._actionsCollapsed && this._actionOverflow?.isConnected) return;

    const hidden = [];
    nodes.forEach((n, i) => {
      const keep = i === nodes.length - 1;               // keep the primary (last)
      n.style.display = keep ? '' : 'none';
      if (!keep) hidden.push({ node: n, label: (n.textContent || '').trim() || 'Action' });
    });
    this._hiddenActions = hidden;

    let ov = this._actionOverflow;
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'ds-page-header__actions-overflow';
      const btn = document.createElement('ds-icon-button');
      btn.setAttribute('shape', 'square'); btn.setAttribute('type', 'tertiary-grey');
      btn.setAttribute('size', 'xl'); btn.setAttribute('icon', 'more-vertical');
      btn.setAttribute('label', 'More actions'); btn.setAttribute('no-tooltip', '');
      btn.setAttribute('aria-haspopup', 'menu'); btn.setAttribute('aria-expanded', 'false');
      const dd = document.createElement('ds-dropdown-menu');
      dd.setAttribute('type', 'default');
      dd.classList.add('ds-page-header__actions-overflow-dd');
      ov.append(btn, dd);
      const close = () => { dd.removeAttribute('open'); btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', onDoc, true); this._pendingCloses.delete(close); };
      const open  = () => { dd.setAttribute('open', ''); btn.setAttribute('aria-expanded', 'true'); document.addEventListener('click', onDoc, true); this._pendingCloses.add(close); };
      const onDoc = (e) => { if (!ov.contains(e.target)) close(); };
      btn.addEventListener('click', (e) => { e.stopPropagation(); dd.hasAttribute('open') ? close() : open(); });
      dd.addEventListener('ds-dropdown-select', (e) => {
        const idx = parseInt(e.detail?.value, 10);
        this._hiddenActions[idx]?.node.click();   // proxy to the real button
        close();
      });
      dd.addEventListener('ds-dropdown-close', close);
      this._actionOverflow = ov;
    }
    ov.querySelector('ds-dropdown-menu').items = hidden.map((h, i) => ({ label: h.label, value: String(i) }));
    if (ov.parentNode !== wrap) wrap.appendChild(ov);
    this.classList.add('ds-page-header--actions-collapsed');
    this._actionsCollapsed = true;
  }

  _expandActions(nodes) {
    if (!this._actionsCollapsed && !this._actionOverflow?.isConnected) return;
    nodes.forEach((n) => { n.style.display = ''; });
    if (this._actionOverflow?.parentNode) this._actionOverflow.remove();
    this.classList.remove('ds-page-header--actions-collapsed');
    this._actionsCollapsed = false;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ds-page-header')) {
  customElements.define('ds-page-header', DsPageHeader);
}
