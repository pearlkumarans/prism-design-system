/* ds-rich-text-editor — a labelled contenteditable surface with a formatting
   toolbar. Covers structure, the value get/set contract, toolbar variants
   (fixed / hidden), disabled + readonly (no toolbar, non-editable), the helper
   row + counter, the change event, label escaping, a11y, and teardown (the
   document-level selectionchange listener must not leak). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { trackListeners } from './helpers/listeners.js';
import '../src/components/rich-text-editor/rich-text-editor.js';

const rte = (el) => el.querySelector('.ds-rte');
const body = (el) => el.querySelector('.ds-rte__body');
const toolbar = (el) => el.querySelector('.ds-rte__toolbar');

describe('ds-rich-text-editor — structure & defaults', () => {
  it('renders a label, a fixed toolbar, and an editable textbox body', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="Description"></ds-rich-text-editor>`);
    expect(rte(el)).to.exist;
    expect(el.querySelector('.ds-rte__label').textContent).to.equal('Description');
    expect(toolbar(el)).to.exist;
    expect(toolbar(el).getAttribute('role')).to.equal('toolbar');
    const b = body(el);
    expect(b.getAttribute('role')).to.equal('textbox');
    expect(b.getAttribute('aria-multiline')).to.equal('true');
    expect(b.getAttribute('contenteditable')).to.equal('true');
  });

  it('renders the toolbar formatting controls (block-style select + B/I/U)', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D"></ds-rich-text-editor>`);
    expect(el.querySelector('.ds-rte__select[data-cmd="formatBlock"]')).to.exist;
    ['bold', 'italic', 'underline'].forEach((cmd) => {
      expect(el.querySelector(`.ds-rte__btn[data-cmd="${cmd}"]`), cmd).to.exist;
    });
  });

  it('carries the placeholder on the body as a data attribute', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" placeholder="Start typing..."></ds-rich-text-editor>`);
    expect(body(el).getAttribute('data-placeholder')).to.equal('Start typing...');
  });

  it('show-label="false" omits the visible label', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" show-label="false"></ds-rich-text-editor>`);
    expect(el.querySelector('.ds-rte__label')).to.not.exist;
  });
});

describe('ds-rich-text-editor — value get/set', () => {
  it('adopts initial slotted HTML as the value', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D"><p>Hello</p></ds-rich-text-editor>`);
    await nextFrame();
    expect(el.value).to.contain('Hello');
    expect(body(el).textContent).to.contain('Hello');
  });

  it('the value setter writes into the body', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D"></ds-rich-text-editor>`);
    el.value = '<p>Set content</p>';
    expect(body(el).innerHTML).to.contain('Set content');
    expect(el.value).to.contain('Set content');
  });

  it('preserves the current value across an attribute-driven re-render', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D"></ds-rich-text-editor>`);
    el.value = '<p>Persist me</p>';
    el.setAttribute('helper', 'A hint');
    await nextFrame();
    expect(el.value).to.contain('Persist me');
  });
});

describe('ds-rich-text-editor — toolbar variants', () => {
  it('toolbar="hidden" renders no toolbar but keeps the body editable', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" toolbar="hidden"></ds-rich-text-editor>`);
    expect(toolbar(el)).to.not.exist;
    expect(el.querySelector('.ds-rte__floating')).to.not.exist;
    expect(body(el).getAttribute('contenteditable')).to.equal('true');
  });

  it('toolbar="floating" renders the floating bubble instead of the fixed bar', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" toolbar="floating"></ds-rich-text-editor>`);
    expect(toolbar(el)).to.not.exist;
    expect(el.querySelector('.ds-rte__floating')).to.exist;
  });
});

describe('ds-rich-text-editor — disabled & readonly', () => {
  it('disabled: no toolbar, non-editable body, aria-disabled', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" state="disabled"></ds-rich-text-editor>`);
    expect(toolbar(el)).to.not.exist;
    const b = body(el);
    expect(b.getAttribute('contenteditable')).to.equal('false');
    expect(b.getAttribute('aria-disabled')).to.equal('true');
    expect(rte(el).classList.contains('ds-rte--disabled')).to.be.true;
  });

  it('readonly: no toolbar, non-editable body, aria-readonly', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" state="readonly"></ds-rich-text-editor>`);
    expect(toolbar(el)).to.not.exist;
    const b = body(el);
    expect(b.getAttribute('contenteditable')).to.equal('false');
    expect(b.getAttribute('aria-readonly')).to.equal('true');
  });

  it('error: sets aria-invalid on the body and flags the host', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" state="error"></ds-rich-text-editor>`);
    expect(body(el).getAttribute('aria-invalid')).to.equal('true');
    expect(rte(el).classList.contains('ds-rte--error')).to.be.true;
  });

  it('toggling state disabled → default restores an editable body + toolbar', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" state="disabled"></ds-rich-text-editor>`);
    el.setAttribute('state', 'default');
    await nextFrame();
    expect(toolbar(el)).to.exist;
    expect(body(el).getAttribute('contenteditable')).to.equal('true');
  });
});

describe('ds-rich-text-editor — helper row & counter', () => {
  it('renders a helper row with the helper text', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" helper="Type $ to add variables"></ds-rich-text-editor>`);
    const helper = el.querySelector('.ds-rte__helper-row');
    expect(helper).to.exist;
    expect(helper.getAttribute('text')).to.equal('Type $ to add variables');
    expect(body(el).getAttribute('aria-describedby')).to.equal(helper.id);
  });

  it('reflects the text length into the counter when maxlength is set', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D" maxlength="100"></ds-rich-text-editor>`);
    const helper = el.querySelector('.ds-rte__helper-row');
    expect(helper.getAttribute('counter')).to.equal('0/100');
    el.value = '<p>abcde</p>';
    expect(helper.getAttribute('counter')).to.equal('5/100');
  });
});

describe('ds-rich-text-editor — events', () => {
  it('emits ds-rte-change on body input', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D"></ds-rich-text-editor>`);
    let detail = null;
    el.addEventListener('ds-rte-change', (e) => { detail = e.detail; });
    body(el).innerHTML = '<p>typed</p>';
    body(el).dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();
    expect(detail).to.exist;
    expect(detail.value).to.contain('typed');
  });
});

describe('ds-rich-text-editor — escaping', () => {
  it('renders a hostile label as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-rich-text-editor label='<img src=x onerror=alert(1)>'></ds-rich-text-editor>`);
    await nextFrame();
    const lbl = el.querySelector('.ds-rte__label');
    expect(lbl.querySelector('img')).to.not.exist;
    expect(lbl.textContent).to.contain('<img');
  });
});

describe('ds-rich-text-editor — a11y', () => {
  it('is accessible with a label, toolbar, and helper', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="Description"
      helper="Type $ to add variables"></ds-rich-text-editor>`);
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-rich-text-editor — teardown', () => {
  it('removes the document selectionchange listener on disconnect (no leak)', async () => {
    const t = trackListeners();
    const el = await fixture(html`<ds-rich-text-editor label="D" toolbar="floating"></ds-rich-text-editor>`);
    el.remove();
    t.restore();
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
  });

  it('survives disconnect → reconnect without duplicating the body', async () => {
    const el = await fixture(html`<ds-rich-text-editor label="D"></ds-rich-text-editor>`);
    el.value = '<p>Keep</p>';
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-rte__body').length).to.equal(1);
  });
});
