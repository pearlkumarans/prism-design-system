/* ds-pagination — page navigation. Covers the truncation algorithm (pills +
   ellipses), clamping + change events, page-size reset, the simple/compact
   modes, disabled, range summary, and a11y (nav landmark + aria-current). */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/pagination/pagination.js';

const pills = (el) => [...el.querySelectorAll('.ds-pagination__page')];
const pillNums = (el) => pills(el).map((b) => b.textContent.trim());
const current = (el) => el.querySelector('.ds-pagination__page.is-current');
const hasEllipsis = (el) => !!el.querySelector('.ds-pagination__ellipsis');

describe('ds-pagination — structure & totals', () => {
  it('is a <nav> labelled Pagination', async () => {
    const el = await fixture(html`<ds-pagination total-items="100" page-size="20"></ds-pagination>`);
    await nextFrame();
    expect(el.querySelector('nav.ds-pagination')).to.exist;
    expect(el.querySelector('nav').getAttribute('aria-label')).to.equal('Pagination');
  });

  it('derives totalPages from total-items / page-size', async () => {
    const el = await fixture(html`<ds-pagination total-items="95" page-size="20"></ds-pagination>`);
    expect(el.totalPages).to.equal(5); // ceil(95/20)
  });

  it('marks the current page with aria-current and the is-current class', async () => {
    const el = await fixture(html`<ds-pagination total-items="100" page-size="20" page="3"></ds-pagination>`);
    await nextFrame();
    const cur = current(el);
    expect(cur.textContent.trim()).to.equal('3');
    expect(cur.getAttribute('aria-current')).to.equal('page');
  });
});

describe('ds-pagination — truncation', () => {
  it('shows both boundaries and an ellipsis in the middle', async () => {
    const el = await fixture(html`<ds-pagination total-items="200" page-size="20" page="6"></ds-pagination>`); // 10 pages
    await nextFrame();
    const nums = pillNums(el);
    expect(nums).to.include('1');
    expect(nums).to.include('10');
    expect(nums).to.include('6');
    expect(hasEllipsis(el), 'mid page truncates with an ellipsis').to.be.true;
  });

  it('no leading ellipsis on the first page; prev arrow is disabled', async () => {
    const el = await fixture(html`<ds-pagination total-items="200" page-size="20" page="1"></ds-pagination>`);
    await nextFrame();
    expect(current(el).textContent.trim()).to.equal('1');
    const prev = el.querySelector('[data-act="prev"]');
    expect(prev.hasAttribute('disabled'), 'prev disabled on first page').to.be.true;
  });
});

describe('ds-pagination — navigation & events', () => {
  it('next() advances and emits ds-pagination-change with source', async () => {
    const el = await fixture(html`<ds-pagination total-items="200" page-size="20" page="1"></ds-pagination>`);
    setTimeout(() => el.next());
    const ev = await oneEvent(el, 'ds-pagination-change');
    expect(ev.detail).to.deep.equal({ page: 2, pageSize: 20, source: 'next' });
    expect(el.page).to.equal(2);
  });

  it('clamps goTo() to [1, totalPages] and does not emit when unchanged', async () => {
    const el = await fixture(html`<ds-pagination total-items="60" page-size="20" page="3"></ds-pagination>`); // 3 pages
    let fired = 0;
    el.addEventListener('ds-pagination-change', () => (fired += 1));
    el.goTo(99);           // clamps to 3 (== current) → no event
    expect(el.page).to.equal(3);
    expect(fired, 'no event for a no-op clamp').to.equal(0);
    el.goTo(-5);           // clamps to 1 → event
    expect(el.page).to.equal(1);
    expect(fired).to.equal(1);
  });

  it('clicking a page pill navigates', async () => {
    const el = await fixture(html`<ds-pagination total-items="200" page-size="20" page="1"></ds-pagination>`);
    await nextFrame();
    const five = pills(el).find((b) => b.textContent.trim() === '5');
    setTimeout(() => five.click());
    const ev = await oneEvent(el, 'ds-pagination-change');
    expect(ev.detail.page).to.equal(5);
  });

  it('disabled blocks navigation', async () => {
    const el = await fixture(html`<ds-pagination total-items="200" page-size="20" page="2" disabled></ds-pagination>`);
    let fired = 0;
    el.addEventListener('ds-pagination-change', () => (fired += 1));
    el.next();
    expect(fired).to.equal(0);
    expect(el.page).to.equal(2);
  });
});

