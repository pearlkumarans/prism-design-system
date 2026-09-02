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
