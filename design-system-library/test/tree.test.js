/* ds-tree — hierarchy rows implementing the WAI-ARIA Tree View pattern. Covers
   the ARIA contract (roles, level/setsize/posinset, aria-expanded on parents
   ONLY, multiselectable), the single tab stop, the full keyboard model including
   RTL mirroring and type-ahead, expand/collapse by twisty, lazy branches,
   selection (none/single/multi + cascade + tri-state + disabled), events, <mark>
   highlighting, the slotted-markup path, and the dir/rtl re-entry guard. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/tree/tree.js';

const OU = () => ([
  { id: 'corp', text: 'corp.acme.com', expanded: true, children: [
    { id: 'fin', text: 'Finance', children: [
      { id: 'fin-ap', text: 'AP' },
      { id: 'fin-ar', text: 'AR' },
    ] },
    { id: 'eng', text: 'Engineering', children: [{ id: 'eng-qa', text: 'QA' }, { id: 'eng-dev', text: 'Dev' }] },
    { id: 'kiosk', text: 'Kiosks', disabled: true },
  ] },
]);

const rows = (el) => [...el.querySelectorAll('.ds-tree__item')];
const row = (el, id) => el.querySelector(`.ds-tree__item[data-id="${id}"]`);
const labelOf = (r) => r.querySelector('[data-label]').textContent;
const press = (el, key) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

/* Attributes are applied after the fixture rather than interpolated into the
   template: lit's html tag takes a real template-strings array, so a built-up
   string cannot be passed through it. None of the values below contain spaces. */
async function mk(items, attrs = '') {
  const el = await fixture(html`<ds-tree></ds-tree>`);
  attrs.split(/\s+/).filter(Boolean).forEach((pair) => {
    const eq = pair.indexOf('=');
    if (eq < 0) el.setAttribute(pair, '');
    else el.setAttribute(pair.slice(0, eq), pair.slice(eq + 1).replace(/^"|"$/g, ''));
  });
  el.items = items;
  await nextFrame();
  return el;
}

describe('ds-tree — ARIA contract', () => {
  it('uses role=tree / treeitem, and group only below the root', async () => {
    const el = await mk(OU());
    expect(el.querySelector('.ds-tree').getAttribute('role')).to.equal('tree');
    expect(rows(el).length, 'root + 3 children visible').to.equal(4);
    rows(el).forEach((r) => expect(r.getAttribute('role')).to.equal('treeitem'));
    const groups = [...el.querySelectorAll('[role="group"]')];
    expect(groups.length, 'one group for the expanded root').to.equal(1);
  });

  it('sets aria-level, setsize and posinset per node', async () => {
    const el = await mk(OU());
    const corp = row(el, 'corp');
    expect(corp.getAttribute('aria-level')).to.equal('1');
    expect(corp.getAttribute('aria-setsize')).to.equal('1');
    expect(corp.getAttribute('aria-posinset')).to.equal('1');
    const eng = row(el, 'eng');
    expect(eng.getAttribute('aria-level')).to.equal('2');
    expect(eng.getAttribute('aria-setsize'), '3 siblings').to.equal('3');
    expect(eng.getAttribute('aria-posinset'), 'second of them').to.equal('2');
  });

  it('puts aria-expanded on parents ONLY — never on a leaf', async () => {
    /* On a leaf it announces "collapsed" for something that can never open. */
    const el = await mk(OU());
    expect(row(el, 'fin').getAttribute('aria-expanded'), 'parent').to.equal('false');
    expect(row(el, 'kiosk').hasAttribute('aria-expanded'), 'leaf').to.be.false;
  });

  it('treats hasChildren as a parent even with no children loaded', async () => {
    const el = await mk([{ id: 'lazy', text: 'Users', hasChildren: true }]);
    expect(row(el, 'lazy').getAttribute('aria-expanded')).to.equal('false');
  });

  it('declares aria-multiselectable only for selection="multi"', async () => {
    const multi = await mk(OU(), 'selection="multi"');
    expect(multi.querySelector('.ds-tree').getAttribute('aria-multiselectable')).to.equal('true');
    const single = await mk(OU(), 'selection="single"');
    expect(single.querySelector('.ds-tree').hasAttribute('aria-multiselectable')).to.be.false;
  });

  it('marks a disabled node aria-disabled', async () => {
    const el = await mk(OU());
    expect(row(el, 'kiosk').getAttribute('aria-disabled')).to.equal('true');
  });
});

