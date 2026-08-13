/**
 * inject-view — the shared port of Shell.html's injectDrawer(file, mount).
 * Used by BOTH the ContentOutlet (mounts a view into ds-content) and the drawers
 * service (mounts a slide-over into a body host). Fetches a dual-mode file, injects
 * its <template id="drawer-fragment">, and re-runs the fragment's inline scripts so
 * it registers window.ShellDrawers[key].
 */

export function resolveViewUrl(file) {
  // Mirror injectDrawer: a path WITH a slash is relative to Layout/ (…/projects/x);
  // a bare name lives under Layout/views/. Same base the vanilla shell fetched from.
  const rel = file.includes('/') ? `${file}.html` : `views/${file}.html`;
  return new URL(rel, `${window.location.origin}/Layout/Shell.html`).pathname;
}

export async function injectViewInto(element, file) {
  const res = await fetch(resolveViewUrl(file));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const doc = document.createElement('template');
  doc.innerHTML = html;
  const fragTpl = doc.content.querySelector('#drawer-fragment');
  const content = (fragTpl ? fragTpl.content : doc.content).cloneNode(true);

  // Cloned <script> nodes don't execute — detach, inject markup, re-create them.
  const scripts = [...content.querySelectorAll('script')];
  scripts.forEach((s) => s.remove());
  element.appendChild(content);
  for (const original of scripts) {
    const s = document.createElement('script');
    if (original.type) s.type = original.type;
    s.textContent = original.textContent;
    element.appendChild(s);
  }
}
