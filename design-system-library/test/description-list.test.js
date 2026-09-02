/* ds-description-list — term/value metadata pairs (maps to <dl>).
   Covers: one row per item, the DATA-escaping contract on plain term/description
   (hostile strings render as literal text), typed-value sub-component mapping,
   the empty → em-dash edge case, the edit/help events, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/description-list/description-list.js';

const XSS = '"><img src=x onerror=alert(1)>';
const items = (el) => el.querySelectorAll('.ds-description-list__item');

describe('ds-description-list — rows & data', () => {
  it('renders one item row per data entry', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [
      { term: 'Status', description: 'Active' },
      { term: 'Owner', description: 'Jane Doe' },
      { term: 'Region', description: 'US' },
    ];
    await nextFrame();
    expect(items(el).length).to.equal(3);
  });

  it('renders term + value text for a plain (text) item', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'Owner', description: 'Jane Doe' }];
    await nextFrame();
    expect(el.querySelector('.ds-description-list__term-text').textContent).to.equal('Owner');
    expect(el.querySelector('.ds-description-list__value-text').textContent).to.equal('Jane Doe');
  });

  it('renders an em-dash for an empty description', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'Region', description: '' }];
    await nextFrame();
    expect(el.querySelector('.ds-description-list__value-text').textContent).to.equal('—');
    expect(el.querySelector('.ds-description-list__value--empty')).to.exist;
  });

  it('round-trips the items property (getter returns a copy of the data)', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    const data = [{ term: 'A', description: '1' }];
    el.items = data;
    await nextFrame();
    expect(el.items).to.deep.equal(data);
    expect(el.items).to.not.equal(data); // defensive copy
  });
});

describe('ds-description-list — escaping (DATA fields render as text)', () => {
  it('escapes a hostile term — no injected <img>, literal text preserved', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: XSS, description: 'ok' }];
    await nextFrame();
    const termEl = el.querySelector('.ds-description-list__term-text');
    expect(termEl.querySelector('img')).to.not.exist;
    expect(termEl.textContent).to.contain('<img');
  });

  it('escapes a hostile description — no injected <img>, literal text preserved', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'T', description: XSS }];
    await nextFrame();
    const valEl = el.querySelector('.ds-description-list__value-text');
    expect(valEl.querySelector('img')).to.not.exist;
    expect(valEl.textContent).to.contain('<img');
  });

  it('does not double-escape a plain ampersand', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'R&D', description: 'AT&T' }];
    await nextFrame();
    expect(el.querySelector('.ds-description-list__term-text').textContent).to.equal('R&D');
    expect(el.querySelector('.ds-description-list__value-text').textContent).to.equal('AT&T');
  });
});

describe('ds-description-list — typed values map to Prism components', () => {
  it('type:status renders a ds-status-indicator', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'State', type: 'status', status: 'success', description: 'Active' }];
    await nextFrame();
    const si = el.querySelector('ds-status-indicator');
    expect(si).to.exist;
    expect(si.getAttribute('status')).to.equal('success');
  });

  it('type:user renders a ds-avatar with the user name', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'Owner', type: 'user', name: 'Jane Doe', email: 'jane@x.io' }];
    await nextFrame();
    expect(el.querySelector('ds-avatar')).to.exist;
    expect(el.querySelector('.ds-description-list__user-email').textContent).to.equal('jane@x.io');
  });

  it('type:link renders a ds-text-link with the href', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'KB', type: 'link', description: 'KB5028166', href: 'https://x.io/a' }];
    await nextFrame();
    const link = el.querySelector('ds-text-link');
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal('https://x.io/a');
  });
});

describe('ds-description-list — events', () => {
  it('fires ds-description-list-edit with the row index/term', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'Owner', description: 'Jane', editable: true }];
    await nextFrame();
    setTimeout(() => el.querySelector('[data-edit]').click());
    const ev = await oneEvent(el, 'ds-description-list-edit');
    expect(ev.detail.index).to.equal(0);
    expect(ev.detail.term).to.equal('Owner');
  });

  it('fires ds-description-list-help when the help button is clicked', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'Owner', description: 'Jane', help: 'The billing owner' }];
    await nextFrame();
    setTimeout(() => el.querySelector('[data-help]').click());
    const ev = await oneEvent(el, 'ds-description-list-help');
    expect(ev.detail.index).to.equal(0);
  });
});

describe('ds-description-list — teardown', () => {
  it('disconnects without throwing', async () => {
    const el = await fixture(html`<ds-description-list></ds-description-list>`);
    el.items = [{ term: 'A', description: '1' }];
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
  });
});
