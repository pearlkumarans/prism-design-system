/**
 * shell-ctx — builds window.ShellCtx from the real Ember services, replacing the
 * English-only stub. The injected dual-mode views talk to the shell only through
 * window.ShellCtx + window.ShellDrawers, so this is the single seam between the
 * legacy views and the Ember app. Runs at boot, before any drawer is injected.
 */
export function initialize(appInstance) {
  const i18n = appInstance.lookup('service:i18n');
  const theme = appInstance.lookup('service:theme');
  const nav = appInstance.lookup('service:nav');
  appInstance.lookup('service:api'); // instantiate at boot (sets PrismAPI mock mode for the POC)

  window.ShellDrawers = window.ShellDrawers || {};
  window.ShellCtx = {
    // DOM refs some views read (content host / shell area).
    get shellArea() { return document.querySelector('ds-content'); },
    get content() { return document.querySelector('ds-content'); },

    // i18n
    get lang() { return i18n.lang; },
    addMessages: (m) => i18n.addMessages(m),
    t: (k) => i18n.t(k),
    onLangChange: (cb) => i18n.onLangChange(cb),
    setLang: (l) => i18n.setLang(l),
    applyDir: (l) => i18n.applyDir(l),

    // theme
    get appr() { return theme.appr; },
    applyTheme: (v) => theme.applyTheme(v),

    // navigation preferences
    get navMode() { return nav.mode; },
    get railIcons() { return nav.railIcons; },
    setNavMode: (m) => nav.setMode(m),
    setRailIcons: (on) => nav.setRailIcons(on),

    // header icon highlight — no-op in the POC.
    setActiveIcon: () => {},
  };
}

export default { initialize };