describe('ds-pagination — page size', () => {
  it('changing page size emits page-size-change and resets to page 1', async () => {
    const el = await fixture(html`<ds-pagination total-items="200" page-size="20" page="4" show-page-size></ds-pagination>`);
    await nextFrame();
    const sel = el.querySelector('[data-page-size]');
    expect(sel, 'ds-input-select rendered').to.exist;
    setTimeout(() => sel.dispatchEvent(new CustomEvent('ds-input-select-change', { detail: { value: '50' }, bubbles: true })));
    const ev = await oneEvent(el, 'ds-pagination-page-size-change');
    expect(ev.detail).to.deep.equal({ pageSize: 50, page: 1 });
    expect(el.pageSize).to.equal(50);
    expect(el.page).to.equal(1);
  });
});

describe('ds-pagination — modes', () => {
  it('simple mode renders text prev/next, no number pills', async () => {
    const el = await fixture(html`<ds-pagination mode="simple" total-items="200" page-size="20" page="1"></ds-pagination>`);
    await nextFrame();
    expect(pills(el).length, 'no number pills in simple').to.equal(0);
    const prev = el.querySelector('[data-act="prev"]');
    const next = el.querySelector('[data-act="next"]');
    expect(prev).to.exist; expect(next).to.exist;
    expect(prev.hasAttribute('disabled'), 'prev disabled on page 1').to.be.true;
  });

  it('compact mode shows "Page X of Y"', async () => {
    const el = await fixture(html`<ds-pagination mode="compact" total-items="200" page-size="20" page="6"></ds-pagination>`);
    await nextFrame();
    const status = el.querySelector('.ds-pagination__status');
    expect(status.textContent.replace(/\s+/g, ' ').trim()).to.equal('Page 6 of 10');
  });

  it('dots mode renders one dot per page, marks done/current, and navigates', async () => {
    const el = await fixture(html`<ds-pagination mode="dots" total-items="160" page-size="20" page="3"></ds-pagination>`); // 8 pages
    await nextFrame();
    const dots = [...el.querySelectorAll('.ds-pagination__dot')];
    expect(dots.length, 'one dot per page').to.equal(8);
    expect(el.querySelectorAll('.ds-pagination__dot.is-done').length, 'pages 1-2 done').to.equal(2);
    const cur = el.querySelector('.ds-pagination__dot.is-current');
    expect(cur.getAttribute('aria-current')).to.equal('page');
    expect([...dots].indexOf(cur), 'current is the 3rd dot').to.equal(2);
    setTimeout(() => dots[5].click());
    const ev = await oneEvent(el, 'ds-pagination-change');
    expect(ev.detail.page).to.equal(6);
  });

  it('dots mode repaints the active state in place (same elements) so transitions animate', async () => {
    const el = await fixture(html`<ds-pagination mode="dots" total-items="160" page-size="20" page="3"></ds-pagination>`); // 8 pages
    await nextFrame();
    const dotsBefore = [...el.querySelectorAll('.ds-pagination__dot')];
    el.next(); // page 3 → 4, page-only change
    await nextFrame();
    const dotsAfter = [...el.querySelectorAll('.ds-pagination__dot')];
    // Same DOM nodes reused (not rebuilt) — this is what lets the CSS transition run.
    expect(dotsAfter.length).to.equal(dotsBefore.length);
    dotsAfter.forEach((d, i) => expect(d, `dot ${i} is the same element`).to.equal(dotsBefore[i]));
    // and the current marker moved to the 4th dot
    expect([...dotsAfter].indexOf(el.querySelector('.ds-pagination__dot.is-current'))).to.equal(3);
    expect(el.querySelectorAll('.ds-pagination__dot.is-done').length).to.equal(3);
  });

  it('dots mode with show-range shows an "n of N" count, not an item range', async () => {
    const el = await fixture(html`<ds-pagination mode="dots" total-items="160" page-size="20" page="3" show-range></ds-pagination>`);
    await nextFrame();
    expect(el.querySelector('.ds-pagination__range'), 'no item-range in dots').to.not.exist;
    const count = el.querySelector('.ds-pagination__count');
    expect(count.textContent.replace(/\s+/g, ' ').trim()).to.equal('3 of 8');
  });
});

describe('ds-pagination — range', () => {
  it('show-range renders "start–end of total"', async () => {
    const el = await fixture(html`<ds-pagination total-items="240" page-size="20" page="2" show-range></ds-pagination>`);
    await nextFrame();
    const range = el.querySelector('.ds-pagination__range');
    expect(range.textContent.replace(/\s+/g, ' ').trim()).to.equal('21–40 of 240');
  });
});
