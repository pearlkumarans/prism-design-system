/* ds-file-upload — selection/progress UI driven by `el.files`. Covers variant +
   state derivation, the per-file rows a `multiple` upload renders (with the
   right per-status actions: uploading→cancel, error→retry+remove, success→
   remove), escaping of file names + action aria-labels, the select/cancel/remove
   events, keyboard a11y on the drop box, and teardown. The consumer owns the
   actual upload; the component only reflects the `files` model. */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/file-upload/file-upload.js';

const XSS = '"><img src=x onerror=alert(1)>';
const root = (el) => el.querySelector('.ds-file-upload');
const box = (el) => el.querySelector('.ds-file-upload__box');
const items = (el) => [...el.querySelectorAll('.ds-file-upload__item')];

describe('ds-file-upload — structure & state', () => {
  it('renders the form variant box as an accessible button by default', async () => {
    const el = await fixture(html`<ds-file-upload></ds-file-upload>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-file-upload--form'), 'form is the default variant').to.be.true;
    const b = box(el);
    expect(b, 'drop box missing').to.exist;
    expect(b.getAttribute('role')).to.equal('button');
    expect(b.getAttribute('tabindex')).to.equal('0');
  });

  it('honours the prominent variant', async () => {
    const el = await fixture(html`<ds-file-upload variant="prominent"></ds-file-upload>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-file-upload--prominent')).to.be.true;
  });

  it('derives the visual state from the files model', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    await nextFrame();
    expect(root(el).classList.contains('ds-file-upload--state-default'), 'empty → default').to.be.true;

    el.files = [{ id: '1', name: 'a', status: 'uploading', progress: 10 }];
    await nextFrame();
    expect(root(el).classList.contains('ds-file-upload--state-uploading'), 'busy → uploading').to.be.true;

    el.files = [{ id: '1', name: 'a', status: 'success' }, { id: '2', name: 'b', status: 'error' }];
    await nextFrame();
    expect(root(el).classList.contains('ds-file-upload--state-error'), 'any error → error').to.be.true;

    el.files = [{ id: '1', name: 'a', status: 'success' }, { id: '2', name: 'b', status: 'success' }];
    await nextFrame();
    expect(root(el).classList.contains('ds-file-upload--state-success'), 'all success → success').to.be.true;
  });
});

describe('ds-file-upload — file rows & per-status actions', () => {
  async function withFiles() {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [
      { id: 'u', name: 'up.csv', status: 'uploading', progress: 40 },
      { id: 's', name: 'ok.csv', status: 'success' },
      { id: 'e', name: 'bad.csv', status: 'error', statusText: 'Virus found' },
      { id: 'c', name: 'scan.csv', status: 'scanning' },
    ];
    await nextFrame();
    return el;
  }

  it('renders one row per file', async () => {
    const el = await withFiles();
    expect(items(el).length).to.equal(4);
  });

  it('uploading row exposes only a cancel action', async () => {
    const el = await withFiles();
    const row = el.querySelector('.ds-file-upload__item--uploading');
    const actions = [...row.querySelectorAll('.ds-file-upload__action')];
    expect(actions.map((a) => a.dataset.action)).to.deep.equal(['cancel']);
  });

  it('error row exposes retry + remove; success row exposes remove; scanning row none', async () => {
    const el = await withFiles();
    const err = [...el.querySelector('.ds-file-upload__item--error').querySelectorAll('.ds-file-upload__action')];
    expect(err.map((a) => a.dataset.action)).to.deep.equal(['retry', 'remove']);
    const suc = [...el.querySelector('.ds-file-upload__item--success').querySelectorAll('.ds-file-upload__action')];
    expect(suc.map((a) => a.dataset.action)).to.deep.equal(['remove']);
    const scan = el.querySelector('.ds-file-upload__item--scanning').querySelectorAll('.ds-file-upload__action');
    expect(scan.length).to.equal(0);
  });

  it('removeFile / clear prune the rows', async () => {
    const el = await withFiles();
    el.removeFile('u');
    await nextFrame();
    expect(items(el).length).to.equal(3);
    el.clear();
    await nextFrame();
    expect(items(el).length).to.equal(0);
  });
});

describe('ds-file-upload — escaping', () => {
  it('escapes a hostile file name (renders as text, no injected node)', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: '1', name: XSS, status: 'success' }];
    await nextFrame();
    const name = el.querySelector('.ds-file-upload__item .ds-file-upload__name');
    expect(name.querySelector('img'), 'name injected an <img>').to.not.exist;
    expect(name.textContent).to.contain('<img');
  });

  it('escapes the file name inside every action aria-label', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: '1', name: XSS, status: 'error' }];
    await nextFrame();
    const actions = [...el.querySelectorAll('.ds-file-upload__action')];
    expect(actions.length).to.be.greaterThan(0);
    actions.forEach((a) => {
      expect(a.querySelector('img'), 'action label injected an <img>').to.not.exist;
      expect(a.getAttribute('aria-label')).to.contain('<img');
    });
  });
});

describe('ds-file-upload — events & a11y', () => {
  it('a row action emits its lifecycle event with the file (cancel)', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: 'u', name: 'up.csv', status: 'uploading', progress: 5 }];
    await nextFrame();
    const btn = el.querySelector('.ds-file-upload__action[data-action="cancel"]');
    setTimeout(() => btn.click());
    const ev = await oneEvent(el, 'ds-file-upload-cancel');
    expect(ev.detail.file.id).to.equal('u');
  });

  it('the remove action emits ds-file-upload-remove', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: 's', name: 'ok.csv', status: 'success' }];
    await nextFrame();
    const btn = el.querySelector('.ds-file-upload__action[data-action="remove"]');
    setTimeout(() => btn.click());
    const ev = await oneEvent(el, 'ds-file-upload-remove');
    expect(ev.detail.file.id).to.equal('s');
  });

  it('a drop on the box emits ds-file-upload-select with the dropped files', async () => {
    const el = await fixture(html`<ds-file-upload></ds-file-upload>`);
    await nextFrame();
    const file = new File(['x'], 'drop.txt');
    const ev = new Event('drop', { bubbles: true });
    Object.defineProperty(ev, 'dataTransfer', { value: { files: [file] } });
    setTimeout(() => box(el).dispatchEvent(ev));
    const got = await oneEvent(el, 'ds-file-upload-select');
    expect(got.detail.files.length).to.equal(1);
    expect(got.detail.files[0].name).to.equal('drop.txt');
  });

  it('Enter / Space on the box opens the picker (keyboard a11y)', async () => {
    const el = await fixture(html`<ds-file-upload></ds-file-upload>`);
    await nextFrame();
    let opened = 0;
    el.openPicker = () => { opened += 1; };
    box(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    box(el).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(opened).to.equal(2);
  });
});

describe('ds-file-upload — teardown', () => {
  it('survives disconnect → reconnect without throwing or duplicating', async () => {
    const el = await fixture(html`<ds-file-upload multiple></ds-file-upload>`);
    el.files = [{ id: '1', name: 'a', status: 'success' }];
    await nextFrame();
    const parent = el.parentNode;
    expect(() => el.remove()).to.not.throw();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-file-upload').length, 'one root after reconnect').to.equal(1);
    expect(items(el).length).to.equal(1);
  });
});
