import { modifier } from 'ember-modifier';
import { CONTENT_VIEWS } from 'prism-webapp/config/catalog';
import { injectViewInto } from 'prism-webapp/lib/inject-view';

/**
 * mount-view — drives <ContentOutlet>. Injects the routed view's dual-mode file
 * into the host and shows it. Re-runs (tears down first) whenever `slug` changes.
 * The fetch/inject engine lives in lib/inject-view.js (shared with the drawers service).
 */
export default modifier(function mountViewModifier(element, [slug]) {
  element.innerHTML = ''; // teardown any previously-mounted view before swapping

  const view = CONTENT_VIEWS[slug];
  if (!view) {
    element.innerHTML = `<p class="content-outlet-error">Unknown view slug: <code>${slug}</code></p>`;
    return () => { element.innerHTML = ''; };
  }

  injectViewInto(element, view.file)
    .then(() => requestAnimationFrame(() => window.ShellDrawers?.[slug]?.show?.()))
    .catch((e) => {
      element.innerHTML =
        `<p class="content-outlet-error">Couldn't load <code>${view.file}.html</code> — ${e.message}.` +
        ` Is the repo static server running and proxied? See README.</p>`;
    });

  return () => {
    window.ShellDrawers?.[slug]?.hide?.();
    element.innerHTML = '';
  };
});