describe('ds-tree — one tab stop', () => {
  it('makes exactly one node tabbable', async () => {
    const el = await mk(OU());
    const tabbable = rows(el).filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable.length, 'a tree is ONE tab stop, arrows move within it').to.equal(1);
    expect(tabbable[0].dataset.id).to.equal('corp');
  });

  it('moves the tab stop with the focused node', async () => {
    const el = await mk(OU());
    rows(el)[0].focus();
    press(document.activeElement, 'ArrowDown');
    await nextFrame();
    expect(row(el, 'fin').getAttribute('tabindex')).to.equal('0');
    expect(row(el, 'corp').getAttribute('tabindex')).to.equal('-1');
  });
});

describe('ds-tree — keyboard', () => {
  const focusFirst = (el) => { rows(el)[0].focus(); };

  it('ArrowDown/Up walk visible nodes and stop at the ends', async () => {
    const el = await mk(OU());
    focusFirst(el);
    press(document.activeElement, 'ArrowDown');
    expect(document.activeElement.dataset.id).to.equal('fin');
    press(document.activeElement, 'ArrowUp');
    expect(document.activeElement.dataset.id).to.equal('corp');
    press(document.activeElement, 'ArrowUp');
    expect(document.activeElement.dataset.id, 'clamps at the top').to.equal('corp');
  });

  it('ArrowRight expands, then steps into the first child', async () => {
    const el = await mk(OU());
    row(el, 'fin').focus();
    press(document.activeElement, 'ArrowRight');
    await nextFrame();
    expect(row(el, 'fin').getAttribute('aria-expanded'), 'first press opens').to.equal('true');
    press(document.activeElement, 'ArrowRight');
    await nextFrame();
    expect(document.activeElement.dataset.id, 'second press steps in').to.equal('fin-ap');
  });

  it('ArrowLeft collapses, then steps out to the parent', async () => {
    const el = await mk(OU());
    row(el, 'corp').focus();
    press(document.activeElement, 'ArrowLeft');
    await nextFrame();
    expect(row(el, 'corp').getAttribute('aria-expanded'), 'first press closes').to.equal('false');
    row(el, 'corp').focus();
    press(document.activeElement, 'ArrowRight');   // reopen
    await nextFrame();
    row(el, 'fin').focus();
    press(document.activeElement, 'ArrowLeft');    // fin is collapsed → step out
    await nextFrame();
    expect(document.activeElement.dataset.id).to.equal('corp');
  });

  it('mirrors the arrows under rtl', async () => {
    /* The keys swap roles, matching ds-dropdown-menu. Without this an RTL user
       collapses with the key that should expand. */
    const el = await mk(OU(), 'rtl');
    row(el, 'fin').focus();
    press(document.activeElement, 'ArrowLeft');
    await nextFrame();
    expect(row(el, 'fin').getAttribute('aria-expanded'), 'ArrowLeft opens in RTL').to.equal('true');
    press(document.activeElement, 'ArrowRight');
    await nextFrame();
    expect(row(el, 'fin').getAttribute('aria-expanded'), 'ArrowRight closes in RTL').to.equal('false');
  });

  it('Home and End jump to the first and last visible node', async () => {
    const el = await mk(OU());
    row(el, 'fin').focus();
    press(document.activeElement, 'End');
    expect(document.activeElement.dataset.id).to.equal('kiosk');
    press(document.activeElement, 'Home');
    expect(document.activeElement.dataset.id).to.equal('corp');
  });

  it('* expands every sibling at the focused level', async () => {
    const el = await mk(OU());
    row(el, 'fin').focus();
    press(document.activeElement, '*');
    await nextFrame();
    expect(row(el, 'fin').getAttribute('aria-expanded')).to.equal('true');
    expect(row(el, 'eng').getAttribute('aria-expanded'), 'sibling too').to.equal('true');
    expect(row(el, 'corp').getAttribute('aria-expanded'), 'but not the parent level').to.equal('true');
  });

  it('type-ahead jumps to the next label starting with what was typed', async () => {
    const el = await mk(OU());
    row(el, 'corp').focus();
    press(document.activeElement, 'e');
    expect(document.activeElement.dataset.id).to.equal('eng');
  });

  it('Enter activates without expanding', async () => {
    const el = await mk(OU(), 'selection="single"');
    row(el, 'fin').focus();
    const ev = oneEvent(el, 'ds-tree-activate');
    press(document.activeElement, 'Enter');
    const { detail } = await ev;
    expect(detail.id).to.equal('fin');
    expect(row(el, 'fin').getAttribute('aria-expanded'), 'activate is not expand').to.equal('false');
  });

  it('Space toggles selection', async () => {
    const el = await mk(OU(), 'selection="multi"');
    row(el, 'eng').focus();
    press(document.activeElement, ' ');
    await nextFrame();
    expect(el.selectedIds).to.include('eng');
    row(el, 'eng').focus();
    press(document.activeElement, ' ');
    await nextFrame();
    expect(el.selectedIds).to.not.include('eng');
  });
});

