/* ds-script-editor — dedicated suite.

   The component renders into the LIGHT DOM (a single <div> root appended to the
   host), so every query goes through `el.querySelector`. The editable code
   surface is a contenteditable `.ds-script-editor__code`; its text is the source
   of truth for `value` and is NOT reflected to the `value` attribute, so a
   rebuild from an unrelated attribute change must not revert edits.

   Chrome shown per `type`:
     basic             → status bar only
     with-toolbar      → toolbar (+ lang badge)
     with-line-numbers → gutter
     with-tabs         → tabs
     full-ide          → tabs + toolbar + gutter + terminal

   Complements review-regressions.test.js (value-loss + tab-name escape) — this
   suite covers value round-trips, the other injection sinks (toolbar/status
   language, error-text), type-variant chrome, events, a11y and enumAttr. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/script-editor/script-editor.js';

const XSS = '"><img src=x onerror=alert(1)>';
const noImg = (el, ctx) => expect(el.querySelector('img[onerror]'), `${ctx}: injected an <img>`).to.not.exist;
const code = (el) => el.querySelector('.ds-script-editor__code');
const status = (el) => el.querySelector('.ds-script-editor__status');

describe('ds-script-editor — value', () => {
  it('populates the code surface from slotted text content', async () => {
    const el = await fixture(html`<ds-script-editor>const x = 1;</ds-script-editor>`);
    await nextFrame();
    expect(code(el).textContent).to.equal('const x = 1;');
    expect(el.value).to.equal('const x = 1;');
  });

  it('populates the code surface from a value attribute', async () => {
    const el = await fixture(html`<ds-script-editor value="let y = 2;"></ds-script-editor>`);
    await nextFrame();
    expect(code(el).textContent).to.equal('let y = 2;');
    expect(el.value).to.equal('let y = 2;');
  });

  it('el.value reflects the current code, and setting el.value updates the surface', async () => {
    const el = await fixture(html`<ds-script-editor>a</ds-script-editor>`);
    await nextFrame();
    el.value = 'b = 3;';
    expect(el.value).to.equal('b = 3;');
    expect(code(el).textContent).to.equal('b = 3;');
  });

  it('a value-attribute change updates the surface (no-rebuild path)', async () => {
    const el = await fixture(html`<ds-script-editor value="one"></ds-script-editor>`);
    await nextFrame();
    el.setAttribute('value', 'two');
    await nextFrame();
    expect(code(el).textContent).to.equal('two');
    expect(el.value).to.equal('two');
  });
});

describe('ds-script-editor — value preservation across attribute-driven rebuilds', () => {
  it('keeps edited code when an unrelated attribute (state) changes', async () => {
    const el = await fixture(html`<ds-script-editor type="basic">const x = 1;</ds-script-editor>`);
    await nextFrame();
    code(el).textContent = 'const edited = 99;';
    code(el).dispatchEvent(new Event('input', { bubbles: true }));
    el.setAttribute('state', 'error');
    await nextFrame();
    expect(el.value, 'edited code reverted to stale initial').to.equal('const edited = 99;');
    expect(code(el).textContent).to.equal('const edited = 99;');
  });
});

describe('ds-script-editor — escaping / injection', () => {
  it('renders a hostile tab name as literal text (no injected img)', async () => {
    const el = await fixture(html`<ds-script-editor type="with-tabs" tabs="index.ts,${XSS}"></ds-script-editor>`);
    await nextFrame();
    noImg(el, 'tab name');
    expect(el.querySelector('.ds-script-editor__tabs').textContent).to.contain('<img');
  });

  it('escapes a hostile language in the toolbar lang badge', async () => {
    const el = await fixture(html`<ds-script-editor type="with-toolbar" language="${XSS}"></ds-script-editor>`);
    await nextFrame();
    noImg(el, 'toolbar lang badge');
    expect(el.querySelector('.ds-script-editor__lang-badge').textContent).to.contain('<img');
  });

  it('escapes a hostile language in the status bar (the sink the review found unescaped)', async () => {
    const el = await fixture(html`<ds-script-editor language="${XSS}"></ds-script-editor>`);
    await nextFrame();
    noImg(el, 'status bar language');
    expect(status(el).textContent).to.contain('<img');
  });

  it('escapes a hostile error-text in the status bar', async () => {
    const el = await fixture(html`<ds-script-editor state="error" error-text="${XSS}"></ds-script-editor>`);
    await nextFrame();
    noImg(el, 'status bar error-text');
    expect(status(el).textContent).to.contain('<img');
  });

  it('round-trips code with < > & without injecting a node', async () => {
    const el = await fixture(html`<ds-script-editor value="if (a < b && c > d) {}"></ds-script-editor>`);
    await nextFrame();
    expect(el.value).to.equal('if (a < b && c > d) {}');
    expect(code(el).querySelector('*'), 'code must not inject a node').to.not.exist;
  });
});

describe('ds-script-editor — type variants render their chrome', () => {
  it('basic: status bar only, no tabs / toolbar / gutter / terminal', async () => {
    const el = await fixture(html`<ds-script-editor type="basic">x</ds-script-editor>`);
    await nextFrame();
    expect(el.querySelector('.ds-script-editor__code'), 'code surface').to.exist;
    expect(status(el), 'status bar').to.exist;
    expect(el.querySelector('.ds-script-editor__tabs')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__toolbar')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__gutter')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__terminal')).to.not.exist;
  });

  it('with-toolbar: toolbar present, no tabs / gutter / terminal', async () => {
    const el = await fixture(html`<ds-script-editor type="with-toolbar">x</ds-script-editor>`);
    await nextFrame();
    expect(el.querySelector('.ds-script-editor__toolbar')).to.exist;
    expect(el.querySelector('.ds-script-editor__tabs')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__gutter')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__terminal')).to.not.exist;
  });

  it('with-line-numbers: gutter present, no tabs / toolbar / terminal', async () => {
    const el = await fixture(html`<ds-script-editor type="with-line-numbers">a\nb\nc</ds-script-editor>`);
    await nextFrame();
    expect(el.querySelector('.ds-script-editor__gutter')).to.exist;
    expect(el.querySelector('.ds-script-editor__tabs')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__toolbar')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__terminal')).to.not.exist;
  });

  it('with-tabs: tabs present, no toolbar / gutter / terminal', async () => {
    const el = await fixture(html`<ds-script-editor type="with-tabs">x</ds-script-editor>`);
    await nextFrame();
    expect(el.querySelector('.ds-script-editor__tabs')).to.exist;
    expect(el.querySelector('.ds-script-editor__toolbar')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__gutter')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__terminal')).to.not.exist;
  });

  it('full-ide: tabs, toolbar, gutter and terminal all present', async () => {
    const el = await fixture(html`<ds-script-editor type="full-ide">x</ds-script-editor>`);
    await nextFrame();
    expect(el.querySelector('.ds-script-editor__tabs'), 'tabs').to.exist;
    expect(el.querySelector('.ds-script-editor__toolbar'), 'toolbar').to.exist;
    expect(el.querySelector('.ds-script-editor__gutter'), 'gutter').to.exist;
    expect(el.querySelector('.ds-script-editor__terminal'), 'terminal').to.exist;
  });
});

describe('ds-script-editor — tabs', () => {
  it('renders one button per name from the tabs attribute, first active', async () => {
    const el = await fixture(html`<ds-script-editor type="with-tabs" tabs="a.ts,b.ts"></ds-script-editor>`);
    await nextFrame();
    const tabs = el.querySelectorAll('.ds-script-editor__tab');
    expect(tabs.length).to.equal(2);
    expect(tabs[0].classList.contains('ds-script-editor__tab--active'), 'first tab active').to.be.true;
    expect(tabs[1].classList.contains('ds-script-editor__tab--active'), 'second tab inactive').to.be.false;
    expect([...tabs].map((t) => t.textContent.trim())).to.have.members(['a.ts', 'b.ts']);
  });
});

describe('ds-script-editor — events', () => {
  it('editing the code surface fires ds-script-change with the new value', async () => {
    const el = await fixture(html`<ds-script-editor>x</ds-script-editor>`);
    await nextFrame();
    code(el).textContent = 'const changed = 1;';
    setTimeout(() => code(el).dispatchEvent(new Event('input', { bubbles: true })));
    const ev = await oneEvent(el, 'ds-script-change');
    expect(ev.detail.value).to.equal('const changed = 1;');
  });
});

describe('ds-script-editor — a11y', () => {
  it('exposes the code surface as role=textbox with aria-multiline=true', async () => {
    const el = await fixture(html`<ds-script-editor>x</ds-script-editor>`);
    await nextFrame();
    expect(code(el).getAttribute('role')).to.equal('textbox');
    expect(code(el).getAttribute('aria-multiline')).to.equal('true');
  });

  it('disables editing (contenteditable=false) for disabled and readonly states', async () => {
    const dis = await fixture(html`<ds-script-editor state="disabled">x</ds-script-editor>`);
    await nextFrame();
    expect(code(dis).getAttribute('contenteditable')).to.equal('false');
    expect(code(dis).getAttribute('aria-disabled')).to.equal('true');

    const ro = await fixture(html`<ds-script-editor state="readonly">x</ds-script-editor>`);
    await nextFrame();
    expect(code(ro).getAttribute('contenteditable')).to.equal('false');
    expect(code(ro).getAttribute('aria-readonly')).to.equal('true');
  });
});

describe('ds-script-editor — enumAttr defaults', () => {
  it('falls back to basic chrome for an invalid type', async () => {
    const el = await fixture(html`<ds-script-editor type="nope">x</ds-script-editor>`);
    await nextFrame();
    expect(el.querySelector('.ds-script-editor__tabs')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__toolbar')).to.not.exist;
    expect(el.querySelector('.ds-script-editor__gutter')).to.not.exist;
  });

  it('falls back to the default state and medium size classes for invalid values', async () => {
    const el = await fixture(html`<ds-script-editor state="bogus" size="huge">x</ds-script-editor>`);
    await nextFrame();
    const root = el.querySelector('.ds-script-editor');
    expect(root.classList.contains('ds-script-editor--default'), 'state → default').to.be.true;
    expect(root.classList.contains('ds-script-editor--medium'), 'size → medium').to.be.true;
    // the editor stays editable in the fallback (default) state
    expect(code(el).getAttribute('contenteditable')).to.equal('true');
  });
});

describe('ds-script-editor — teardown', () => {
  it('survives disconnect → reconnect without throwing or duplicating its root', async () => {
    const el = await fixture(html`<ds-script-editor>const x = 1;</ds-script-editor>`);
    await nextFrame();
    const parent = el.parentNode;
    el.remove();
    expect(() => parent.appendChild(el)).to.not.throw();
    await nextFrame();
    expect(el.querySelectorAll('.ds-script-editor').length, 'duplicated root').to.equal(1);
    expect(el.querySelectorAll('.ds-script-editor__code').length, 'duplicated code surface').to.equal(1);
    expect(el.value, 'value lost across reconnect').to.equal('const x = 1;');
  });
});
