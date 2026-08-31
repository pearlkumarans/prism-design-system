import { modifier } from 'ember-modifier';
import { CONTENT_VIEWS } from 'prism-webapp/config/catalog';
import { injectViewInto } from 'prism-webapp/lib/inject-view';
import { navLoadStart, navLoadDone } from 'prism-webapp/lib/nav-progress';

/**
 * mount-view — drives <ContentOutlet>. Injects the routed view's dual-mode file
 * into the host and shows it. Re-runs (tears down first) whenever `slug` changes.
 * The fetch/inject engine lives in lib/inject-view.js (shared with the drawers service).
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default modifier(function mountViewModifier(element, [slug]) {
  // Generation guard: `element` is a persistent host reused across slug swaps, so a
  // slow earlier fetch could otherwise resolve AFTER a newer view mounted and stomp
  // it. teardown flips `cancelled` (and aborts the fetch); injectViewInto + the
  // handlers below check it so a superseded load never touches the host.
  let cancelled = false;
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;

  element.innerHTML = ''; // teardown any previously-mounted view before swapping

  const view = CONTENT_VIEWS[slug];
  if (!view) {
    element.innerHTML = `<p class="content-outlet-error">Unknown view slug: <code>${esc(slug)}</code></p>`;
    return () => { element.innerHTML = ''; };
  }

  navLoadStart(); // module-switch progress bar on until the view file resolves
  injectViewInto(element, view.file, { signal: ctrl?.signal, shouldAbort: () => cancelled })
    .then(() => {
      if (cancelled) return; // a newer slug superseded us mid-fetch
      requestAnimationFrame(() => { if (!cancelled) window.ShellDrawers?.[slug]?.show?.(); });
    })
    .catch((e) => {
      if (cancelled || e?.name === 'AbortError') return; // superseded → not a real error
      element.innerHTML =
        `<p class="content-outlet-error">Couldn't load <code>${esc(view.file)}.html</code> — ${esc(e.message)}.` +
        ` Is the repo static server running and proxied? See README.</p>`;
    })
    .finally(() => navLoadDone());

  return () => {
    cancelled = true;
    ctrl?.abort();
    window.ShellDrawers?.[slug]?.hide?.();
    element.innerHTML = '';
  };
});
