/* Listener-leak detector.
   Wraps document/window add/removeEventListener and keeps a net count per
   (target, type). After mounting + exercising + unmounting a component, `net()`
   should return to 0 — otherwise the component leaked a global listener.

   Usage:
     const t = trackListeners();
     const el = await fixture(html`<ds-foo></ds-foo>`);
     el.remove();
     t.restore();
     expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
*/
export function trackListeners() {
  const targets = [document, window];
  const saved = new Map();
  const counts = new Map(); // `${i}:${type}` -> net

  targets.forEach((target, i) => {
    const add = target.addEventListener.bind(target);
    const remove = target.removeEventListener.bind(target);
    saved.set(target, { add, remove });
    target.addEventListener = (type, fn, opts) => {
      counts.set(`${i}:${type}`, (counts.get(`${i}:${type}`) || 0) + 1);
      return add(type, fn, opts);
    };
    target.removeEventListener = (type, fn, opts) => {
      counts.set(`${i}:${type}`, (counts.get(`${i}:${type}`) || 0) - 1);
      return remove(type, fn, opts);
    };
  });

  return {
    /** Net listeners still registered across document + window. */
    net() {
      let n = 0;
      for (const v of counts.values()) n += v;
      return n;
    },
    /** Map of only the types with a non-zero net (the leak, if any). */
    byType() {
      const out = {};
      for (const [k, v] of counts) if (v !== 0) out[k] = v;
      return out;
    },
    /** Always call in a finally / at test end to restore the originals. */
    restore() {
      for (const target of targets) {
        const o = saved.get(target);
        target.addEventListener = o.add;
        target.removeEventListener = o.remove;
      }
    },
  };
}
