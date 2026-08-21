import Component from '@glimmer/component';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { CONTENT_VIEWS, defaultViewFor, TAB_ICONS } from 'prism-webapp/config/catalog';
import { RailPopover } from 'prism-webapp/lib/rail-popover';

// Framework-agnostic shell helpers, loaded from the repo through the dev proxy.
// A runtime-constructed import keeps them native (ember-auto-import can't bundle a
// path outside the app).
const ORIGIN = globalThis.location?.origin ?? '';
const _nativeImport = new Function('u', 'return import(u);');
let _ecMenus;
let _responsive;
// Vendored into public/vendor/ds by scripts/vendor-assets.mjs — same origin, no proxy.
const loadEcMenus = () => (_ecMenus ||= _nativeImport(`${ORIGIN}/vendor/ds/data/ec-menus.js`));
const loadResponsive = () => (_responsive ||= _nativeImport(`${ORIGIN}/vendor/ds/shell/shell-responsive.js`));

/**
 * ShellChrome — the full shell frame:
 *   ds-header-nav · ds-module-rail (left-nav) · ds-sidebar-l1/l2 · ds-content · ds-right-pane
 *
 * Reuses the shell's own helpers (ec-menus applyL2For/wireL1ToL2, shell-responsive
 * initShellResponsive) and services (nav/i18n/theme/drawers). Ember drives *when*
 * (react to routed state + nav mode) and *where to* (route transitions / drawer opens).
 */
export default class ShellChrome extends Component {
  @service shell;
  @service router;
  @service nav;
  @service i18n;
  @service theme;
  @service drawers;

  _els = null;
  _applyL2For = null;
  // Signatures of the last tab set fed to the header / module rail. Re-feeding
  // either re-renders it (and flashes the header's overflow reflow → right-cluster
  // jerk), so we only re-feed when the set actually changes (product / language).
  _tabsSig = null;
  _railSig = null;

  // Navigating dismisses any open drawer. Critical for the full-page swaps
  // (Settings / Support / Ask Zia) which hide the L1/L2 nav while open — in a
  // point product the L2 sidebar IS the nav, so without this you can only escape
  // via the module rail. Bound field so on/off reference the same handler.
  _closeDrawersOnNav = () => this.drawers.closeAll();

  // Header search icon / centre search field / ⌘K → toggle the global command
  // palette (views/command-palette.html), matching Shell.html's showPalette().
  // It's a body-level overlay that registers ShellDrawers['command-palette'] with
  // { show, hide, isOpen }; drawers.open injects it on first use. Re-triggering
  // toggles it closed. NOT the full search PAGE — the palette hands off to that
  // itself via ShellCtx.showSearch.
  _togglePalette = () => {
    const cp = window.ShellDrawers?.['command-palette'];
    if (cp?.isOpen?.()) { cp.hide(); return; }
    this.drawers.open('command-palette');
  };