describe('ds-tree — expand / collapse', () => {
  it('renders after a twisty click, not just mutating state', async () => {
    /* Regression: _onClick returned right after _toggle without re-rendering, so
       the expanded set changed and the DOM did not — clicking a chevron visibly
       did nothing. It looked fine only in the lazy case, where the consumer's
       setChildren() happened to re-render afterwards. */
    const el = await mk(OU());
    const before = rows(el).length;
    row(el, 'fin').querySelector('[data-twisty]').click();
    await nextFrame();
    expect(rows(el).length, 'children appear in the DOM').to.be.greaterThan(before);
    expect(row(el, 'fin').getAttribute('aria-expanded')).to.equal('true');
  });

  it('gives a leaf no twisty control, but keeps the box so labels line up', async () => {
    const el = await mk(OU());
    expect(row(el, 'kiosk').querySelector('[data-twisty]'), 'no control').to.not.exist;
    expect(row(el, 'kiosk').querySelector('.ds-tree__twisty'), 'but the box is there').to.exist;
  });

  it('emits ds-tree-expand and ds-tree-collapse', async () => {
    const el = await mk(OU());
    const opened = oneEvent(el, 'ds-tree-expand');
    row(el, 'fin').querySelector('[data-twisty]').click();
    expect((await opened).detail.id).to.equal('fin');
    const closed = oneEvent(el, 'ds-tree-collapse');
    row(el, 'fin').querySelector('[data-twisty]').click();
    expect((await closed).detail.id).to.equal('fin');
  });

  it('expandAll / collapseAll drive every branch', async () => {
    const el = await mk(OU());
    el.expandAll();
    await nextFrame();
    expect(row(el, 'fin').getAttribute('aria-expanded')).to.equal('true');
    expect(row(el, 'fin-ap'), 'grandchild visible').to.exist;
    el.collapseAll();
    await nextFrame();
    expect(rows(el).length, 'only the root remains').to.equal(1);
  });
});

describe('ds-tree — lazy branches', () => {
  it('flags the expand as lazy and shows a loading row', async () => {
    const el = await mk([{ id: 'ou', text: 'Users', hasChildren: true }]);
    const ev = oneEvent(el, 'ds-tree-expand');
    row(el, 'ou').querySelector('[data-twisty]').click();
    const { detail } = await ev;
    expect(detail.lazy, 'consumer is told to go fetch').to.be.true;
    await nextFrame();
    expect(el.querySelector('.ds-tree__loading'), 'a loading row stands in').to.exist;
  });

  it('setChildren resolves the branch and clears the loading row', async () => {
    const el = await mk([{ id: 'ou', text: 'Users', hasChildren: true }]);
    row(el, 'ou').querySelector('[data-twisty]').click();
    await nextFrame();
    el.setChildren('ou', [{ id: 'u1', text: 'DC-01' }, { id: 'u2', text: 'DC-02' }]);
    await nextFrame();
    expect(el.querySelector('.ds-tree__loading')).to.not.exist;
    expect(rows(el).map((r) => labelOf(r))).to.deep.equal(['Users', 'DC-01', 'DC-02']);
  });

  it('says so when a branch resolves to nothing', async () => {
    const el = await mk([{ id: 'ou', text: 'Users', hasChildren: true }]);
    row(el, 'ou').querySelector('[data-twisty]').click();
    await nextFrame();
    el.setChildren('ou', []);
    await nextFrame();
    expect(el.querySelector('.ds-tree__empty'), 'an expanded empty branch is not silent').to.exist;
  });
});

