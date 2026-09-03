/* ds-criteria-filter — the criteria/expression builder. Covers the rule-tree
   model (setQuery/getQuery, add/remove, clear), render/structure, the reactive
   `title` (+ escaping), presentation `mode` variants, the open/close visibility
   split (no control rebuild), in-place chrome repaint (identity preserved),
   a11y, and teardown (global listeners + timers, via test/helpers/listeners.js). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/criteria-filter/criteria-filter.js';
import { trackListeners } from './helpers/listeners.js';

const A11Y = { ignoredRules: ['color-contrast'] };

const FIELDS = [
  { name: 'os', label: 'OS', type: 'select', options: [{ label: 'Windows', value: 'win' }, { label: 'macOS', value: 'mac' }] },
  { name: 'host', label: 'Host name', type: 'text' },
];

const titleEl = (el) => el.querySelector('.ds-criteria-filter__title');
const ruleEls = (el) => el.querySelectorAll('.ds-cf-rule');
const fieldSel = (el) => el.querySelector('.ds-cf-rule__field');

async function mk(attrs = {}) {
  const el = await fixture(html`<ds-criteria-filter></ds-criteria-filter>`);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.fields = FIELDS;
  await nextFrame();
  return el;
}

describe('ds-criteria-filter — rule tree', () => {
  it('round-trips a query through setQuery / getQuery', async () => {
    const el = await mk();
    el.query = { combinator: 'and', rules: [{ field: 'os', operator: 'is', value: 'win' }] };
    await nextFrame();

    const rules = el._allRules();
    expect(rules.length).to.equal(1);
    expect(rules[0].field).to.equal('os');
    expect(rules[0].value).to.equal('win');
    expect(el.getQuery().combinator).to.equal('and');
  });

  it('addRule grows the tree; removeRule shrinks it', async () => {
    const el = await mk();
    el.query = { combinator: 'and', rules: [{ field: 'os', operator: 'is', value: 'win' }] };
    await nextFrame();

    const start = el._allRules().length;
    el.addRule();
    await nextFrame();
    expect(el._allRules().length).to.equal(start + 1);

    const last = el._allRules()[el._allRules().length - 1];
    el.removeRule(last.id);
    await nextFrame();
    expect(el._allRules().length).to.equal(start);
  });

  it('clear resets to a single blank rule', async () => {
    const el = await mk();
    el.query = { combinator: 'and', rules: [
      { field: 'os', operator: 'is', value: 'win' },
      { field: 'host', operator: 'contains', value: 'srv' },
    ] };
    await nextFrame();
    expect(el._allRules().length).to.equal(2);

    el.clear();
    await nextFrame();
    const rules = el._allRules();
    expect(rules.length).to.equal(1);
    expect(rules[0].value ?? '').to.equal('');
  });
});

describe('ds-criteria-filter — render & structure', () => {
  it('renders the header title and a rule area seeded with one condition', async () => {
    const el = await mk();
    expect(titleEl(el), 'header title missing').to.exist;
    expect(titleEl(el).textContent).to.equal('Filter criteria');
    // With fields configured the builder opens ready to fill (one blank row).
    expect(ruleEls(el).length, 'expected one seeded rule row').to.equal(1);
    expect(fieldSel(el), 'rule field select missing').to.exist;
  });

  it('renders a "No fields configured" body when no fields are set', async () => {
    const el = await fixture(html`<ds-criteria-filter></ds-criteria-filter>`);
    await nextFrame();
    expect(el.querySelector('.ds-cf-empty-text')).to.exist;
    expect(ruleEls(el).length).to.equal(0);
  });
});

describe('ds-criteria-filter — title attribute', () => {
  it('reflects the `title` attribute into the header', async () => {
    const el = await mk({ title: 'Match hosts' });
    expect(titleEl(el).textContent).to.equal('Match hosts');
  });

  it('escapes a hostile title — no <img> node is parsed out', async () => {
    const el = await fixture(html`<ds-criteria-filter title='<img src=x onerror=alert(1)>'></ds-criteria-filter>`);
    el.fields = FIELDS;
    await nextFrame();
    expect(el.querySelector('img'), 'title injected an <img>').to.not.exist;
    expect(titleEl(el).textContent).to.contain('<img');
  });
});

describe('ds-criteria-filter — mode variants', () => {
  it('inline (default): the root is the card, with no dialog role', async () => {
    const el = await mk();
    expect(el.mode).to.equal('inline');
    expect(el._root.classList.contains('ds-criteria-filter')).to.be.true;
    expect(el.querySelector('[role="dialog"]'), 'inline mode should not be a dialog').to.not.exist;
  });

  it('popover: hosts the card as a labelled dialog', async () => {
    const el = await mk({ mode: 'popover' });
    expect(el.mode).to.equal('popover');
    expect(el._root.classList.contains('ds-cf-host--popover')).to.be.true;
    const dialog = el.querySelector('.ds-criteria-filter[role="dialog"]');
    expect(dialog, 'overlay card should be a dialog').to.exist;
    expect(dialog.getAttribute('aria-modal')).to.equal('true');
  });

  it('drawer: hosts the card as a dialog', async () => {
    const el = await mk({ mode: 'drawer' });
    expect(el.mode).to.equal('drawer');
    expect(el._root.classList.contains('ds-cf-host--drawer')).to.be.true;
    expect(el.querySelector('.ds-criteria-filter[role="dialog"]')).to.exist;
  });
});

describe('ds-criteria-filter — open / close (overlay)', () => {
  it('the `open` attribute toggles visibility WITHOUT rebuilding the controls', async () => {
    const el = await mk({ mode: 'drawer' });
    // Controls are laid out even while closed (measure-before-open).
    const control = fieldSel(el);
    expect(control, 'control missing before open').to.exist;
    expect(el._root.classList.contains('is-open'), 'starts closed').to.be.false;

    el.open();
    await nextFrame();
    expect(el._root.classList.contains('is-open'), 'open() shows the card').to.be.true;
    // Same control node — open() flips visibility, it does not re-render.
    expect(fieldSel(el), 'open must not rebuild the controls').to.equal(control);

    el.close();
    await nextFrame();
    expect(el._root.classList.contains('is-open'), 'close() hides the card').to.be.false;
    expect(fieldSel(el), 'close must not rebuild the controls').to.equal(control);

    el.open();
    await nextFrame();
    expect(el._root.classList.contains('is-open')).to.be.true;
    expect(fieldSel(el), 'reopen must not rebuild the controls').to.equal(control);
  });

  it('emits ds-criteria-filter-open / -close on the open toggle', async () => {
    const el = await mk({ mode: 'popover' });
    let opened = 0, closed = 0;
    el.addEventListener('ds-criteria-filter-open', () => (opened += 1));
    el.addEventListener('ds-criteria-filter-close', () => (closed += 1));
    el.open();
    await nextFrame();
    el.close();
    await nextFrame();
    expect(opened, 'open event').to.equal(1);
    expect(closed, 'close event').to.equal(1);
  });
});

describe('ds-criteria-filter — reactive chrome (in place)', () => {
  it('a title change repaints the header IN PLACE (rule controls keep identity)', async () => {
    const el = await mk({ title: 'Before' });
    const control = fieldSel(el);
    expect(control).to.exist;
    expect(titleEl(el).textContent).to.equal('Before');

    el.setAttribute('title', 'After');
    await nextFrame();

    // _paintChrome patched the header text without tearing down the rule tree,
    // so the same field-select DOM node survives the title change.
    expect(titleEl(el).textContent, 'title updated in place').to.equal('After');
    expect(fieldSel(el), 'title change must not rebuild the rule controls').to.equal(control);
  });

  it('an rtl change flips dir in place without rebuilding controls', async () => {
    const el = await mk();
    const control = fieldSel(el);
    el.setAttribute('rtl', '');
    await nextFrame();
    expect(el._root.getAttribute('dir')).to.equal('rtl');
    expect(fieldSel(el), 'rtl change must not rebuild the controls').to.equal(control);
  });
});

describe('ds-criteria-filter — accessibility', () => {
  it('the loading (skeleton) chrome is accessible', async () => {
    // The builder's own chrome — header + skeleton rows — is clean; this state
    // renders no ds-input-select, so it isolates the component's own a11y.
    const el = await mk({ title: 'Filter devices', loading: '' });
    await expect(el).to.be.accessible(A11Y);
  });

  // The populated rule view is now accessible: ds-input-select forwards a host
  // `aria-label` to its inner role=combobox (and strips it from the roleless host),
  // so the field/operator/value selects are named and the prohibited-attr flag is
  // gone. Regression guard for that fix.
  it('the populated rule view is accessible (ds-input-select naming forwarded)', async () => {
    const el = await mk({ title: 'Filter devices' });
    await expect(el).to.be.accessible(A11Y);
  });
});

describe('ds-criteria-filter — teardown', () => {
  it('connect → disconnect leaves no global listener leak', async () => {
    const t = trackListeners();
    try {
      const el = await fixture(html`<ds-criteria-filter mode="popover"></ds-criteria-filter>`);
      el.fields = FIELDS;
      await nextFrame();
      // Exercise the overlay listeners (keydown/pointerdown on document,
      // resize/scroll on window are all bound in connectedCallback).
      el.open();
      await nextFrame();
      el.remove();
    } finally {
      t.restore();
    }
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
  });

  it('disconnect cancels its pending timers', async () => {
    const el = await mk();
    // _render schedules a ready timer + rAF; disconnect must clear both.
    el.remove();
    expect(el._readyTimer, 'ready timeout not cleared').to.equal(0);
    expect(el._readyRaf, 'ready rAF not cleared').to.equal(0);
  });

  it('survives a disconnect → reconnect without throwing', async () => {
    const el = await mk();
    const parent = el.parentNode;
    expect(() => { el.remove(); parent.appendChild(el); }).to.not.throw();
    await nextFrame();
    expect(titleEl(el), 'header rebuilt on reconnect').to.exist;
  });
});
