/* ds-radio-group — composes standalone <ds-radio> from an `options` array (as
   ds-checkbox-group composes ds-checkbox). Covers structure, the options model,
   controlled value (attr + property), size/state cascade, card + described
   layouts, the group-change event, escaping (label/value/info — NOT description,
   which is a documented trusted-HTML slot), a11y, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/radio-group/radio-group.js';

const OPTIONS = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'daily', label: 'Daily digest', selected: true },
  { value: 'weekly', label: 'Weekly summary' },
  { value: 'never', label: 'Never', disabled: true },
];

const withOptions = async (opts = OPTIONS, attrs = {}) => {
  const el = await fixture(html`<ds-radio-group label="Frequency" name="freq"></ds-radio-group>`);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.options = opts.map((o) => ({ ...o }));
  await nextFrame();
  return el;
};

const items = (el) => el.querySelector('.ds-radio-group__items');
const radios = (el) => el.querySelectorAll('ds-radio');

describe('ds-radio-group — structure', () => {
  it('renders the header label and a role="radiogroup" items container', async () => {
    const el = await withOptions();
    expect(el.querySelector('.ds-radio-group__label').textContent).to.equal('Frequency');
    const box = items(el);
    expect(box).to.exist;
    expect(box.getAttribute('role')).to.equal('radiogroup');
    expect(box.getAttribute('aria-labelledby')).to.equal(el.querySelector('.ds-radio-group__label').id);
  });

  it('renders one <ds-radio> per option with value + label', async () => {
    const el = await withOptions();
    const r = radios(el);
    expect(r.length).to.equal(4);
    expect(r[0].getAttribute('value')).to.equal('realtime');
    expect(r[0].getAttribute('label')).to.equal('Real-time');
  });

  it('shares one native radio name across the group (from `name`)', async () => {
    const el = await withOptions();
    radios(el).forEach((r) => expect(r.getAttribute('name')).to.equal('freq'));
  });

  it('renders an empty items container for empty options (no children)', async () => {
    const el = await fixture(html`<ds-radio-group label="Empty"></ds-radio-group>`);
    await nextFrame();
    expect(items(el)).to.exist;
    expect(radios(el).length).to.equal(0);
  });
});

describe('ds-radio-group — spec defaults', () => {
  it('defaults to size s and label-position left', async () => {
    const el = await withOptions();
    expect(el.classList.contains('ds-radio-group--left')).to.be.true;
    radios(el).forEach((r) => expect(r.getAttribute('size')).to.equal('s'));
  });

  it('marks the pre-selected option checked and exposes it via `value`', async () => {
    const el = await withOptions();
    expect(el.value).to.equal('daily');
    expect(el.querySelector('ds-radio[value="daily"]').hasAttribute('checked')).to.be.true;
    expect(el.querySelector('ds-radio[value="realtime"]').hasAttribute('checked')).to.be.false;
  });

  it('marks a disabled option disabled', async () => {
    const el = await withOptions();
    expect(el.querySelector('ds-radio[value="never"]').hasAttribute('disabled')).to.be.true;
  });
});

describe('ds-radio-group — controlled value', () => {
  it('selects via the `value` attribute', async () => {
    const el = await withOptions();
    el.setAttribute('value', 'weekly');
    await nextFrame();
    expect(el.querySelector('ds-radio[value="weekly"]').hasAttribute('checked')).to.be.true;
    expect(el.querySelector('ds-radio[value="daily"]').hasAttribute('checked')).to.be.false;
    expect(el.value).to.equal('weekly');
  });

  it('selects via the `value` property setter', async () => {
    const el = await withOptions();
    el.value = 'realtime';
    await nextFrame();
    expect(el.querySelector('ds-radio[value="realtime"]').hasAttribute('checked')).to.be.true;
    expect(el.value).to.equal('realtime');
  });

  it('re-rendering from a fresh options array reflects the new selection', async () => {
    const el = await withOptions();
    el.options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', selected: true },
    ];
    await nextFrame();
    expect(radios(el).length).to.equal(2);
    expect(el.value).to.equal('b');
  });
});

describe('ds-radio-group — cascade (size / state / rtl)', () => {
  it('cascades an updated size onto every child radio', async () => {
    const el = await withOptions();
    el.setAttribute('size', 'l');
    await nextFrame();
    radios(el).forEach((r) => expect(r.getAttribute('size')).to.equal('l'));
  });

  it('state="disabled" disables all radios and flags the host', async () => {
    const el = await withOptions();
    el.setAttribute('state', 'disabled');
    await nextFrame();
    expect(el.classList.contains('ds-radio-group--disabled')).to.be.true;
    radios(el).forEach((r) => expect(r.hasAttribute('disabled')).to.be.true);
  });

  it('state="error" flags the host and the child radios', async () => {
    const el = await withOptions();
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.classList.contains('ds-radio-group--error')).to.be.true;
    radios(el).forEach((r) => expect(r.hasAttribute('error')).to.be.true);
  });

  it('rtl mirrors dir onto the host and each radio', async () => {
    const el = await withOptions();
    el.setAttribute('rtl', '');
    await nextFrame();
    expect(el.getAttribute('dir')).to.equal('rtl');
    radios(el).forEach((r) => expect(r.hasAttribute('rtl')).to.be.true);
  });
});

describe('ds-radio-group — card & described layouts', () => {
  it('variant="card" wraps each option and flags the host', async () => {
    const el = await withOptions(OPTIONS, { variant: 'card' });
    expect(el.classList.contains('ds-radio-group--card')).to.be.true;
    expect(el.querySelectorAll('.ds-radio-group__option').length).to.equal(4);
  });

  it('described options switch the group to has-desc and render the description', async () => {
    const el = await withOptions([
      { value: 'machine', label: 'On each machine',
        description: 'Agents patch from <strong>each machine\'s own repos</strong>.' },
      { value: 'server', label: 'From the server' },
    ]);
    expect(el.classList.contains('ds-radio-group--has-desc')).to.be.true;
    const described = el.querySelector('.ds-radio-group__option--described');
    expect(described).to.exist;
    const desc = described.querySelector('.ds-radio-group__option-desc');
    expect(desc).to.exist;
    /* description is a documented TRUSTED-HTML slot → the <strong> renders as markup */
    expect(desc.querySelector('strong'), 'trusted inline HTML renders as-is').to.exist;
  });

  it('wires a described radio to its description via aria-describedby', async () => {
    const el = await withOptions([
      { value: 'm', label: 'Machine', description: 'Uses local repos.' },
    ]);
    const desc = el.querySelector('.ds-radio-group__option-desc');
    const input = el.querySelector('ds-radio .ds-radio__input');
    expect(input.getAttribute('aria-describedby')).to.equal(desc.id);
  });

  it('renders a per-option info tooltip when `info` is set', async () => {
    const el = await withOptions([
      { value: 'x', label: 'X', info: 'Extra detail' },
    ]);
    expect(el.querySelector('.ds-radio-group__option-info')).to.exist;
  });
});

