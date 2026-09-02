/* ds-file-upload — the consumer drives the lifecycle via `files` / updateFile /
   removeFile; the component renders selection + progress UI. The headline here is
   the perf contract: a progress tick updates the affected bar IN PLACE (no full
   innerHTML rebuild), while a status change still rebuilds the row. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/file-upload/file-upload.js';

const rowFor = (el, id) =>
  [...el.querySelectorAll('.ds-file-upload__item')].find((r) => r.getAttribute('data-id') === id);

describe('ds-file-upload — structure & variants', () => {
  it('form variant renders the placeholder + a Browse button', async () => {
    const el = await fixture(html`<ds-file-upload variant="form" placeholder="Choose file"></ds-file-upload>`);
    await nextFrame();
    expect(el.querySelector('.ds-file-upload__placeholder')?.textContent).to.equal('Choose file');
    expect(el.querySelector('.ds-file-upload__browse')).to.exist;
  });

  it('multiple uploading files render one row each with a progress bar', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [
      { id: 'a', name: 'one.csv', status: 'uploading', progress: 10 },
      { id: 'b', name: 'two.csv', status: 'uploading', progress: 20 },
    ];
    await nextFrame();
    expect(el.querySelectorAll('.ds-file-upload__item').length).to.equal(2);
    expect(rowFor(el, 'a').querySelector('.ds-file-upload__progress').getAttribute('value')).to.equal('10');
    expect(rowFor(el, 'a').querySelector('.ds-file-upload__pct').textContent).to.equal('10%');
  });
});

describe('ds-file-upload — progress ticks update in place (perf contract)', () => {
  it('a progress-only updateFile keeps the same row/bar nodes (no rebuild) and syncs value + pct', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [
      { id: 'a', name: 'one.csv', status: 'uploading', progress: 10 },
      { id: 'b', name: 'two.csv', status: 'uploading', progress: 20 },
    ];
    await nextFrame();
    const rowA = rowFor(el, 'a');
    const barA = rowA.querySelector('.ds-file-upload__progress');
    const rowB = rowFor(el, 'b');
    rowA._probe = 'kept'; rowB._probe = 'kept';   // survives only if not rebuilt

    el.updateFile('a', { progress: 80 });
    await nextFrame();

    // same nodes — the tick did NOT rebuild innerHTML
    expect(rowFor(el, 'a'), 'row A node identity').to.equal(rowA);
    expect(rowFor(el, 'a')._probe, 'row A not rebuilt').to.equal('kept');
    expect(rowFor(el, 'b')._probe, 'row B not rebuilt').to.equal('kept');
    expect(rowA.querySelector('.ds-file-upload__progress'), 'bar node identity').to.equal(barA);
    // value + pct synced in place
    expect(barA.getAttribute('value')).to.equal('80');
    expect(rowA.querySelector('.ds-file-upload__pct').textContent).to.equal('80%');
  });

  it('a status change rebuilds the row (uploading -> success shows the remove action)', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [
      { id: 'a', name: 'one.csv', status: 'uploading', progress: 90 },
      { id: 'b', name: 'two.csv', status: 'uploading', progress: 20 },
    ];
    await nextFrame();
    const rowA = rowFor(el, 'a');
    rowA._probe = 'kept';

    el.updateFile('a', { status: 'success', progress: 100 });
    await nextFrame();

    const rowA2 = rowFor(el, 'a');
    expect(rowA2._probe, 'status change must rebuild the row').to.not.equal('kept');
    expect(rowA2.classList.contains('ds-file-upload__item--success')).to.be.true;
    expect(rowA2.querySelector('[data-action="remove"]')).to.exist;
    expect(rowA2.querySelector('.ds-file-upload__progress'), 'success row has no progress bar').to.not.exist;
  });
});

describe('ds-file-upload — actions, escaping, a11y', () => {
  it('the cancel action on an uploading row fires ds-file-upload-cancel with the file', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: 'a', name: 'one.csv', status: 'uploading', progress: 10 }];
    await nextFrame();
    setTimeout(() => rowFor(el, 'a').querySelector('[data-action="cancel"]').click());
    const ev = await oneEvent(el, 'ds-file-upload-cancel');
    expect(ev.detail.file.id).to.equal('a');
  });

  it('escapes a hostile file name — no injected node', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: 'x', name: '<img src=x onerror=alert(1)>', status: 'uploading', progress: 5 }];
    await nextFrame();
    expect(el.querySelector('img[onerror]'), 'file name injected an <img>').to.not.exist;
    expect(rowFor(el, 'x').querySelector('.ds-file-upload__name').textContent).to.contain('<img');
  });

  it('the prominent drop zone is a keyboard-operable button', async () => {
    const el = await fixture(html`<ds-file-upload variant="prominent" zone-hint="Drop here"></ds-file-upload>`);
    await nextFrame();
    const box = el.querySelector('[role="button"]');
    expect(box, 'a role=button drop target').to.exist;
    expect(box.getAttribute('tabindex')).to.equal('0');
  });

  it('teardown: disconnect -> reconnect keeps a single root and preserves files', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: 'a', name: 'one.csv', status: 'uploading', progress: 10 }];
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-file-upload__item').length).to.equal(1);
  });
});
