/* ds-progress-bar — a labelled track + fill with a role="progressbar". Covers
   the structure, spec defaults (default/small), the width% + aria-value wiring,
   value clamping, the "{pct}%" value-label default, indeterminate (no
   aria-valuenow), the label row toggle, and label/value escaping. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/progress-bar/progress-bar.js';

const XSS = '<img src=x onerror=alert(1)>';
const track = (el) => el.querySelector('.ds-progress-bar__track');
const fill = (el) => el.querySelector('.ds-progress-bar__fill');
const labelEl = (el) => el.querySelector('.ds-progress-bar__label');
const valueEl = (el) => el.querySelector('.ds-progress-bar__value');

describe('ds-progress-bar — structure & defaults', () => {
  it('renders a track + fill with the progressbar role', async () => {
    const el = await fixture(html`<ds-progress-bar value="42"></ds-progress-bar>`);
    expect(track(el), 'track missing').to.exist;
    expect(fill(el), 'fill missing').to.exist;
    expect(track(el).getAttribute('role')).to.equal('progressbar');
  });

  it('applies the spec default classes (default / small)', async () => {
    const el = await fixture(html`<ds-progress-bar value="10"></ds-progress-bar>`);
    const bar = el.querySelector('.ds-progress-bar');
    expect(bar.classList.contains('ds-progress-bar--default')).to.be.true;
    expect(bar.classList.contains('ds-progress-bar--small')).to.be.true;
  });

  it('sets the fill width and aria values from value/max', async () => {
    const el = await fixture(html`<ds-progress-bar value="42" max="100" label="Uploading"></ds-progress-bar>`);
    expect(fill(el).style.width).to.equal('42%');
    expect(track(el).getAttribute('aria-valuenow')).to.equal('42');
    expect(track(el).getAttribute('aria-valuemin')).to.equal('0');
    expect(track(el).getAttribute('aria-valuemax')).to.equal('100');
    expect(track(el).getAttribute('aria-label')).to.equal('Uploading');
  });

  it('defaults the value-label to "{pct}%"', async () => {
    const el = await fixture(html`<ds-progress-bar value="42"></ds-progress-bar>`);
    expect(valueEl(el).textContent.trim()).to.equal('42%');
  });

  it('clamps value into [0, max]', async () => {
    const over = await fixture(html`<ds-progress-bar value="500" max="100"></ds-progress-bar>`);
    expect(over.querySelector('.ds-progress-bar__fill').style.width).to.equal('100%');
    expect(track(over).getAttribute('aria-valuenow')).to.equal('100');
    const under = await fixture(html`<ds-progress-bar value="-5" max="100"></ds-progress-bar>`);
    expect(under.querySelector('.ds-progress-bar__fill').style.width).to.equal('0%');
  });
});

describe('ds-progress-bar — variants, labels & escaping', () => {
  it('reflects supplied variant/size and falls back on invalid enums', async () => {
    const el = await fixture(html`<ds-progress-bar variant="success" size="large" value="1"></ds-progress-bar>`);
    const bar = el.querySelector('.ds-progress-bar');
    expect(bar.classList.contains('ds-progress-bar--success')).to.be.true;
    expect(bar.classList.contains('ds-progress-bar--large')).to.be.true;
    const bogus = await fixture(html`<ds-progress-bar variant="bogus" value="1"></ds-progress-bar>`);
    expect(bogus.querySelector('.ds-progress-bar').classList.contains('ds-progress-bar--default')).to.be.true;
  });

  it('indeterminate omits aria-valuenow and renders "—"', async () => {
    const el = await fixture(html`<ds-progress-bar variant="indeterminate"></ds-progress-bar>`);
    expect(track(el).getAttribute('role')).to.equal('progressbar');
    expect(track(el).hasAttribute('aria-valuenow')).to.be.false;
    expect(valueEl(el).textContent.trim()).to.equal('—');
  });

  it('hides the label row when show-label="false"', async () => {
    const el = await fixture(html`<ds-progress-bar value="10" show-label="false"></ds-progress-bar>`);
    expect(labelEl(el)).to.not.exist;
    expect(valueEl(el)).to.not.exist;
    /* the track still renders */
    expect(track(el)).to.exist;
  });

  it('a custom value-label is exposed via aria-valuetext', async () => {
    const el = await fixture(html`<ds-progress-bar value="3" max="8" value-label="Step 3 of 8"></ds-progress-bar>`);
    expect(valueEl(el).textContent.trim()).to.equal('Step 3 of 8');
    expect(track(el).getAttribute('aria-valuetext')).to.equal('Step 3 of 8');
  });

  it('escapes a hostile label and value-label — no <img> injected', async () => {
    const el = await fixture(html`<ds-progress-bar value="1" label="${XSS}" value-label="${XSS}"></ds-progress-bar>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
    expect(labelEl(el).textContent).to.contain('<img');
    expect(valueEl(el).textContent).to.contain('<img');
  });
});

describe('ds-progress-bar — shape="circle"', () => {
  /* Geometry assertions need the real stylesheet: the shared harness does not
     load component CSS, so stroke width and the rendered box would otherwise read
     as initial values. Each load races a timer and never rejects — a stalled
     sheet must not hang the suite. */
  before(async () => {
    const HREFS = ['/src/tokens/primitives.css', '/src/tokens/spacing.css',
      '/src/tokens/typography.css', '/src/tokens/tokens.css',
      '/src/components/progress-bar/progress-bar.css'];
    await Promise.all(HREFS.map((href) => new Promise((resolve) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      link.addEventListener('load', resolve);
      link.addEventListener('error', resolve);
      setTimeout(resolve, 2000);
      document.head.appendChild(link);
    })));
    await nextFrame();
  });

  const C = 2 * Math.PI * 45;                       // must match progress-bar.js
  const ring = (el) => el.querySelector('.ds-progress-bar__circle-fill');
  const pctOf = (el) => (1 - parseFloat(ring(el).getAttribute('stroke-dashoffset')) / C) * 100;

  it('defaults to the bar, so existing consumers are untouched', async () => {
    const el = await fixture(html`<ds-progress-bar value="40"></ds-progress-bar>`);
    expect(el.querySelector('.ds-progress-bar__track'), 'still a bar').to.exist;
    expect(el.querySelector('.ds-progress-bar__circle')).to.not.exist;
  });

  it('falls back to the bar on an unknown shape', async () => {
    const el = await fixture(html`<ds-progress-bar shape="bogus" value="40"></ds-progress-bar>`);
    expect(el.querySelector('.ds-progress-bar__track')).to.exist;
  });

  it('draws the arc from the value, not from a hardcoded table', async () => {
    for (const v of [0, 25, 50, 75, 100]) {
      const el = await fixture(html`<ds-progress-bar shape="circle" value="${v}"></ds-progress-bar>`);
      expect(Math.round(pctOf(el)), `${v}%`).to.equal(v);
    }
  });

  it('respects max when computing the arc', async () => {
    const el = await fixture(html`<ds-progress-bar shape="circle" value="25" max="50"></ds-progress-bar>`);
    expect(Math.round(pctOf(el)), '25 of 50 is half the ring').to.equal(50);
  });

  it('clamps out-of-range values to a full or empty ring', async () => {
    const over = await fixture(html`<ds-progress-bar shape="circle" value="150"></ds-progress-bar>`);
    expect(Math.round(pctOf(over))).to.equal(100);
    const under = await fixture(html`<ds-progress-bar shape="circle" value="-20"></ds-progress-bar>`);
    expect(Math.round(pctOf(under))).to.equal(0);
  });

  it('keeps the SAME aria contract as the bar', async () => {
    const el = await fixture(html`<ds-progress-bar shape="circle" value="40" label="Scanning"></ds-progress-bar>`);
    const wrap = el.querySelector('.ds-progress-bar__circle');
    expect(wrap.getAttribute('role')).to.equal('progressbar');
    expect(wrap.getAttribute('aria-valuenow')).to.equal('40');
    expect(wrap.getAttribute('aria-valuemin')).to.equal('0');
    expect(wrap.getAttribute('aria-label')).to.equal('Scanning');
    /* One progressbar, not a graphic nested inside one. */
    expect(el.querySelector('svg').getAttribute('aria-hidden')).to.equal('true');
  });

  it('omits aria-valuenow when indeterminate, as the bar does', async () => {
    const el = await fixture(html`<ds-progress-bar shape="circle" variant="indeterminate" label="Working"></ds-progress-bar>`);
    const wrap = el.querySelector('.ds-progress-bar__circle');
    expect(wrap.hasAttribute('aria-valuenow'), 'absence is what signals unknown').to.be.false;
    expect(wrap.getAttribute('role')).to.equal('progressbar');
    expect(ring(el).hasAttribute('stroke-dashoffset'), 'no fixed arc position').to.be.false;
  });

  it('exposes a custom value-label through aria-valuetext', async () => {
    const el = await fixture(html`<ds-progress-bar shape="circle" value="3" max="8" value-label="Step 3 of 8"></ds-progress-bar>`);
    expect(el.querySelector('.ds-progress-bar__circle').getAttribute('aria-valuetext')).to.equal('Step 3 of 8');
    expect(el.querySelector('.ds-progress-bar__center').textContent).to.equal('Step 3 of 8');
  });

  it('renders a bare ring when show-label is false', async () => {
    const el = await fixture(html`<ds-progress-bar shape="circle" value="60" show-label="false"></ds-progress-bar>`);
    expect(el.querySelector('.ds-progress-bar__center'), 'no centre value').to.not.exist;
    expect(el.querySelector('.ds-progress-bar__caption'), 'no caption').to.not.exist;
    /* The value is still announced — hiding text must not hide it from AT. */
    expect(el.querySelector('.ds-progress-bar__circle').getAttribute('aria-valuenow')).to.equal('60');
  });

  it('sizes the ring and its stroke per size', async () => {
    const expected = { small: [32, '3px'], medium: [48, '4px'], large: [64, '6px'] };
    for (const [size, [px, stroke]] of Object.entries(expected)) {
      const el = await fixture(html`<ds-progress-bar shape="circle" size="${size}" value="50"></ds-progress-bar>`);
      const box = el.querySelector('.ds-progress-bar__circle').getBoundingClientRect();
      expect(Math.round(box.width), `${size} diameter`).to.equal(px);
      expect(Math.round(box.height), `${size} is a circle`).to.equal(px);
      expect(getComputedStyle(ring(el)).strokeWidth, `${size} stroke`).to.equal(stroke);
    }
  });

  it('escapes label and value-label into the ring', async () => {
    const XSS = '<img src=x onerror=alert(1)>';
    const el = await fixture(html`<ds-progress-bar shape="circle" value="10" label="${XSS}" value-label="${XSS}"></ds-progress-bar>`);
    expect(el.querySelector('img'), 'no element from either string').to.not.exist;
    expect(el.querySelector('.ds-progress-bar__caption').textContent).to.equal(XSS);
  });

  it('patches the arc in place on a value change, so the ring animates', async () => {
    /* A full re-render would recreate the circle and the stroke-dashoffset
       transition would jump instead of sweeping. */
    const el = await fixture(html`<ds-progress-bar shape="circle" value="20"></ds-progress-bar>`);
    const before = ring(el);
    el.setAttribute('value', '80');
    await nextFrame();
    expect(ring(el), 'same node, not re-parsed').to.equal(before);
    expect(Math.round(pctOf(el))).to.equal(80);
    expect(el.querySelector('.ds-progress-bar__center').textContent).to.equal('80%');
  });

  it('rebuilds when the shape changes', async () => {
    /* shape swaps the whole tree; patching would leave a bar fill in a ring. */
    const el = await fixture(html`<ds-progress-bar value="50"></ds-progress-bar>`);
    expect(el.querySelector('.ds-progress-bar__track')).to.exist;
    el.setAttribute('shape', 'circle');
    await nextFrame();
    expect(el.querySelector('.ds-progress-bar__track'), 'bar markup gone').to.not.exist;
    expect(Math.round(pctOf(el)), 'value carried across').to.equal(50);
  });

  it('is accessible', async () => {
    const el = await fixture(html`<ds-progress-bar shape="circle" value="40" label="Scanning"></ds-progress-bar>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});