describe('ds-radio-group — events', () => {
  it('emits ds-radio-group-change with the new value when a radio is picked', async () => {
    const el = await withOptions();
    const target = el.querySelector('ds-radio[value="weekly"]');
    setTimeout(() => target.click());
    const ev = await oneEvent(el, 'ds-radio-group-change');
    expect(ev.detail.value).to.equal('weekly');
    expect(el.value).to.equal('weekly');
  });
});

describe('ds-radio-group — escaping', () => {
  it('renders a hostile option label as literal text (no injected <img>)', async () => {
    const el = await withOptions([
      { value: 'safe', label: '<img src=x onerror=alert(1)>' },
    ]);
    expect(items(el).querySelector('img'), 'label must not create an <img>').to.not.exist;
    expect(el.querySelector('.ds-radio__label').textContent).to.contain('<img');
  });

  it('renders a hostile option value without injecting markup', async () => {
    const el = await withOptions([
      { value: '"><img src=x onerror=alert(1)>', label: 'V' },
    ]);
    expect(items(el).querySelector('img'), 'value must not create an <img>').to.not.exist;
    expect(radios(el).length).to.equal(1);
  });

  it('renders a hostile option info string without injecting markup', async () => {
    const el = await withOptions([
      { value: 'i', label: 'I', info: '"><img src=x onerror=alert(1)>' },
    ]);
    expect(items(el).querySelector('img'), 'info must not create an <img>').to.not.exist;
    expect(el.querySelector('.ds-radio-group__option-info')).to.exist;
  });

  it('renders a hostile group label as literal text', async () => {
    const el = await fixture(html`<ds-radio-group label='"><img src=x onerror=alert(1)>'></ds-radio-group>`);
    await nextFrame();
    const lbl = el.querySelector('.ds-radio-group__label');
    expect(lbl.querySelector('img')).to.not.exist;
    expect(lbl.textContent).to.contain('<img');
  });
});

describe('ds-radio-group — a11y', () => {
  it('is accessible with a selection and helper text', async () => {
    const el = await fixture(html`<ds-radio-group label="Frequency" name="freq"
      helper="We'll send alerts based on this preference."></ds-radio-group>`);
    el.options = OPTIONS.map((o) => ({ ...o }));
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-radio-group — teardown', () => {
  it('disconnects without throwing', async () => {
    const el = await withOptions();
    expect(() => el.remove()).to.not.throw();
  });

  it('survives disconnect → reconnect without duplicating radios', async () => {
    const el = await withOptions();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(radios(el).length).to.equal(4);
  });
});

describe('ds-radio-group — repaint-split', () => {
  it('keeps each child ds-radio node across a visual-only size change', async () => {
    const el = await withOptions();
    const radio = el.querySelector('ds-radio');
    expect(radio, 'radio rendered').to.exist;
    el.setAttribute('size', 'l');
    await nextFrame();
    expect(el.querySelector('ds-radio'), 'same ds-radio node (not rebuilt via innerHTML)').to.equal(radio);
    expect(radio.getAttribute('size'), 'size cascaded in place').to.equal('l');
  });
});
