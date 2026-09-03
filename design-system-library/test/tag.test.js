/* ds-tag — interactive chip. Light-DOM (query `el.querySelector('.ds-tag')`).
   Spec defaults: variant=neutral, size=small, show-close=true (default-on;
   only show-close="false" hides it). One tab stop; the close button is
   tabindex=-1 and Backspace/Delete on the focused tag mirrors a close. Emits
   ds-tag-close then removes itself. Covers structure, defaults, variants/sizes,
   leading status/icon, show-close contract, label+slotted, removal (click +
   keyboard), disabled, reactivity, escaping, a11y and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/tag/tag.js';

const XSS = '<img src=x onerror=alert(1)>';

const root = (el) => el.querySelector('.ds-tag');
const label = (el) => el.querySelector('.ds-tag__label');
const closeBtn = (el) => el.querySelector('[data-close]');

describe('ds-tag — structure & defaults', () => {
  it('renders a single root chip with a label', async () => {
    const el = await fixture(html`<ds-tag label="Marketing"></ds-tag>`);
    expect(root(el), 'root missing').to.exist;
    expect(el.children.length, 'host has exactly one element child').to.equal(1);
    expect(label(el).textContent).to.equal('Marketing');
  });

  it('defaults to neutral + small per spec', async () => {
    const el = await fixture(html`<ds-tag label="Tag"></ds-tag>`);
    expect(root(el).classList.contains('ds-tag--neutral')).to.be.true;
    expect(root(el).classList.contains('ds-tag--small')).to.be.true;
  });

  it('is a single tab stop (tabindex=0) with a tabindex=-1 close button', async () => {
    const el = await fixture(html`<ds-tag label="Tag"></ds-tag>`);
    expect(root(el).getAttribute('tabindex')).to.equal('0');
    expect(closeBtn(el).getAttribute('tabindex')).to.equal('-1');
  });
});

describe('ds-tag — variants & sizes', () => {
  it('reflects variant + size attributes', async () => {
    const el = await fixture(html`<ds-tag label="Tag" variant="success" size="large"></ds-tag>`);
    expect(root(el).classList.contains('ds-tag--success')).to.be.true;
    expect(root(el).classList.contains('ds-tag--large')).to.be.true;
  });

  it('falls back to the default variant on an invalid value', async () => {
    const el = await fixture(html`<ds-tag label="Tag" variant="bogus"></ds-tag>`);
    expect(root(el).classList.contains('ds-tag--neutral')).to.be.true;
  });

  it('updates the variant class reactively', async () => {
    const el = await fixture(html`<ds-tag label="Tag"></ds-tag>`);
    el.setAttribute('variant', 'error');
    await nextFrame();
    expect(root(el).classList.contains('ds-tag--error')).to.be.true;
    expect(root(el).classList.contains('ds-tag--neutral')).to.be.false;
  });
});

describe('ds-tag — leading', () => {
  it('leading="status" renders a status dot', async () => {
    const el = await fixture(html`<ds-tag label="Tag" leading="status"></ds-tag>`);
    expect(root(el).classList.contains('ds-tag--leading-status')).to.be.true;
    expect(el.querySelector('.ds-tag__dot')).to.exist;
  });

  it('accepts the legacy "dot" alias for status', async () => {
    const el = await fixture(html`<ds-tag label="Tag" leading="dot"></ds-tag>`);
    expect(root(el).classList.contains('ds-tag--leading-status')).to.be.true;
  });

  it('leading="icon" with an icon renders a leading icon', async () => {
    const el = await fixture(html`<ds-tag label="Tag" leading="icon" icon="tag"></ds-tag>`);
    expect(root(el).classList.contains('ds-tag--leading-icon')).to.be.true;
    const icon = el.querySelector('.ds-tag__icon ds-icon');
    expect(icon).to.exist;
    expect(icon.getAttribute('name')).to.equal('tag');
  });
});

describe('ds-tag — close affordance (default-on contract)', () => {
  it('shows the close button by default', async () => {
    const el = await fixture(html`<ds-tag label="Tag"></ds-tag>`);
    expect(closeBtn(el), 'close button should be present by default').to.exist;
    expect(root(el).classList.contains('ds-tag--no-close')).to.be.false;
  });

  it('hides the close button only for show-close="false"', async () => {
    const el = await fixture(html`<ds-tag label="Tag" show-close="false"></ds-tag>`);
    expect(closeBtn(el), 'close button should be hidden').to.not.exist;
    expect(root(el).classList.contains('ds-tag--no-close')).to.be.true;
  });

  it('a bare show-close attribute still shows the close button', async () => {
    const el = await fixture(html`<ds-tag label="Tag" show-close></ds-tag>`);
    expect(closeBtn(el)).to.exist;
  });
});

describe('ds-tag — label sources', () => {
  it('the label attribute wins over slotted content', async () => {
    const el = await fixture(html`<ds-tag label="Attr">Slotted</ds-tag>`);
    expect(label(el).textContent).to.equal('Attr');
  });

  it('falls back to the slotted label, then to "Tag"', async () => {
    const slotted = await fixture(html`<ds-tag>Sales</ds-tag>`);
    expect(label(slotted).textContent).to.equal('Sales');
    const bare = await fixture(html`<ds-tag></ds-tag>`);
    expect(label(bare).textContent).to.equal('Tag');
  });
});

describe('ds-tag — removal', () => {
  it('clicking close emits ds-tag-close with the label and removes the host', async () => {
    const el = await fixture(html`<ds-tag label="Marketing"></ds-tag>`);
    setTimeout(() => closeBtn(el).click());
    const ev = await oneEvent(el, 'ds-tag-close');
    expect(ev.detail.label).to.equal('Marketing');
    expect(el.isConnected, 'host removed after close').to.be.false;
  });

  it('Backspace on the focused tag mirrors a close', async () => {
    const el = await fixture(html`<ds-tag label="Marketing"></ds-tag>`);
    let fired = 0;
    el.addEventListener('ds-tag-close', () => (fired += 1));
    root(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    await nextFrame();
    expect(fired).to.equal(1);
    expect(el.isConnected).to.be.false;
  });

  it('Delete on the focused tag mirrors a close', async () => {
    const el = await fixture(html`<ds-tag label="Ops"></ds-tag>`);
    let fired = 0;
    el.addEventListener('ds-tag-close', () => (fired += 1));
    root(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    await nextFrame();
    expect(fired).to.equal(1);
  });
});

describe('ds-tag — disabled', () => {
  it('disabled drops the tab stop, marks aria-disabled, and ignores keyboard removal', async () => {
    const el = await fixture(html`<ds-tag label="Tag" disabled></ds-tag>`);
    expect(root(el).hasAttribute('tabindex')).to.be.false;
    expect(root(el).getAttribute('aria-disabled')).to.equal('true');
    let fired = 0;
    el.addEventListener('ds-tag-close', () => (fired += 1));
    root(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    await nextFrame();
    expect(fired, 'disabled tag must not close on keyboard').to.equal(0);
    expect(el.isConnected).to.be.true;
  });
});

describe('ds-tag — escaping', () => {
  it('renders a hostile label as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-tag label="${XSS}"></ds-tag>`);
    expect(label(el).querySelector('img'), 'label injected an <img>').to.not.exist;
    expect(label(el).textContent).to.contain('<img');
  });
});

describe('ds-tag — a11y', () => {
  it('is accessible', async () => {
    const el = await fixture(html`<ds-tag label="Marketing" leading="status"></ds-tag>`);
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-tag — repaint-split', () => {
  it('keeps the leading ds-icon node across a visual-only variant change', async () => {
    const el = await fixture(html`<ds-tag label="Tag" leading="icon" icon="shield" variant="neutral"></ds-tag>`);
    const icon = el.querySelector('.ds-tag__icon ds-icon');
    expect(icon, 'leading icon rendered').to.exist;
    el.setAttribute('variant', 'success');
    await nextFrame();
    expect(el.querySelector('.ds-tag__icon ds-icon'), 'same ds-icon node (not re-parsed)').to.equal(icon);
    expect(root(el).classList.contains('ds-tag--success'), 'variant class applied').to.be.true;
  });
});

describe('ds-tag — teardown', () => {
  it('survives disconnect → reconnect without duplicating structure or throwing', async () => {
    const el = await fixture(html`<ds-tag label="Tag"></ds-tag>`);
    const parent = el.parentNode;
    expect(() => el.remove()).to.not.throw();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-tag').length, 'exactly one root').to.equal(1);
    expect(label(el).textContent).to.equal('Tag');
  });
});
