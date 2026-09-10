/* ds-tour — guided page-tour orchestrator. An invisible controller that walks a
   steps[] array, composing ds-popover (anchored) / ds-modal (centered) and a
   ds-overlay backdrop. Covers: steps property, start/next/prev/goTo/end, the
   lifecycle events, centered vs anchored surfaces + backdrop, progress, skip vs
   complete (advance never mis-fires a skip), persistence, advanceOn, labels
   override, missing-target degrade, and teardown cleanup. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/tour/tour.js';

/* The tour appends surfaces (popover / modal / overlay / live region / ring) to
   <body> — sweep any strays between tests so state can't leak. */
function sweep() {
  document.querySelectorAll(
    'ds-popover.ds-tour__pop, ds-modal.ds-tour__modal, ds-overlay.ds-tour__backdrop, .ds-tour__sr, .ds-overlay__ring'
  ).forEach((n) => n.remove());
  document.body.style.overflow = '';
}
afterEach(() => sweep());

const STEPS = () => ([
  { target: null, title: 'Welcome', body: 'Hi', primaryLabel: 'Go' },
  { target: '#tgt-a', placement: 'bottom', title: 'A', body: 'step a' },
  { target: '#tgt-b', title: 'B', body: 'step b' },
]);

async function mountTargets() {
  await fixture(html`<div><button id="tgt-a">A</button><button id="tgt-b">B</button></div>`);
}

describe('ds-tour — steps + start guard', () => {
  it('holds a steps array and renders nothing itself (controller)', async () => {
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS();
    expect(el.steps.length).to.equal(3);
    expect(el.hidden).to.be.true;
  });

  it('start() is a no-op with no steps', async () => {
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.start();
    expect(el._running).to.be.false;
  });
});