describe('ds-tree — selection', () => {
  it('selection="none" selects nothing and clicking a branch opens it', async () => {
    const el = await mk(OU());
    row(el, 'fin').click();
    await nextFrame();
    expect(el.selectedIds).to.deep.equal([]);
    expect(row(el, 'fin').getAttribute('aria-expanded'), 'read-only tree: click opens').to.equal('true');
    expect(row(el, 'fin').hasAttribute('aria-selected')).to.be.false;
  });

  it('single selection replaces rather than accumulates', async () => {
    const el = await mk(OU(), 'selection="single"');
    row(el, 'fin').click();
    await nextFrame();
    row(el, 'eng').click();
    await nextFrame();
    expect(el.selectedIds).to.deep.equal(['eng']);
  });

  it('multi cascades DOWN to the subtree', async () => {
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    row(el, 'fin').querySelector('.ds-tree__check input').click();
    await nextFrame();
    expect(el.selectedIds.sort()).to.deep.equal(['fin', 'fin-ap', 'fin-ar']);
  });

  it('shows a partially-selected parent as indeterminate, not checked', async () => {
    /* A half-selected parent reporting itself checked would over-report the
       selection to whatever consumes selectedIds. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    row(el, 'fin').querySelector('.ds-tree__check input').click();
    await nextFrame();
    const corpCb = row(el, 'corp').querySelector('.ds-tree__check');
    expect(corpCb.hasAttribute('indeterminate'), 'mixed, not checked').to.be.true;
    expect(el.selectedIds, 'and NOT reported as selected').to.not.include('corp');
  });

  it('shows a parent CHECKED once its whole subtree is selected', async () => {
    /* Reported from the playground: Finance sat empty while both its children
       were checked, because the parent's box was derived from its own membership
       in the selection rather than from its subtree. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    row(el, 'fin-ap').querySelector('.ds-tree__check input').click();
    await nextFrame();
    row(el, 'fin-ar').querySelector('.ds-tree__check input').click();
    await nextFrame();
    const fin = row(el, 'fin').querySelector('.ds-tree__check');
    expect(fin.hasAttribute('checked'), 'all children selected → parent checked').to.be.true;
    expect(fin.hasAttribute('indeterminate'), 'and not mixed').to.be.false;
    expect(el.selectedIds, 'a fully selected parent IS part of the selection').to.include('fin');
  });

  it('drops a parent back to MIXED when a child is unchecked', async () => {
    /* The other half of the same report: Engineering stayed fully checked after
       QA was unchecked underneath it. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    row(el, 'eng').querySelector('.ds-tree__check input').click();   // cascade on
    await nextFrame();
    expect(el.selectedIds, 'cascade reached the children').to.include.members(['eng', 'eng-qa', 'eng-dev']);
    row(el, 'eng-qa').querySelector('.ds-tree__check input').click(); // uncheck one
    await nextFrame();
    const eng = row(el, 'eng').querySelector('.ds-tree__check');
    expect(eng.hasAttribute('indeterminate'), 'parent goes mixed').to.be.true;
    expect(eng.hasAttribute('checked'), 'and is no longer checked').to.be.false;
    expect(el.selectedIds, 'and leaves the selection, so it is not over-reported').to.not.include('eng');
  });

  it('lets a disabled descendant still allow a full parent', async () => {
    /* corp has a permanently unselectable child (Kiosks). If disabled nodes
       counted toward "all", corp could never read as fully selected however much
       the user picked. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    ['fin-ap', 'fin-ar', 'eng-qa', 'eng-dev'].forEach((id) => {
      row(el, id).querySelector('.ds-tree__check input').click();
    });
    await nextFrame();
    const corp = row(el, 'corp').querySelector('.ds-tree__check');
    expect(corp.hasAttribute('checked'), 'every SELECTABLE descendant is picked').to.be.true;
    expect(el.selectedIds, 'the disabled node is still not selected').to.not.include('kiosk');
  });

  it('never cascades onto a disabled node', async () => {
    const el = await mk(OU(), 'selection="multi" checkboxes');
    row(el, 'corp').querySelector('.ds-tree__check input').click();
    await nextFrame();
    expect(el.selectedIds).to.not.include('kiosk');
  });

  it('select-parents="independent" leaves the subtree alone', async () => {
    const el = await mk(OU(), 'selection="multi" checkboxes select-parents="independent"');
    el.expandAll();
    await nextFrame();
    row(el, 'fin').querySelector('.ds-tree__check input').click();
    await nextFrame();
    expect(el.selectedIds).to.deep.equal(['fin']);
  });

  it('patches selection in place instead of rebuilding the tree', async () => {
    /* Reported as a blink on every check. _render() rebuilt every row, which tore
       down and re-upgraded every ds-icon and ds-checkbox in the tree on each
       click — measured: one click replaced all 8 rows and all 11 icons. A
       selection change is visual-only, so the existing nodes must survive. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    const untouched = row(el, 'kiosk');
    const itsIcon = untouched.querySelector('ds-checkbox');
    const marker = row(el, 'fin-ap');
    marker.dataset.probe = 'survives';

    row(el, 'eng-dev').querySelector('.ds-tree__check input').click();
    await nextFrame();

    expect(row(el, 'kiosk'), 'an unrelated row is the SAME element').to.equal(untouched);
    expect(row(el, 'kiosk').querySelector('ds-checkbox'), 'and its checkbox was not re-created').to.equal(itsIcon);
    expect(row(el, 'fin-ap').dataset.probe, 'nothing was rebuilt from data').to.equal('survives');
  });

  it('keeps the focused row focused across a selection change', async () => {
    /* The blink took focus with it: the focused row was destroyed mid-click. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    row(el, 'eng').focus();
    press(document.activeElement, ' ');
    await nextFrame();
    expect(document.activeElement.dataset.id, 'focus stayed on the row').to.equal('eng');
  });

  it('still repaints rows that a cascade changed, not just the clicked one', async () => {
    /* Patching in place must not mean patching only the click target — the
       ancestors and the whole subtree change state too. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    row(el, 'fin').querySelector('.ds-tree__check input').click();
    await nextFrame();
    const box = (id) => {
      const c = row(el, id).querySelector('.ds-tree__check');
      return c.hasAttribute('checked') ? 'checked' : c.hasAttribute('indeterminate') ? 'mixed' : 'empty';
    };
    expect(box('fin'), 'the clicked parent').to.equal('checked');
    expect(box('fin-ap'), 'a cascaded child').to.equal('checked');
    expect(box('corp'), 'the ancestor above it').to.equal('mixed');
  });

  it('independent mode shows a parent from ITSELF, not its subtree', async () => {
    /* Standing alone is the point of that mode; reading the subtree there left a
       parent the user had just checked showing empty. */
    const el = await mk([{ id: 'p', text: 'Finance', expanded: true,
      children: [{ id: 'c1', text: 'AP' }, { id: 'c2', text: 'AR' }] }],
      'selection="multi" checkboxes select-parents="independent"');
    row(el, 'p').querySelector('.ds-tree__check input').click();
    await nextFrame();
    const c = row(el, 'p').querySelector('.ds-tree__check');
    expect(c.hasAttribute('checked'), 'the parent shows its own state').to.be.true;
    expect(el.selectedIds).to.deep.equal(['p']);
    expect(row(el, 'c1').querySelector('.ds-tree__check').hasAttribute('checked'),
      'and the children are untouched').to.be.false;
  });

  it('drops state for nodes a new items assignment removes', async () => {
    /* selectedIds kept reporting ids from the PREVIOUS hierarchy — a selection
       the consumer can neither see nor clear. */
    const el = await mk(OU(), 'selection="multi" checkboxes');
    el.expandAll();
    await nextFrame();
    row(el, 'fin-ap').querySelector('.ds-tree__check input').click();
    await nextFrame();
    expect(el.selectedIds).to.include('fin-ap');
    el.items = [{ id: 'other', text: 'Somewhere else' }];
    await nextFrame();
    expect(el.selectedIds, 'stale ids are gone').to.deep.equal([]);
    expect(el.expandedIds, 'and so is stale expansion').to.deep.equal([]);
  });

  it('emits ds-tree-select with the whole selection', async () => {
    const el = await mk(OU(), 'selection="multi"');
    const ev = oneEvent(el, 'ds-tree-select');
    row(el, 'eng').click();
    const { detail } = await ev;
    expect(detail.id).to.equal('eng');
    expect(detail.selected).to.be.true;
    expect(detail.ids).to.include('eng');
  });

  it('seeds selection and expansion from the data, then keeps its own', async () => {
    const el = await mk([{ id: 'a', text: 'A', expanded: true, selected: true, children: [{ id: 'b', text: 'B' }] }], 'selection="single"');
    expect(el.selectedIds).to.deep.equal(['a']);
    expect(el.expandedIds).to.deep.equal(['a']);
  });

  it('expandedIds / selectedIds are drivable from outside', async () => {
    const el = await mk(OU(), 'selection="multi"');
    el.expandedIds = ['corp', 'fin'];
    await nextFrame();
    expect(row(el, 'fin-ap'), 'driving expansion opens the branch').to.exist;
    el.selectedIds = ['fin-ap'];
    await nextFrame();
    expect(row(el, 'fin-ap').getAttribute('aria-selected')).to.equal('true');
  });

  it('ignores clicks and keys on a disabled node', async () => {
    const el = await mk(OU(), 'selection="multi"');
    row(el, 'kiosk').click();
    await nextFrame();
    expect(el.selectedIds).to.deep.equal([]);
  });
});

