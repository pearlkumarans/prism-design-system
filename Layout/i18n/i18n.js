/* =============================================================================
   i18n.js — central-catalog runtime loader (framework-agnostic).

   The per-locale strings live in Layout/i18n/locales/<code>.json (see registry.json
   + build-locale.mjs). This loader fetches them on demand and registers them into
   whatever shell is hosting — the static shell's ShellCtx or the Ember i18n
   service — through their existing addMessages() API. So both shells consume ONE
   source of truth; nothing here is framework-specific.

   Contract:
     UEMSi18n.configure({ base })     // URL prefix to this /i18n dir (has /locales)
     await UEMSi18n.ensure(code, addMessages)
                                      // load `en` (base) + `code`, register both
     UEMSi18n.loaded(code)            // has this locale been registered yet?

   `ensure` always loads English first (the fallback layer) and is idempotent +
   cached, so calling it on every language switch is cheap after the first hit.
   A missing locale file (404) registers as empty → the view falls back to English
   via the host's own t(). ============================================================================= */
(function (global) {
  'use strict';

  // Default base: relative to a document served from /Layout/ (the static shell).
  // The Ember app serves the vendored copy at /Layout/i18n, so it calls
  // configure({ base: '/Layout/i18n' }) at boot.
  let BASE = 'i18n';
  const cache = Object.create(null);   // code → parsed JSON (or {})
  const registered = new Set();        // codes already pushed to the host catalog
  const inflight = Object.create(null); // code → Promise (dedupe concurrent loads)

  function configure(opts) {
    if (opts && typeof opts.base === 'string') BASE = opts.base.replace(/\/+$/, '');
  }

  function fetchLocale(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    if (inflight[code]) return inflight[code];
    const url = `${BASE}/locales/${code}.json`;
    inflight[code] = fetch(url)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}))
      .then((json) => { cache[code] = json || {}; delete inflight[code]; return cache[code]; });
    return inflight[code];
  }

  // The nav (ec-menus) is translated by a LABEL-keyed catalog (English → string),
  // separate from the key-based one. Loaded into global.UEMSNavLabels[code], read
  // by ec-menus's _locLabel(). A missing file (e.g. English base) → empty.
  function fetchNav(code) {
    return fetch(`${BASE}/locales/nav.${code}.json`)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}));
  }

  // Load English (base) + `code`: the key catalog (via addMessages) AND the nav
  // label catalog (into UEMSNavLabels). Register once; idempotent + cached.
  async function ensure(code, addMessages) {
    const wanted = code && code !== 'en' ? ['en', code] : ['en'];
    for (const c of wanted) {
      if (registered.has(c)) continue;
      const [json, nav] = await Promise.all([fetchLocale(c), fetchNav(c)]);
      if (typeof addMessages === 'function') addMessages({ [c]: json });
      (global.UEMSNavLabels = global.UEMSNavLabels || Object.create(null))[c] = nav;
      registered.add(c);
    }
  }

  global.UEMSi18n = { configure, ensure, fetchLocale, loaded: (c) => registered.has(c) };
})(typeof window !== 'undefined' ? window : globalThis);
