/* ds-stepper — data-driven progress indicator. Covers one <li> per step, the
   list/aria-current a11y contract, number/tick glyphs, next/prev/goTo/setStatus,
   linear vs nonlinear clickability, the select event, label escaping, teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/stepper/stepper.js';

const STEPS = [
  { id: 'account', label: 'Account', description: 'Sign in' },
  { id: 'details', label: 'Details', description: 'Your info' },
  { id: 'plan', label: 'Plan' },
];
const stepEls = (el) => el.querySelectorAll('.ds-stepper__step');

describe('ds-stepper — structure & a11y', () => {
  it('renders one step per data entry', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    expect(stepEls(el).length).to.equal(3);
  });

  it('exposes a labelled group wrapping a role=list of steps (live-region stays out of the list)', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    // host is a labelled group; the actual list is an inner element so the progress
    // live-region can be a sibling (a list may only contain listitems).
    expect(el.getAttribute('role')).to.equal('group');
    expect(el.getAttribute('aria-label')).to.equal('Progress');
    const list = el.querySelector('.ds-stepper__list');
    expect(list.getAttribute('role')).to.equal('list');
    expect(list.querySelectorAll('.ds-stepper__step').length).to.equal(STEPS.length);
    // the live-region is NOT inside the list
    expect(list.querySelector('.ds-stepper__sr')).to.not.exist;
    expect(el.querySelector('.ds-stepper__sr')).to.exist;
  });

  it('marks the active step with aria-current="step"', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    const steps = stepEls(el);
    expect(steps[0].getAttribute('aria-current')).to.equal('step');
    expect(steps[1].hasAttribute('aria-current')).to.be.false;
  });

  it('renders the step number and a tick on completed steps', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = [{ id: 'a', label: 'A', status: 'completed' }, { id: 'b', label: 'B' }];
    await nextFrame();
    const [a, b] = stepEls(el);
    expect(a.querySelector('ds-icon[name="tick"]')).to.exist;
    expect(b.querySelector('.ds-stepper__num').textContent).to.equal('2');
  });

  it('renders the step title and description', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    expect(el.querySelector('.ds-stepper__title').textContent).to.equal('Account');
    expect(el.querySelector('.ds-stepper__desc').textContent).to.equal('Sign in');
  });
});

describe('ds-stepper — navigation methods', () => {
  it('next() advances the active step', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    el.next();
    await nextFrame();
    expect(el.active).to.equal(1);
    expect(stepEls(el)[1].getAttribute('aria-current')).to.equal('step');
  });

  it('prev() and goTo() clamp within range', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    el.prev();
    expect(el.active).to.equal(0); // clamped at 0
    el.goTo(99);
    expect(el.active).to.equal(2); // clamped at last
  });

  it('setStatus() updates a step by id and re-renders', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    el.setStatus('details', 'error');
    await nextFrame();
    const details = el.querySelector('[data-id="details"]');
    expect(details.classList.contains('ds-stepper__step--error')).to.be.true;
    expect(details.getAttribute('aria-invalid')).to.equal('true');
  });
});

describe('ds-stepper — clickability & events', () => {
  it('renders no buttons in the default (linear, non-clickable) mode', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    expect(el.querySelector('button.ds-stepper__main')).to.not.exist;
  });

  it('renders every non-disabled step as a button in nonlinear mode', async () => {
    const el = await fixture(html`<ds-stepper mode="nonlinear"></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    expect(el.querySelectorAll('button.ds-stepper__main').length).to.equal(3);
  });

  it('fires ds-stepper-select with id/index/step when a step is clicked', async () => {
    const el = await fixture(html`<ds-stepper mode="nonlinear"></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    const btn = el.querySelectorAll('button.ds-stepper__main')[2];
    setTimeout(() => btn.click());
    const ev = await oneEvent(el, 'ds-stepper-select');
    expect(ev.detail.index).to.equal(2);
    expect(ev.detail.id).to.equal('plan');
    expect(el.active).to.equal(2);
  });
});

describe('ds-stepper — escaping & teardown', () => {
  it('escapes a hostile step label (no injected <img>, literal text)', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = [{ id: 'x', label: '"><img src=x onerror=alert(1)>' }];
    await nextFrame();
    const title = el.querySelector('.ds-stepper__title');
    expect(title.querySelector('img')).to.not.exist;
    expect(title.textContent).to.contain('<img');
  });

  it('disconnects without throwing', async () => {
    const el = await fixture(html`<ds-stepper></ds-stepper>`);
    el.steps = STEPS;
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
  });
});