describe('ds-tree — row content', () => {
  it('renders a badge, meta and an action from data', async () => {
    const el = await mk([{ id: 'a', text: 'A', badge: '42', meta: '12 reports', action: { text: 'Run', actionId: 'run' } }]);
    const r = row(el, 'a');
    expect(r.querySelector('ds-badge').getAttribute('label')).to.equal('42');
    expect(r.querySelector('.ds-tree__meta').textContent).to.equal('12 reports');
    expect(r.querySelector('ds-button').getAttribute('label')).to.equal('Run');
  });

  it('emits ds-tree-action from the row control, not a selection', async () => {
    const el = await mk([{ id: 'a', text: 'A', action: { text: 'Run', actionId: 'run' } }], 'selection="single"');
    const ev = oneEvent(el, 'ds-tree-action');
    row(el, 'a').querySelector('ds-button').click();
    const { detail } = await ev;
    expect(detail.actionId).to.equal('run');
    expect(el.selectedIds, 'the action did not also select the row').to.deep.equal([]);
  });

  it('writes labels and meta as TEXT, never as markup', async () => {
    const XSS = '<img src=x onerror=alert(1)>';
    const el = await mk([{ id: 'a', text: XSS, meta: XSS }]);
    const r = row(el, 'a');
    expect(r.querySelector('img'), 'nothing parsed out of the label').to.not.exist;
    expect(labelOf(r)).to.equal(XSS);
    expect(r.querySelector('.ds-tree__meta').textContent).to.equal(XSS);
  });

  it('marks a search hit with a real <mark>, built as a node', async () => {
    const el = await mk([{ id: 'a', text: 'Finance-AP-07', match: 'ap' }]);
    const m = row(el, 'a').querySelector('mark');
    expect(m, 'a real element').to.exist;
    expect(m.textContent, 'keeps source casing, matches case-insensitively').to.equal('AP');
    expect(labelOf(row(el, 'a')), 'full string intact').to.equal('Finance-AP-07');
  });

  it('treats the match query as literal text, not HTML', async () => {
    const el = await mk([{ id: 'a', text: '<b>bold</b> name', match: '<b>' }]);
    const r = row(el, 'a');
    expect(r.querySelector('b'), 'no element parsed').to.not.exist;
    expect(r.querySelector('mark').textContent).to.equal('<b>');
  });
});

