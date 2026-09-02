/* Styled-render helpers for the visual-regression suite.

   Components inject their own CSS as <link rel="stylesheet"> on connect (injectCss),
   which loads ASYNCHRONOUSLY. A screenshot taken before those links parse would
   capture an unstyled flash — the exact problem that made the unit harness useless
   for pixels. `mountStyled` renders a component, then awaits every stylesheet link
   + web fonts + two frames so the paint is settled before visualDiff. */
import { fixture, html, nextFrame } from '@open-wc/testing';

export { html };

/* Wait until every <link rel="stylesheet"> has its .sheet (loaded), fonts are
   ready, and a couple of frames have flushed layout/paint. */
export async function settleStyles() {
  await nextFrame();
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
  await Promise.all(links.map((l) => (l.sheet ? null : new Promise((res) => {
    l.addEventListener('load', res, { once: true });
    l.addEventListener('error', res, { once: true });   // resolve anyway; a missing sheet shouldn't hang
  }))));
  /* The token layer is index.css, whose @import sub-sheets (primitives → semantic)
     load a beat AFTER the parent link's .sheet appears. Poll until a semantic COLOUR
     token actually resolves, so no screenshot captures a pre-primitives (colourless)
     frame. Bounded so a genuinely-missing token can't hang the run. */
  const resolved = () => !!getComputedStyle(document.documentElement)
    .getPropertyValue('--uems-text-primary').trim();
  for (let i = 0; i < 60 && !resolved(); i++) await nextFrame();
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (_) { /* no-op */ } }
  await nextFrame();
  await nextFrame();
}

/* Mount `template`, wrapped in a fixed-width, white, inline-block frame so each
   component sits on a stable ground with consistent padding (transparent
   components then screenshot cleanly). Returns the wrapper to hand to visualDiff. */
export async function mountStyled(template, { width = 'max-content' } = {}) {
  const wrapper = await fixture(html`
    <div style="display:inline-block; background:#fff; padding:16px; width:${width}; box-sizing:border-box;">
      ${template}
    </div>`);
  await settleStyles();
  return wrapper;
}
