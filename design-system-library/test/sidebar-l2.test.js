/* ds-sidebar-l2 — the grouped sub-nav. Groups + items come from the `groups`
   property. Covers group/item render, active state, group expand/collapse
   (attr + event), count badges, the search box + filtering, the settings header
   (back button), select event, escaping, a11y, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/sidebar-l2/sidebar-l2.js';

const GROUPS = [
  {
    id: 'global', label: 'Global Settings', expanded: true,
    items: [
      { id: 'group', label: 'Custom Group' },
      { id: 'patches', label: 'Installed Patches', count: 81 },
      { id: 'cfg', label: 'Configuration', sub: true, active: true },
    ],
  },
  {
    id: 'admin', label: 'User Administration', expanded: false,
    items: [
      { id: 'users', label: 'Users' },
      { id: 'roles', label: 'Roles' },
    ],
  },
];

const build = async (groups = GROUPS, attrs = {}) => {
  const el = await fixture(html`<ds-sidebar-l2></ds-sidebar-l2>`);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.groups = groups.map((g) => ({ ...g, items: g.items ? g.items.map((i) => ({ ...i })) : g.items }));
  await nextFrame();
  return el;
};

const nav = (el) => el.querySelector('nav.ds-sidebar-l2');
const groupsEls = (el) => el.querySelectorAll('.ds-sidebar-l2__group');
const itemsEls = (el) => el.querySelectorAll('.ds-sidebar-l2__item');

describe('ds-sidebar-l2 — structure', () => {
  it('renders a nav root and one group per entry', async () => {
    const el = await build();
    expect(nav(el)).to.exist;
    expect(groupsEls(el).length).to.equal(2);
  });

  it('renders each group header label + items', async () => {
    const el = await build();
    const headers = el.querySelectorAll('.ds-sidebar-l2__group-header');
    expect(headers[0].textContent).to.contain('Global Settings');
    expect(itemsEls(el).length).to.equal(5);
  });

  it('renders a search field by default', async () => {
    const el = await build();
    expect(el.querySelector('[data-search]')).to.exist;
  });

  it('renders the sliding active indicator', async () => {
    const el = await build();
    expect(el.querySelector('.ds-sidebar-l2__indicator')).to.exist;
  });
});

describe('ds-sidebar-l2 — item variants', () => {
  it('marks the active item with class + aria-current', async () => {
    const el = await build();
    const active = el.querySelector('.ds-sidebar-l2__item--active');
    expect(active).to.exist;
    expect(active.getAttribute('aria-current')).to.equal('page');
    expect(active.dataset.item).to.equal('cfg');
  });

  it('renders a count badge when an item has a count', async () => {
    const el = await build();
    const badge = el.querySelector('.ds-sidebar-l2__item-badge');
    expect(badge).to.exist;
    expect(badge.textContent).to.equal('81');
  });

  it('formats large counts (K/M)', async () => {
    const el = await build([{ id: 'g', label: 'G', expanded: true, items: [
      { id: 'a', label: 'A', count: 1500 },
    ] }]);
    expect(el.querySelector('.ds-sidebar-l2__item-badge').textContent).to.equal('1.5K');
  });

  it('renders a standalone type="item" group as a top-level item', async () => {
    const el = await build([{ type: 'item', id: 'dash', label: 'Dashboard' }]);
    const item = el.querySelector('.ds-sidebar-l2__item');
    expect(item).to.exist;
    expect(item.dataset.item).to.equal('dash');
    expect(item.dataset.group).to.equal('__top__');
  });
});

describe('ds-sidebar-l2 — group expand / collapse', () => {
  it('collapses a group whose expanded is false', async () => {
    const el = await build();
    const admin = [...groupsEls(el)].find((g) => g.querySelector('[data-group-toggle="admin"]'));
    expect(admin.classList.contains('ds-sidebar-l2__group--collapsed')).to.be.true;
    expect(admin.querySelector('[data-group-toggle]').getAttribute('aria-expanded')).to.equal('false');
  });

  it('toggling a group header emits ds-sidebar-l2-toggle and flips state', async () => {
    const el = await build();
    const toggle = el.querySelector('[data-group-toggle="global"]');
    setTimeout(() => toggle.click());
    const ev = await oneEvent(el, 'ds-sidebar-l2-toggle');
    expect(ev.detail.groupId).to.equal('global');
    expect(ev.detail.expanded).to.be.false;
    const global = [...groupsEls(el)].find((g) => g.querySelector('[data-group-toggle="global"]'));
    expect(global.classList.contains('ds-sidebar-l2__group--collapsed')).to.be.true;
  });
});

describe('ds-sidebar-l2 — search filtering', () => {
  it('filters items to those matching the query', async () => {
    const el = await build();
    const search = el.querySelector('[data-search]');
    search.value = 'patch';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await nextFrame();
    const labels = [...el.querySelectorAll('.ds-sidebar-l2__item-label')].map((n) => n.textContent);
    expect(labels).to.include('Installed Patches');
    expect(labels).to.not.include('Custom Group');
  });

  it('emits ds-sidebar-l2-search with the query', async () => {
    const el = await build();
    const search = el.querySelector('[data-search]');
    setTimeout(() => {
      search.value = 'users';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const ev = await oneEvent(el, 'ds-sidebar-l2-search');
    expect(ev.detail.query).to.equal('users');
  });

  it('show-search="false" removes the search field', async () => {
    const el = await build(GROUPS, { 'show-search': 'false' });
    expect(el.querySelector('[data-search]')).to.not.exist;
  });
});

describe('ds-sidebar-l2 — settings header', () => {
  it('renders a back control + title only in the settings variant', async () => {
    const el = await build(GROUPS, { variant: 'settings', title: 'Settings Home', 'show-back': '' });
    const header = el.querySelector('.ds-sidebar-l2__header');
    expect(header).to.exist;
    expect(el.querySelector('.ds-sidebar-l2__title').textContent).to.equal('Settings Home');
    expect(el.querySelector('[data-back]')).to.exist;
  });

  it('emits ds-sidebar-l2-back when the back control is clicked', async () => {
    const el = await build(GROUPS, { variant: 'settings', title: 'Home', 'show-back': '' });
    const back = el.querySelector('[data-back]');
    setTimeout(() => back.click());
    const ev = await oneEvent(el, 'ds-sidebar-l2-back');
    expect(ev).to.exist;
  });

  it('renders no settings header for a standard (non-settings) sidebar', async () => {
    const el = await build(GROUPS, { title: 'Ignored' });
    expect(el.querySelector('.ds-sidebar-l2__header')).to.not.exist;
  });
});

describe('ds-sidebar-l2 — collapse toggle', () => {
  it('renders a collapse control when collapse-toggle is set, and reflects collapsed', async () => {
    const el = await build(GROUPS, { 'collapse-toggle': '' });
    const btn = el.querySelector('.ds-sidebar-l2__collapse');
    expect(btn).to.exist;
    expect(btn.getAttribute('aria-expanded')).to.equal('true');
    el.collapsed = true;
    await nextFrame();
    expect(btn.getAttribute('aria-expanded')).to.equal('false');
  });
});

describe('ds-sidebar-l2 — selection', () => {
  it('emits ds-sidebar-l2-select and moves active on click', async () => {
    const el = await build();
    const target = [...itemsEls(el)].find((i) => i.dataset.item === 'group');
    setTimeout(() => target.click());
    const ev = await oneEvent(el, 'ds-sidebar-l2-select');
    expect(ev.detail.groupId).to.equal('global');
    expect(ev.detail.item.id).to.equal('group');
    expect(target.classList.contains('ds-sidebar-l2__item--active')).to.be.true;
  });
});

describe('ds-sidebar-l2 — escaping', () => {
  it('renders a hostile item label as literal text (no injected <img>)', async () => {
    const el = await build([{ id: 'g', label: 'G', expanded: true, items: [
      { id: 'x', label: '<img src=x onerror=alert(1)>' },
    ] }]);
    expect(nav(el).querySelector('img')).to.not.exist;
    expect(el.querySelector('.ds-sidebar-l2__item-label').textContent).to.contain('<img');
  });
});

describe('ds-sidebar-l2 — a11y', () => {
  it('is accessible with grouped items + search', async () => {
    const el = await build();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('is accessible in the settings variant', async () => {
    const el = await build(GROUPS, { variant: 'settings', title: 'Settings', 'show-back': '' });
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-sidebar-l2 — teardown', () => {
  it('disconnects without throwing', async () => {
    const el = await build();
    expect(() => el.remove()).to.not.throw();
  });

  it('survives disconnect → reconnect without duplicating the nav', async () => {
    const el = await build();
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('nav.ds-sidebar-l2').length).to.equal(1);
    expect(groupsEls(el).length).to.equal(2);
  });
});