describe('ds-tree — slotted markup', () => {
  it('builds the hierarchy from nested <ds-tree-item>', async () => {
    const el = await fixture(html`
      <ds-tree>
        <ds-tree-item id="p" text="Parent" expanded>
          <ds-tree-item id="c1" text="Child 1"></ds-tree-item>
          <ds-tree-item id="c2" text="Child 2"></ds-tree-item>
        </ds-tree-item>
      </ds-tree>`);
    await nextFrame();
    expect(rows(el).map((r) => labelOf(r))).to.deep.equal(['Parent', 'Child 1', 'Child 2']);
    expect(row(el, 'p').getAttribute('aria-expanded')).to.equal('true');
    expect(row(el, 'c1').getAttribute('aria-level')).to.equal('2');
  });

  it('survives a re-render — the slotted source is cached, not consumed', async () => {
    /* Reading the markup is destructive, so a second render found nothing and
       ds-item-list's suite hung on exactly this. */
    const el = await fixture(html`
      <ds-tree><ds-tree-item id="p" text="Parent"></ds-tree-item></ds-tree>`);
    await nextFrame();
    el.setAttribute('size', 'small');
    await nextFrame();
    expect(rows(el).length, 'still there after a re-render').to.equal(1);
  });
});

describe('ds-tree — dir/rtl must not re-enter its own paint', () => {
  it('applies dir="rtl" with a bounded number of paints', async () => {
    /* `dir` is observed and the paint writes it; setAttribute fires
       attributeChangedCallback even when the value is unchanged. Unguarded this
       recurses forever — the loop that shipped in ds-kpi-card and
       ds-form-footer. convention-lint RULE 6 also guards it statically. */
    const el = await mk(OU());
    const proto = Object.getPrototypeOf(el);
    const orig = proto._paintChrome;
    let calls = 0;
    proto._paintChrome = function (...a) { calls += 1; if (calls > 50) return; return orig.apply(this, a); };
    try {
      el.setAttribute('rtl', '');
      await nextFrame();
      expect(calls, '_paintChrome re-entered itself').to.be.lessThan(10);
      expect(el.getAttribute('dir')).to.equal('rtl');
      el.removeAttribute('rtl');
      await nextFrame();
      expect(el.hasAttribute('dir'), 'and clears again').to.be.false;
    } finally {
      proto._paintChrome = orig;
    }
  });
});

