import Component from '@glimmer/component';
import { service } from '@ember/service';
import { CONTENT_VIEWS } from 'prism-webapp/config/catalog';
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

// Minimal tab → module-rail icon map (left-nav mode).
const TAB_ICON = {
  home: 'home', tp: 'bug', sd: 'settings-deploy', inv: 'computer',
  bitlocker: 'encryption-lock', mdm: 'mobile', reports: 'file-report', support: 'help-circle',
};

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
    this._els = { header, l1, l2, rail };

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
      this.drawers.close('support');
      this.router.transitionTo('product.module', this.shell.productId, id);
    });

    // Header utility icons → drawers (avatar/profile, gear/settings, bento/apps, search).
    header.addEventListener('ds-header-nav-action', (e) => {
      const action = e.detail?.action;
      if (action === 'avatar') this.drawers.open('profile');
      else if (action === 'settings') this.drawers.open('settings');
      else if (action === 'bento') this.drawers.open('apps');
      else if (action === 'search') this.drawers.open('search');
      else if (action === 'zia') this.drawers.open('zia');
    });
    header.addEventListener('ds-header-nav-search', () => this.drawers.open('search'));

    // Right utility rail. Each id maps to a DISTINCT surface, matching Shell.html:
    //  help/accessibility → confined drawers; announcement → Product Updates drawer;
    //  update/review/roadmap → small anchored popover CARDS (not the updates drawer);
    //  product → external SDP page; get-started → the sectioned-form view.
    const rp = element.querySelector('ds-right-pane');
    const railPopover = new RailPopover(rp);
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
    });

    // Sidebar item with a `view` slug → view route.
    const toView = (e) => {
      const slug = e.detail?.item?.view;
      if (slug && CONTENT_VIEWS[slug]) {
        this.router.transitionTo('product.module.view', this.shell.productId, CONTENT_VIEWS[slug].tab, slug);
      }
    };
    l1.addEventListener('ds-sidebar-l1-select', toView);
    l2.addEventListener('ds-sidebar-l2-select', toView);

    // Left-nav module rail → module route (mirrors the header tabs).
    rail?.addEventListener('ds-module-rail-select', (e) => {
      const id = e.detail?.id;
      if (id) this.router.transitionTo('product.module', this.shell.productId, id);
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

    this.syncChrome();
  }

  syncChrome() {
    if (!this._els || !this._applyL2For) return;
    const { header, l1, l2, rail } = this._els;
    const tabs = this.shell.tabs.map((t) => ({ id: t.id, label: t.label }));
    header.tabs = tabs;

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
        rail.items = this.shell.tabs.map((t) => ({ id: t.id, label: t.label, icon: TAB_ICON[t.id] }));
        if (this.nav.railIcons) rail.setAttribute('icons-only', ''); else rail.removeAttribute('icons-only');
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
