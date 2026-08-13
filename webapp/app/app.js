import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'prism-webapp/config/environment';

// ─── Design system ──────────────────────────────────────────────────────────
// The `ds-*` custom elements are registered by a module script in index.html that
// loads the library's source from the repo through the dev proxy (same origin as
// the injected views + assets). We deliberately DON'T bundle the npm package via
// ember-auto-import: its dist references `new URL('./styles/index.css', import.meta.url)`,
// which webpack can't resolve. Loading the framework-agnostic components at runtime
// keeps them identical to what the vanilla shell uses.
//
// window.ShellCtx (the seam the injected views talk to) is built from the real
// i18n / theme / nav services in app/instance-initializers/shell-ctx.js.
// ──────────────────────────────────────────────────────────────────────────────

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