  async setupChrome(element) {
    await Promise.all([
      customElements.whenDefined('ds-header-nav'),
      customElements.whenDefined('ds-sidebar-l1'),
      customElements.whenDefined('ds-sidebar-l2'),
      customElements.whenDefined('ds-right-pane'),
      customElements.whenDefined('ds-module-rail'),
    ]);

    const header = element.querySelector('ds-header-nav');
    const l1 = element.querySelector('ds-sidebar-l1');
    const l2 = element.querySelector('ds-sidebar-l2');
    const rail = element.querySelector('ds-module-rail');
    const content = element.querySelector('ds-content');
    this._els = { header, l1, l2, rail, content };

    // Close any open drawer on navigation (see _closeDrawersOnNav). Drawers don't
    // change the route themselves, so routeWillChange only fires on real nav.
    this.router.on('routeWillChange', this._closeDrawersOnNav);
    registerDestructor(this, () => this.router.off('routeWillChange', this._closeDrawersOnNav));

    const { applyL2For, wireL1ToL2 } = await loadEcMenus();
    this._applyL2For = applyL2For;
    wireL1ToL2(l1, l2);

    // Header module tab → module route. `support` is not a module — it's a
    // full-page swap (like Settings), so open it as a drawer instead of routing;
    // leaving support closes it.
    header.addEventListener('ds-header-nav-tab-select', (e) => {
      const id = e.detail?.id;
      if (!id) return;
      if (id === 'support') { this.drawers.open('support'); return; }
      // Clicking any tab dismisses open drawers — incl. the full-page Settings/Zia
      // swaps. Needed here (not just on routeWillChange) because re-clicking the
      // ALREADY-ACTIVE tab resolves to the same route, so no route event fires.
      this.drawers.closeAll();
      // Go straight to the tab's default VIEW (not the bare module). Re-clicking
      // the already-active tab then resolves to the same route+params — a no-op
      // that leaves content intact — instead of dropping onto the empty module
      // index (whose redirect Ember skips when the params are unchanged).
      const view = defaultViewFor(this.shell.productId, id);
      if (view && CONTENT_VIEWS[view]) {
        this.router.transitionTo('product.module.view', this.shell.productId, id, view);
      } else {
        this.router.transitionTo('product.module', this.shell.productId, id);
      }
    });

    // Header utility icons → drawers (avatar/profile, gear/settings, bento/apps, search).
    header.addEventListener('ds-header-nav-action', (e) => {
      const action = e.detail?.action;
      if (action === 'avatar') this.drawers.open('profile');
      else if (action === 'settings') this.drawers.open('settings');
      else if (action === 'bento') this.drawers.open('apps');
      else if (action === 'search') this._togglePalette();
      // Ask Zia — the in-flow pane (ask-zia.html / ShellDrawers.askzia), toggled;
      // matches Shell.html. (Not zia.html, which is a different full-page swap.)
      else if (action === 'zia') {
        const z = window.ShellDrawers?.askzia;
        if (z?.isOpen?.()) z.hide(); else this.drawers.open('ask-zia');
      }
    });
    header.addEventListener('ds-header-nav-search', () => this._togglePalette());

    // ⌘K / Ctrl+K toggles the palette from anywhere (mirrors Shell.html). The
    // palette owns its own keys once open; this only handles the global open/close.
    this._onPaletteKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        this._togglePalette();
      }
    };
    document.addEventListener('keydown', this._onPaletteKey);
    registerDestructor(this, () => document.removeEventListener('keydown', this._onPaletteKey));

    // Right utility rail. Each id maps to a DISTINCT surface, matching Shell.html:
    //  help/accessibility → confined drawers; announcement → Product Updates drawer;
    //  update/review/roadmap → small anchored popover CARDS (not the updates drawer);
    //  product → external SDP page; get-started → the sectioned-form view.
    const rp = element.querySelector('ds-right-pane');
    this._rp = rp;   // synced for direction (rtl) in syncChrome on language flip
    const railPopover = new RailPopover(rp, this.theme);
    railPopover.enableAppearanceHover(); // hover the theme icon → Appearance chooser
    // Only ONE surface open at a time: opening any drawer closes the popover
    // (beforeOpen) + every other drawer (drawers.open → closeAll); opening a
    // popover card closes all drawers first.
    this.drawers.beforeOpen = () => railPopover.hide();
    rp?.addEventListener('ds-right-pane-select', (e) => {
      const id = e.detail?.id;
      if (id === 'help') this.drawers.open('help');
      else if (id === 'accessibility') this.drawers.open('accessibility');
      // ONLY announcement opens the full Product Updates drawer.
      else if (id === 'announcement') this.drawers.open('updates');
      // Update / Review / Road map are their own anchored notification cards.
      else if (id === 'update') { this.drawers.closeAll(); railPopover.toggle('update'); }
      else if (id === 'review') { this.drawers.closeAll(); railPopover.toggle('review'); }
      else if (id === 'roadmap') { this.drawers.closeAll(); railPopover.toggle('roadmap'); }
      // Product slot → ServiceDesk Plus product page.
      else if (id === 'product') window.open('https://www.manageengine.com/products/service-desk/', '_blank', 'noopener');
      // Direction toggle flips the language (en ⇄ ar → LTR ⇄ RTL).
      else if (id === 'direction') this.i18n.setLang(this.i18n.lang === 'ar' ? 'en' : 'ar');
      // Get started → the sectioned-form pattern view (shell does this on Configurations).
      else if (id === 'get-started') this.router.transitionTo('product.module.view', this.shell.productId, 'configs', 'sectioned-form');
    });
    rp?.addEventListener('ds-right-pane-theme', (e) => {
      const base = e.detail?.theme === 'dark' ? 'dark' : 'light';
      this.theme.applyTheme(this.theme.family === 'green' ? `green-${base}` : base);
      // If the Appearance chooser is open, re-render it to reflect the flip.
      if (railPopover.isOpen() && railPopover.card === 'appearance') railPopover.showAppearance();
    });

    // Sidebar item with a `view` slug → view route.
    const toView = (e) => {
      const slug = e.detail?.item?.view;
      if (slug && CONTENT_VIEWS[slug]) {
        this.drawers.closeAll();   // a sidebar click dismisses open drawers (see tab handler)
        this.router.transitionTo('product.module.view', this.shell.productId, CONTENT_VIEWS[slug].tab, slug);
      }
    };
    l1.addEventListener('ds-sidebar-l1-select', toView);
    l2.addEventListener('ds-sidebar-l2-select', toView);

    // Left-nav module rail → module route (mirrors the header tabs).
    rail?.addEventListener('ds-module-rail-select', (e) => {
      const id = e.detail?.id;
      if (!id) return;
      this.drawers.closeAll();     // a module-rail click dismisses open drawers (see tab handler)
      this.router.transitionTo('product.module', this.shell.productId, id);
    });

    // Responsive: tablet collapses L1/L2; mobile moves the rails into an off-canvas
    // drawer whose top-level list is built from header.tabs — the same reusable
    // controller the vanilla shell uses.
    try {
      const { initShellResponsive } = await loadResponsive();
      initShellResponsive({ root: document.body, header, rails: [l1, l2], collapse: [l1, l2] });
    } catch (err) {
      console.warn('[chrome] responsive init skipped:', err); // eslint-disable-line no-console
    }

    // Re-render nav labels when the language flips. The chrome modifier only tracks
    // route/nav state, not i18n.lang, so subscribe directly; the i18n service
    // re-dispatches this once the central catalog for the new language has loaded.
    // Resetting the sigs forces header.tabs / rail.items to be re-fed with the
    // freshly-translated labels.
    this._onLangChange = () => { this._tabsSig = null; this._railSig = null; this.syncChrome(); };
    document.addEventListener('shell:langchange', this._onLangChange);

    this.syncChrome();

    // Warm the Ask Zia pane after boot so its FIRST open plays the width slide
    // (it mounts closed at width:0) instead of popping — injecting + opening in
    // one frame skips the transition. Idempotent; idle for the common case, a
    // setTimeout net for backgrounded tabs that suppress idle callbacks. Mirrors
    // Shell.html's preinjectAskZia.
    const warmZia = () => this.drawers.ensure?.('ask-zia');
    const idleId = ('requestIdleCallback' in window) ? requestIdleCallback(warmZia, { timeout: 3000 }) : null;
    const timerId = setTimeout(warmZia, 2000);
    registerDestructor(this, () => {
      clearTimeout(timerId);
      if (idleId != null && 'cancelIdleCallback' in window) cancelIdleCallback(idleId);
    });
  }

  syncChrome() {
    if (!this._els || !this._applyL2For) return;
    const { header, l1, l2, rail, content } = this._els;

    // Propagate text direction to every chrome component, mirroring Shell.html's
    // applyDir ([header, sidebar-l1, sidebar-l2, right-pane, content]). The app
    // flips RTL by setting `dir` on <html> only; each component mirrors its layout
    // / inward affordances off its own `rtl` attribute, and toggling it here is
    // also what re-renders them (rtl is observed) so they flip on a language change.
    // Only touch the attribute when it actually changes — setAttribute to an
    // already-present value still fires attributeChangedCallback, and these
    // components re-render on it, so a blind set would fully re-render the header
    // + sidebars + content on every route change in RTL.
    const rtl = this.i18n.dir === 'rtl';
    [header, l1, l2, content, this._rp].forEach((el) => {
      if (!el) return;
      const has = el.hasAttribute('rtl');
      if (rtl && !has) el.setAttribute('rtl', '');
      else if (!rtl && has) el.removeAttribute('rtl');
    });

    // Feed the header its tab set ONLY when it changes (product or language). A
    // fresh `this.shell.tabs.map(...)` array assigned to header.tabs re-renders the
    // WHOLE header, which flashes its overflow reflow and jerks the right cluster
    // on every switch. On a same-product tab/view switch the set is unchanged, so
    // we skip the re-feed and let setActiveTab (cheap, class-only) do the highlight
    // — mirroring the vanilla shell, which sets tabs only on product/lang change.
    // Nav labels resolve from the central i18n catalog (nav.tab.<id>) for the
    // active language, falling back to the English label when a key isn't
    // loaded/translated yet — same contract as the vanilla shell's productTabs().
    const label = (t) => {
      const k = `nav.tab.${t.id}`;
      const v = this.i18n.t(k);
      return v && v !== k ? v : t.label;
    };
    const tabs = this.shell.tabs.map((t) => ({ id: t.id, label: label(t) }));
    const sig = `${this.i18n.lang}:${tabs.map((t) => t.id).join('|')}`;
    if (sig !== this._tabsSig) {
      header.tabs = tabs;
      this._tabsSig = sig;
    }

    const tab = this.shell.tabId;
    if (tab) {
      this._applyL2For(l1, l2, tab, this.i18n.lang);
      header.setActiveTab?.(tab);
      this._highlightActive(l2);
    }

    // Left-nav module rail: populate + reflect active module; visibility via html.nav-left.
    if (rail) {
      const left = this.nav.mode === 'left';
      rail.hidden = !left;
      if (left) {
        // Same guard as the header — re-feeding rail.items re-renders the rail.
        if (sig !== this._railSig) {
          rail.items = this.shell.tabs.map((t) => ({ id: t.id, label: label(t), icon: TAB_ICONS[t.id] }));
          this._railSig = sig;
        }
        // Icon-only rail is product-aware: the combined EC suite has many modules,
        // so its left rail is ALWAYS icon-only (a narrow rail with hover-expand);
        // point products have few modules and open icon+label, with the user's
        // railIcons toggle as an opt-in. (The personalize panel hides the toggle
        // for EC to match — the choice only applies to point products.)
        const iconsOnly = this.nav.pointProduct ? this.nav.railIcons : true;
        if (iconsOnly) rail.setAttribute('icons-only', ''); else rail.removeAttribute('icons-only');
        if (tab) rail.setActive?.(tab);
      }
    }
  }

  _highlightActive(l2) {
    const slug = this.shell.activeNavSlug;
    const groups = l2?.groups;
    if (!Array.isArray(groups)) return;
    l2.groups = groups.map((g) => ({
      ...g,
      items: (g.items || []).map((it) => ({ ...it, active: it.view === slug })),
    }));
  }
}
