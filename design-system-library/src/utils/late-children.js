/* =============================================================================
   late-children — recover consumer content inserted AFTER a component upgrades.

   Every light-DOM component in this library captures its consumer-provided
   children ONCE, synchronously, in connectedCallback, then rebuilds its inner
   markup. That is correct for static HTML (the parser places children before the
   element upgrades) but WRONG for frameworks — Ember/Glimmer, React, Vue create
   the element, connect it (connectedCallback + capture run here, on an EMPTY
   element), and only THEN append children. The capture misses them and the real
   content is left stranded as a stray direct child, outside the rendered surface.

   watchLateChildren() re-runs the component's own `reproject` step whenever a
   child appears that the component did NOT just render. Crucially, "did I render
   it?" is answered by NODE IDENTITY against a snapshot taken right after render —
   never by class name or slot attribute. That is what makes it loop-proof: the
   component's own generated wrappers are always in the snapshot, so they can
   never be mistaken for leaked content and trigger an endless re-projection.

   Usage — call once at the END of connectedCallback, after _render():

     import { watchLateChildren, stopLateChildren } from '../../utils/late-children.js';

     connectedCallback() {
       ...capture-once + this._render()...
       watchLateChildren(this, () => { this._captured = false; this.connectedCallback(); });
     }
     disconnectedCallback() { stopLateChildren(this); }

   `reproject(leakedNodes)` receives exactly the nodes that leaked in (already
   filtered of whitespace), so a component can merge them into its own captured
   buckets without re-scanning this.children — which would risk swallowing its own
   generated wrappers. It may also ignore the argument and simply re-capture +
   re-render. The helper re-arms itself with a fresh snapshot after every
   reproject, so it keeps working across repeated late insertions and across the
   host being re-parented by its consumer.
   ============================================================================= */

const isBlankText = (n) => n.nodeType === 3 && !n.textContent.trim();

export function watchLateChildren(host, reproject) {
  if (typeof MutationObserver === 'undefined') return;   // SSR / non-DOM: no-op
  if (host._lateObs) host._lateObs.disconnect();

  /* Snapshot exactly what we just rendered — childNodes, not children, so a bare
     text label (e.g. ds-button's) counts too. Anything NOT in here that shows up
     later is consumer content the framework inserted post-upgrade. */
  const own = new Set(host.childNodes);

  host._lateObs = new MutationObserver(() => {
    const leaked = [...host.childNodes].filter((n) => !own.has(n) && !isBlankText(n));
    if (!leaked.length) return;          // only our own DOM (+ whitespace) present → nothing to do
    host._lateObs.disconnect();          // stop BEFORE reproject re-renders (no re-entrancy)
    host._lateObs = null;
    reproject(leaked);                   // hand the component exactly the nodes that leaked
    watchLateChildren(host, reproject);  // re-arm with a fresh snapshot of the new DOM
  });
  host._lateObs.observe(host, { childList: true });
}

export function stopLateChildren(host) {
  if (host._lateObs) { host._lateObs.disconnect(); host._lateObs = null; }
}
