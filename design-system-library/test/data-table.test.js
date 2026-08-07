/* ds-data-table — rendering, injection safety, client-side sort/search/paginate.
   Sorting, searching, and pagination are client-side by default (the component
   also emits events so server-side consumers can re-supply rows). */
import { fixture, html, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/data-table/data-table.js';
import { safeHtml } from '../src/utils/escape.js';

const cols = () => ([
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age',  header: 'Age',  accessor: 'age',  sortable: true },
]);
const rows = () => ([
  { id: '1', name: 'Charlie', age: 30 },
  { id: '2', name: 'alice',   age: 2 },
  { id: '3', name: 'Bob',     age: 100 },
]);

const nameCells = (el) => [...el.querySelectorAll('tbody tr')].map((tr) => tr.querySelector('td')?.textContent.trim());
const sortBtn = (el, label) => [...el.querySelectorAll('.ds-data-table__sort')].find((b) => b.textContent.trim().startsWith(label));

async function makeTable() {
  const el = await fixture(html`<ds-data-table selection-mode="none"></ds-data-table>`);
  el.columns = cols();
  el.rows = rows();
  await nextFrame();
  return el;
}

describe('ds-data-table — rendering', () => {
  it('renders one body row per data row', async () => {
    const el = await makeTable();
    expect(el.querySelectorAll('tbody tr').length).to.equal(3);
    expect(nameCells(el)).to.have.members(['Charlie', 'alice', 'Bob']);
  });

  it('renders cell values and headers as text, never as HTML', async () => {
    const el = await fixture(html`<ds-data-table selection-mode="none"></ds-data-table>`);
    el.columns = [{ id: 'x', header: 'A <b>bold</b>', accessor: 'x', sortable: true }];
    el.rows = [{ id: '1', x: '<img src=x onerror=alert(1)>' }];
    await nextFrame();
    expect(el.querySelector('tbody img'), 'cell HTML was injected').to.not.exist;
    expect(el.querySelector('thead b'), 'header HTML was injected').to.not.exist;
    expect(el.querySelector('tbody td').textContent).to.contain('<img');
  });

  it('shows the empty state when there are no rows', async () => {
    const el = await fixture(html`<ds-data-table selection-mode="none" empty-text="Nothing here"></ds-data-table>`);
    el.columns = cols();
    el.rows = [];
    await nextFrame();
    expect(el.textContent).to.contain('Nothing here');
  });
});

describe('ds-data-table — sort', () => {
  it('sorts ascending and emits ds-data-table-sort on the first header click', async () => {
    const el = await makeTable();
    setTimeout(() => sortBtn(el, 'Name').click());
    const ev = await oneEvent(el, 'ds-data-table-sort');
    expect(ev.detail).to.deep.equal({ columnId: 'name', direction: 'asc' });
    expect(nameCells(el)).to.deep.equal(['alice', 'Bob', 'Charlie']); // case-insensitive
  });

  it('cycles asc → desc → none across three clicks', async () => {
    const el = await makeTable();
    sortBtn(el, 'Name').click();  // asc
    expect(nameCells(el)).to.deep.equal(['alice', 'Bob', 'Charlie']);
    sortBtn(el, 'Name').click();  // desc
    expect(nameCells(el)).to.deep.equal(['Charlie', 'Bob', 'alice']);
    sortBtn(el, 'Name').click();  // none → original order
    expect(nameCells(el)).to.deep.equal(['Charlie', 'alice', 'Bob']);
  });

  it('sorts numerically, not lexically', async () => {
    const el = await makeTable();
    sortBtn(el, 'Age').click(); // asc
    const ages = [...el.querySelectorAll('tbody tr')].map((tr) => tr.querySelectorAll('td')[1].textContent.trim());
    expect(ages).to.deep.equal(['2', '30', '100']); // not ['100','2','30']
  });
});

describe('ds-data-table — search + pagination', () => {
  it('filters rows by search-value (case-insensitive)', async () => {
    const el = await makeTable();
    el.setAttribute('search-value', 'bob');
    await nextFrame();
    expect(nameCells(el)).to.deep.equal(['Bob']);
  });

  it('paginates client-side by rows-per-page and page', async () => {
    const el = await makeTable();
    el.setAttribute('rows-per-page', '2');
    await nextFrame();
    expect(el.querySelectorAll('tbody tr').length).to.equal(2);
    el.setAttribute('page', '2');
    await nextFrame();
    expect(el.querySelectorAll('tbody tr').length).to.equal(1); // 3 rows, last page holds 1
  });
});

describe('ds-data-table — safe cell rendering', () => {
  const withRender = async (render, rows) => {
    const el = await fixture(html`<ds-data-table selection-mode="none"></ds-data-table>`);
    el.columns = [{ id: 'n', header: 'N', render }];
    el.rows = rows;
    await nextFrame();
    return el;
  };

  it('safeHtml renderer keeps static markup but escapes interpolated data', async () => {
    const el = await withRender(
      (r) => safeHtml`<b class="tag">${r.name}</b>`,
      [{ id: '1', name: '<img src=x onerror=alert(1)>' }],
    );
    expect(el.querySelector('tbody td b.tag'), 'static <b> should render').to.exist;
    expect(el.querySelector('tbody td img'), 'data must not inject an <img>').to.not.exist;
    expect(el.querySelector('tbody td b.tag').textContent).to.contain('<img');
  });

  it('Node renderer is injection-safe', async () => {
    const el = await withRender((r) => {
      const s = document.createElement('span');
      s.textContent = r.name;
      return s;
    }, [{ id: '1', name: '<img src=x>' }]);
    expect(el.querySelector('tbody td img')).to.not.exist;
    expect(el.querySelector('tbody td span').textContent).to.contain('<img');
  });

  it('plain-string renderer still injects HTML (backward compatible)', async () => {
    const el = await withRender(() => '<b class="legacy">ok</b>', [{ id: '1', name: 'x' }]);
    expect(el.querySelector('tbody td b.legacy'), 'legacy trusted-HTML string should still render').to.exist;
  });
});