describe('ds-tour — surfaces per step', () => {
  it('renders a centered ds-modal for a null target', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS();
    el.start();
    await nextFrame();
    expect(document.querySelector('ds-modal.ds-tour__modal')).to.exist;
    el.end();
  });

  it('renders an anchored ds-popover + ds-overlay backdrop for an id target', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour mask="dim"></ds-tour>`);
    el.steps = STEPS();
    el.start();
    el.next();              // → step 1 (anchored #tgt-a)
    await nextFrame();
    expect(document.querySelector('ds-modal.ds-tour__modal')).to.not.exist;   // torn down
    const pop = document.querySelector('ds-popover.ds-tour__pop');
    expect(pop).to.exist;
    expect(pop.getAttribute('anchor')).to.equal('tgt-a');
    const backdrop = document.querySelector('ds-overlay.ds-tour__backdrop');
    expect(backdrop.getAttribute('type')).to.equal('dim');
    el.end();
  });

  it('degrades a missing target to a centered step', async () => {
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = [{ target: '#does-not-exist', title: 'X', body: 'y' }];
    el.start();
    await nextFrame();
    expect(document.querySelector('ds-modal.ds-tour__modal')).to.exist;
    el.end();
  });
});

describe('ds-tour — progress', () => {
  it('shows n-of-N and marks the current dot on anchored steps (centered bookends excluded)', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS(); // welcome (centered) + 2 anchored — pagination counts the anchored only
    el.start();
    await nextFrame();
    /* The centered welcome bookend shows no pagination (tour.md: "Pagination
       excludes centered steps"). */
    const modal = document.querySelector('ds-modal.ds-tour__modal');
    expect(modal.querySelectorAll('.ds-tour__dot').length, 'no dots on the welcome').to.equal(0);
    expect(modal.querySelector('.ds-tour__count'), 'welcome is not numbered').to.not.exist;
    /* First anchored step → popover paginated "1 of 2". */
    el.next();
    await nextFrame();
    const pop = document.querySelector('ds-popover.ds-tour__pop');
    expect(pop.querySelectorAll('.ds-tour__dot').length).to.equal(2);
    expect(pop.querySelector('.ds-tour__count').textContent).to.equal('1 of 2');
    expect(pop.querySelectorAll('.ds-tour__dot.is-current').length).to.equal(1);
    el.end();
  });
});

describe('ds-tour — events + navigation', () => {
  it('fires ds-tour-start then ds-tour-step with {index,total,step}', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS();
    const started = oneEvent(el, 'ds-tour-start');
    const stepped = oneEvent(el, 'ds-tour-step');
    el.start();
    await started;
    const e = await stepped;
    expect(e.detail.index).to.equal(0);
    expect(e.detail.total).to.equal(3);
    expect(e.detail.step.title).to.equal('Welcome');
    el.end();
  });

  it('next() past the last step completes (not skips)', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS();
    let skipped = false;
    el.addEventListener('ds-tour-skip', () => { skipped = true; });
    el.start(); el.next(); el.next();       // now on last step (index 2)
    const done = oneEvent(el, 'ds-tour-complete');
    el.next();                              // past last → complete
    await done;
    expect(skipped).to.be.false;            // advancing never mis-fires a skip
    expect(el._running).to.be.false;
  });

  it('prev() steps backward', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS();
    el.start(); el.next();                  // index 1
    expect(el._index).to.equal(1);
    el.prev();
    expect(el._index).to.equal(0);
    el.end();
  });

  it('a user dismiss (surface close with a reason) skips, not completes', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS();
    el.start(); el.next();                  // anchored popover
    await nextFrame();
    let completed = false;
    el.addEventListener('ds-tour-complete', () => { completed = true; });
    const skip = oneEvent(el, 'ds-tour-skip');
    // Esc on the popover dismisses with reason 'esc'
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await skip;
    expect(completed).to.be.false;
    expect(el._running).to.be.false;
  });
});

describe('ds-tour — persistence', () => {
  const KEY = 'uems-tour-seen:test.persist.v1';
  afterEach(() => { try { localStorage.removeItem(KEY); } catch (_) {} });

  it('writes the seen flag on end() when persist-key is set', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour persist-key="test.persist.v1"></ds-tour>`);
    el.steps = STEPS();
    el.start();
    el.end({ completed: true });
    expect(localStorage.getItem(KEY)).to.equal('1');
  });

  it('auto-start does not run when already seen', async () => {
    localStorage.setItem(KEY, '1');
    const el = await fixture(html`<ds-tour persist-key="test.persist.v1" auto-start></ds-tour>`);
    el.steps = STEPS();
    await nextFrame(); await nextFrame(); await nextFrame();
    expect(el._running).to.be.false;
  });
});

describe('ds-tour — interactive advanceOn', () => {
  it('advances when the target fires the advanceOn event, and shows a hint', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = [{ target: '#tgt-a', title: 'A', body: 'a', advanceOn: 'click' }, { target: '#tgt-b', title: 'B', body: 'b' }];
    el.start();
    await nextFrame();
    expect(document.querySelector('.ds-tour__hint')).to.exist;
    expect(el._index).to.equal(0);
    document.getElementById('tgt-a').click();
    await nextFrame();
    expect(el._index).to.equal(1);
    el.end();
  });
});

describe('ds-tour — i18n labels', () => {
  it('overrides control strings via the labels property', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.labels = { next: 'Continue', of: '/' };
    el.steps = STEPS();
    el.start();
    await nextFrame();
    const modal = document.querySelector('ds-modal.ds-tour__modal');
    expect(modal.querySelector('.ds-tour__next').getAttribute('label')).to.equal('Go'); // step 0 primaryLabel wins
    el.next();
    await nextFrame();
    const pop = document.querySelector('ds-popover.ds-tour__pop');
    expect(pop.querySelector('.ds-tour__count').textContent).to.equal('1 / 2'); // of-label override on the anchored count
    expect(pop.querySelector('.ds-tour__next').getAttribute('label')).to.equal('Continue');
    el.end();
  });
});