describe('ds-tree — indentation geometry', () => {
  /* Needs the real stylesheet: the shared harness does not load component CSS,
     so padding would read as an initial value. */
  before(async () => {
    const HREFS = ['/src/tokens/primitives.css', '/src/tokens/spacing.css',
      '/src/tokens/typography.css', '/src/tokens/tokens.css',
      '/src/components/tree/tree.css'];
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

  it('indents each level further than the last', async () => {
    const el = await mk(OU());
    el.expandAll();
    await nextFrame();
    const pad = (id) => parseFloat(getComputedStyle(row(el, id)).paddingInlineStart);
    expect(pad('corp'), 'level 1 has a real indent, not 0').to.be.greaterThan(0);
    expect(pad('fin'), 'level 2 > level 1').to.be.greaterThan(pad('corp'));
    expect(pad('fin-ap'), 'level 3 > level 2').to.be.greaterThan(pad('fin'));
  });

  it('steps the indent evenly, so the levels read as levels', async () => {
    const el = await mk(OU());
    el.expandAll();
    await nextFrame();
    const pad = (id) => parseFloat(getComputedStyle(row(el, id)).paddingInlineStart);
    const step1 = pad('fin') - pad('corp');
    const step2 = pad('fin-ap') - pad('fin');
    expect(step1, 'a real step, not a rounding artifact').to.be.greaterThan(4);
    expect(Math.abs(step1 - step2), 'every level steps by the same amount').to.be.lessThan(0.5);
  });
});
