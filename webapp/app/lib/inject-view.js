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

  /* Parse in an inert document, then IMPORT the nodes into the live one — do NOT
     use `<template>.content.cloneNode()` (the old path). In this app the ds-*
     custom elements are ALREADY defined, so how a subtree first connects decides
     upgrade order:

       - template.content.cloneNode() + appendChild → a parent (e.g. ds-widget)
         upgrades BEFORE its children attach, captures empty, and injects a demo
         chart — discarding the real slotted <ds-chart>. (This was the bug: every
         injected view's charts/list/table content silently vanished.)
       - DOMParser + document.importNode() + one appendChild → the whole subtree is
         inserted in a single insert, so the parent upgrades with its children
         already present and captures them. (Matches the vanilla shell's timing,
         where components aren't defined yet at inject time.)

     Verified empirically: cloneNode drops the chart; importNode keeps it (donut,
     not the demo column). This fixes ALL injected views, not one component. */
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const fragTpl = parsed.querySelector('#drawer-fragment');
  const source = fragTpl ? fragTpl.content : parsed.body;

  const frag = document.createDocumentFragment();
  for (const node of [...source.childNodes]) frag.appendChild(document.importNode(node, true));

  // Imported <script> nodes don't execute — detach, inject markup, re-create them.
  const scripts = [...frag.querySelectorAll('script')];
  scripts.forEach((s) => s.remove());
  element.appendChild(frag);
  for (const original of scripts) {
    const s = document.createElement('script');
    if (original.type) s.type = original.type;
    s.textContent = original.textContent;
    element.appendChild(s);
  }
}