describe('ds-tour — feature-spotlight corner variant', () => {
  it('a single corner step renders a corner card with NO backdrop (even with mask)', async () => {
    const el = await fixture(html`<ds-tour mask="dim"></ds-tour>`);
    el.steps = [{ corner: 'bottom-right', title: 'New', body: 'x', primaryLabel: 'Got it' }];
    el.start();
    await nextFrame();
    const pop = document.querySelector('ds-popover.ds-tour__pop--corner');
    expect(pop).to.exist;
    expect(pop.classList.contains('ds-tour__pop--corner-bottom-right')).to.be.true;
    expect(document.querySelector('ds-overlay.ds-tour__backdrop')).to.not.exist;
    el.end();
  });

  it('a single step is a spotlight — full-width action, no progress dots', async () => {
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = [{ corner: 'bottom-right', title: 'X', body: 'y', primaryLabel: 'Got it' }];
    el.start();
    await nextFrame();
    const pop = document.querySelector('ds-popover.ds-tour__pop--spotlight');
    expect(pop).to.exist;
    expect(pop.querySelector('.ds-tour__next--full')).to.exist;
    expect(pop.querySelector('.ds-tour__dots')).to.not.exist;
    el.end();
  });

  it('media-top: an image single-step puts the title BELOW the image', async () => {
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = [{ corner: 'bottom-right', image: 'x.png', title: 'Title', body: 'y' }];
    el.start();
    await nextFrame();
    const pop = document.querySelector('ds-popover.ds-tour__pop--media-top');
    expect(pop).to.exist;
    const kids = [...pop.querySelector('.ds-tour__body').children].map((n) => n.className);
    expect(kids[0]).to.contain('ds-tour__media');
    expect(kids[1]).to.contain('ds-tour__title');
    el.end();
  });
});

describe('ds-tour — remind-me-later dismissal', () => {
  const KEY = 'ec.test.remind.v1';
  const SEEN = 'uems-tour-seen:' + KEY;
  afterEach(() => { try { localStorage.removeItem(SEEN); } catch (_) { /* ignore */ } });

  it('a normal skip persists "seen"', async () => {
    localStorage.removeItem(SEEN);
    const el = await fixture(html`<ds-tour persist-key="${KEY}"></ds-tour>`);
    el.steps = [{ corner: 'bottom-right', title: 'X', body: 'y' }];
    el.start();
    await nextFrame();
    el.end({ completed: false });
    expect(localStorage.getItem(SEEN)).to.be.ok;
  });

  it('end({remindLater}) does NOT persist "seen" and marks the skip event', async () => {
    localStorage.removeItem(SEEN);
    const el = await fixture(html`<ds-tour persist-key="${KEY}"></ds-tour>`);
    el.steps = [{ corner: 'bottom-right', title: 'X', body: 'y' }];
    el.start();
    await nextFrame();
    const ev = oneEvent(el, 'ds-tour-skip');
    el.end({ completed: false, remindLater: true });
    const { detail } = await ev;
    expect(detail.remindLater).to.be.true;
    expect(localStorage.getItem(SEEN)).to.not.be.ok;
  });

  it('the "I\'ll do it later" secondary link dismisses without persisting "seen"', async () => {
    localStorage.removeItem(SEEN);
    const el = await fixture(html`<ds-tour persist-key="${KEY}"></ds-tour>`);
    el.steps = [{ corner: 'bottom-right', title: 'X', body: 'y', secondaryLabel: 'Later' }];
    el.start();
    await nextFrame();
    const link = document.querySelector('ds-popover.ds-tour__pop--corner .ds-tour__secondary');
    expect(link).to.exist;
    (link.querySelector('a') || link).click();
    await nextFrame();
    expect(localStorage.getItem(SEEN)).to.not.be.ok;
  });
});

describe('ds-tour — teardown', () => {
  it('end() removes every body-appended surface', async () => {
    await mountTargets();
    const el = await fixture(html`<ds-tour></ds-tour>`);
    el.steps = STEPS();
    el.start(); el.next();                  // anchored → popover + backdrop + live region
    await nextFrame();
    el.end();
    expect(document.querySelector('ds-popover.ds-tour__pop')).to.not.exist;
    expect(document.querySelector('ds-overlay.ds-tour__backdrop')).to.not.exist;
    expect(document.querySelector('.ds-tour__sr')).to.not.exist;
  });
});
