import { modifier } from 'ember-modifier';

/**
 * chrome — drives ShellChrome's lifecycle. First run wires the header + sidebars
 * (setupChrome); every subsequent run — triggered because `tabId`/`viewSlug` are
 * tracked positional deps — re-applies the menus + active highlight (syncChrome).
 *
 *   {{chrome this this.shell.tabId this.shell.viewSlug}}
 */
export default modifier(function chrome(element, [ctx]) {
  // Consume the tracked nav state HERE (inside the modifier's own tracking frame)
  // so ember-modifier re-runs this whenever it changes. Relying on the positional
  // args to establish the dependency proved unreliable across route transitions.
  void ctx.shell.tabId;
  void ctx.shell.viewSlug;
  void ctx.nav.mode;
  void ctx.nav.railIcons;

  if (!ctx._chromeReady) {
    ctx._chromeReady = true;
    ctx.setupChrome(element);
  } else {
    ctx.syncChrome();
  }
});
