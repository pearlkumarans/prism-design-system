/* ds-item-list / ds-item — the stacked row list. Covers injection safety
   (device names and usernames render as text), both sources (slotted <ds-item>
   children and the `items` property), the leading-rail matrix, status tints,
   meta position, dividers, the timeline variant, the interaction contract (row
   hovers but is NOT a click target; only the trailing control is), a11y roles,
   rtl, and teardown. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/item-list/item-list.js';
import { trackListeners } from './helpers/listeners.js';

const A11Y = { ignoredRules: ['color-contrast'] };
const rows = (el) => [...el.querySelectorAll('.ds-item')];
const textOf = (r) => r.querySelector('.ds-item__text')?.textContent;

async function mk(items, attrs = '') {
  const el = await fixture(html`<div></div>`);
  el.innerHTML = `<ds-item-list ${attrs}></ds-item-list>`;
  const list = el.querySelector('ds-item-list');
  list.items = items;
  await nextFrame();
  return list;
}

const ACTIVITY = [
  { text: '23 devices pending enrollment', icon: 'exclamation-circle', status: 'critical', meta: 'Security · 3 mins ago' },
  { text: 'MacBook-Pro-Dev-09 enrolled', icon: 'circle-tick', status: 'success', meta: 'admin · 2 hours ago' },
];

describe('ds-item-list', () => {
  /* The shared harness deliberately does not load component CSS, so any test that
     MEASURES layout (row padding, marker centring, connector ends) would otherwise
     read the property's initial value and assert nothing. Loaded once, at the root,
     so it does not depend on which describe block happens to run first.

     The token files are listed individually rather than via tokens/index.css: that
     file's relative @imports 404 under the test server, so the custom properties
     never arrive — invisible when the whole suite runs (other components pull them
     in via injectCss) but fatal when this file runs alone.

     Every load also races a short timer and never rejects. A stylesheet that hangs
     must not take the suite with it — an unsettled root `before` reports
     "0 passed, 0 failed" after the global timeout, with no clue which hook stalled. */
  before(async () => {
    const HREFS = [
      '/src/tokens/primitives.css',
      '/src/tokens/spacing.css',
      '/src/tokens/typography.css',
      '/src/tokens/typography-tokens.css',
      '/src/tokens/tokens.css',
      '/src/components/item-list/item-list.css',
    ];
    await Promise.all(HREFS.map((href) => new Promise((resolve) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
      const done = () => resolve();
      link.addEventListener('load', done);
      link.addEventListener('error', done);
      setTimeout(done, 2000);
      document.head.appendChild(link);
    })));
    await nextFrame();   // one frame for the new sheets to apply
  });

  /* Fail loudly and once if the tokens did not arrive, instead of letting every
     layout assertion fail with a confusing 0px. */
  it('has the design tokens available (guards the layout assertions below)', () => {
    const probe = document.createElement('div');
    probe.style.paddingTop = 'var(--spacing-12)';
    document.body.appendChild(probe);
    const pad = getComputedStyle(probe).paddingTop;
    probe.remove();
    expect(pad, '--spacing-12 must resolve or every measurement below is meaningless').to.equal('12px');
  });

  it('renders a row per item, from the items property', async () => {
    const el = await mk(ACTIVITY);
    expect(rows(el).length).to.equal(2);
    expect(textOf(rows(el)[0])).to.equal('23 devices pending enrollment');
  });

  it('renders from slotted <ds-item> children', async () => {
    const el = await fixture(html`
      <ds-item-list>
        <ds-item text="Servers" icon="server-01" status="success"></ds-item>
        <ds-item text="Laptops" icon="laptop"></ds-item>
      </ds-item-list>`);
    await nextFrame();
    expect(rows(el).map(textOf)).to.eql(['Servers', 'Laptops']);
  });

  it('renders data-derived text as TEXT, never as markup', async () => {
    /* Device names and usernames reach this component straight from an API. */
    const el = await mk([{ text: '<img src=x onerror=alert(1)>DESKTOP-01', description: '<b>b</b>', meta: '<i>i</i>' }]);
    const row = rows(el)[0];
    expect(row.querySelector('img'), 'no element from the label').to.not.exist;
    expect(row.querySelector('b'), 'no element from the description').to.not.exist;
    expect(textOf(row)).to.equal('<img src=x onerror=alert(1)>DESKTOP-01');
  });

  it('gives every leading-rail treatment its own class', async () => {
    for (const lead of ['circle', 'plain', 'box', 'none']) {
      const el = await mk([{ text: 'x', icon: 'user', lead }]);
      expect(rows(el)[0].classList.contains(`ds-item--lead-${lead}`), lead).to.be.true;
    }
  });

  it('defaults the rail to circle when an icon is given, none when it is not', async () => {
    const withIcon = await mk([{ text: 'x', icon: 'user' }]);
    expect(rows(withIcon)[0].classList.contains('ds-item--lead-circle')).to.be.true;
    const bare = await mk([{ text: 'x' }]);
    expect(rows(bare)[0].classList.contains('ds-item--lead-none')).to.be.true;
  });

  it('tints a box rail from the row status, exactly as circle does', async () => {
    /* box and circle differ in SHAPE only. Before this, box had one fixed grey
       look, so a tinted rounded tile (.pu-item's category tiles) had to be
       hand-rolled. Compared against circle rather than a hardcoded colour: the
       point is that the two rails agree, not what the token happens to be. */
    const bg = async (lead, status) => {
      const el = await mk([{ text: 'x', icon: 'user', lead, status }]);
      return getComputedStyle(el.querySelector('.ds-item__lead')).backgroundColor;
    };
    for (const status of ['info', 'success', 'warning', 'critical']) {
      const box = await bg('box', status);
      expect(box, `box/${status} must match circle/${status}`).to.equal(await bg('circle', status));
      expect(box, `box/${status} must not stay the untinted grey`).to.not.equal(await bg('box', 'default'));
    }
  });

  it('defaults the rail tone to the row status, so status-driven rows are unchanged', async () => {
    for (const status of ['info', 'success', 'warning', 'critical', 'default']) {
      const el = await mk([{ text: 'x', icon: 'user', status }]);
      expect(rows(el)[0].classList.contains(`ds-item--tone-${status}`), status).to.be.true;
    }
  });

  it('tints the rail from tone WITHOUT touching the badge state', async () => {
    /* The whole point of tone: .pu-item tints by category on rows that have no
       state. A category must not end up claiming a status on the chip. */
    const el = await mk([{ text: 'Zoom 6.5.9', icon: 'user', lead: 'box', tone: 'brand',
      badge: { text: 'Integration' } }]);
    const row = rows(el)[0];
    expect(row.classList.contains('ds-item--tone-brand'), 'rail takes the tone').to.be.true;
    expect(row.classList.contains('ds-item--status-default'), 'status stays default').to.be.true;
    expect(el.querySelector('ds-badge').getAttribute('state'),
      'the chip follows status, not tone').to.equal('default');
  });

  it('gives alert and brand their own tints, distinct from every status tint', async () => {
    /* These two exist only as tones — they are the tints .pu-item needed and the
       status vocabulary deliberately does not have.

       Compares the tile AND the glyph colour, not the tile alone: in the LIGHT
       theme --uems-bg-accent-primary and --uems-bg-info-primary are the same
       token (--cobalt-25), so brand and info legitimately share a background and
       are told apart by the glyph. The hand-rolled .pu-item had the identical
       collision. Asserting on the background alone passes only because this
       harness happens to run dark, where the two tokens diverge. */
    const tint = async (tone) => {
      const el = await mk([{ text: 'x', icon: 'user', lead: 'box', tone }]);
      const cs = getComputedStyle(el.querySelector('.ds-item__lead'));
      return `${cs.backgroundColor} on ${cs.color}`;
    };
    const seen = {};
    for (const t of ['default', 'info', 'success', 'warning', 'alert', 'critical', 'brand']) seen[t] = await tint(t);
    for (const t of ['alert', 'brand']) {
      for (const other of ['default', 'info', 'success', 'warning', 'critical']) {
        expect(seen[t], `${t} must be distinguishable from ${other}`).to.not.equal(seen[other]);
      }
    }
  });

  it('ignores an unknown tone and falls back to the row status', async () => {
    const el = await mk([{ text: 'x', icon: 'user', status: 'critical', tone: 'chartreuse' }]);
    expect(rows(el)[0].classList.contains('ds-item--tone-critical')).to.be.true;
  });

  it('leaves the box rail default untinted, so existing rows do not move', async () => {
    /* box keeps its own darker default icon rather than joining the ladder at
       `default` — adding the tints must not restyle anything already shipped. */
    const el = await mk([{ text: 'x', icon: 'user', lead: 'box' }]);
    const lead = getComputedStyle(el.querySelector('.ds-item__lead'));
    const circle = await mk([{ text: 'x', icon: 'user', lead: 'circle' }]);
    expect(lead.color, 'box default icon stays icon-secondary, not the circle ladder tertiary')
      .to.not.equal(getComputedStyle(circle.querySelector('.ds-item__lead')).color);
  });

  it('carries the status as a class, and never by colour alone', async () => {
    const el = await mk([{ text: 'Agent lost connection', icon: 'exclamation-circle', status: 'critical' }]);
    const row = rows(el)[0];
    expect(row.classList.contains('ds-item--status-critical')).to.be.true;
    /* The glyph is decorative — the meaning has to live in the text. */
    expect(row.querySelector('.ds-item__lead').getAttribute('aria-hidden')).to.equal('true');
    expect(textOf(row)).to.contain('lost connection');
  });

  describe('search-match highlighting', () => {
    it('wraps the matched run in a real <mark>, built as a node not markup', async () => {
      const el = await mk([{ text: 'DESKTOP-ENG-117', match: 'eng' }]);
      const t = el.querySelector('.ds-item__text');
      const m = t.querySelector('mark');
      expect(m, 'a real <mark> element').to.exist;
      expect(m.textContent, 'keeps the source casing, matches case-insensitively').to.equal('ENG');
      expect(t.textContent, 'the full string survives intact').to.equal('DESKTOP-ENG-117');
    });

    it('highlights the description too', async () => {
      const el = await mk([{ text: 'x', description: 'Windows 11 Pro', match: 'windows' }]);
      expect(el.querySelector('.ds-item__description mark').textContent).to.equal('Windows');
    });

    it('never treats the query or the text as HTML', async () => {
      /* The reason highlight() could not simply be lifted in: it returned markup.
         Both sides must stay inert — the text is a device name off an API. */
      const el = await mk([{ text: '<img src=x onerror=alert(1)> laptop', match: '<img' }]);
      const t = el.querySelector('.ds-item__text');
      expect(t.querySelector('img'), 'no element parsed out of the text').to.not.exist;
      expect(t.textContent).to.equal('<img src=x onerror=alert(1)> laptop');
      expect(t.querySelector('mark').textContent, 'the query is matched literally').to.equal('<img');
    });

    it('leaves the text alone when there is no match, no query, or an empty one', async () => {
      for (const match of [undefined, '', '   ', 'zzz']) {
        const el = await mk([{ text: 'Managed devices', match }]);
        expect(el.querySelector('.ds-item__text mark'), String(match)).to.not.exist;
        expect(el.querySelector('.ds-item__text').textContent).to.equal('Managed devices');
      }
    });

    it('marks a match at the very start without emitting an empty text node', async () => {
      const el = await mk([{ text: 'Windows 11', match: 'win' }]);
      const t = el.querySelector('.ds-item__text');
      expect(t.firstChild.nodeName.toLowerCase(), 'starts with the mark itself').to.equal('mark');
    });
  });

  describe('framed rows', () => {
    it('gives each row its own border and drops the divider that would double it', async () => {
      const el = await mk([{ text: 'a' }, { text: 'b' }], 'framed divider="line"');
      const root = el.querySelector('.ds-item-list');
      expect(root.classList.contains('ds-item-list--framed')).to.be.true;
      expect(root.classList.contains('ds-item-list--divider-none'),
        'the frame wins over an explicit divider').to.be.true;
      const cs = getComputedStyle(rows(el)[0]);
      expect(cs.borderTopWidth, 'a real border, not a bottom rule').to.equal('1px');
      expect(cs.borderTopStyle).to.equal('solid');
    });

    it('is off by default, so unframed lists keep their dividers', async () => {
      const el = await mk([{ text: 'a' }, { text: 'b' }], 'divider="line"');
      const root = el.querySelector('.ds-item-list');
      expect(root.classList.contains('ds-item-list--framed')).to.be.false;
      expect(root.classList.contains('ds-item-list--divider-line')).to.be.true;
    });
  });

  it('places meta below by default and above on request', async () => {
    const below = await mk([{ text: 'T', meta: 'M' }]);
    const kidsBelow = [...below.querySelector('.ds-item__body').children].map((c) => c.className);
    expect(kidsBelow.indexOf('ds-item__meta')).to.be.greaterThan(kidsBelow.indexOf('ds-item__text'));

    const above = await mk([{ text: 'T', meta: 'M', metaPosition: 'above' }]);
    const kidsAbove = [...above.querySelector('.ds-item__body').children].map((c) => c.className);
    expect(kidsAbove.indexOf('ds-item__meta')).to.be.lessThan(kidsAbove.indexOf('ds-item__text'));
  });

  it('renders the primary line as a real link when href is set', async () => {
    const el = await mk([{ text: 'BitLocker report', href: '/reports/bitlocker' }]);
    const a = el.querySelector('a.ds-item__text');
    expect(a, 'a real anchor, not a click handler').to.exist;
    expect(a.getAttribute('href')).to.equal('/reports/bitlocker');
  });

  describe('interaction contract', () => {
    it('does not make the row itself a click or focus target', async () => {
      /* Hover exists to associate the trailing action with its row — the row is
         not clickable, so it must not be focusable or advertise a pointer. */
      const el = await mk(ACTIVITY);
      const row = rows(el)[0];
      expect(row.hasAttribute('tabindex'), 'no fake tabindex on a div').to.be.false;
      expect(row.getAttribute('role')).to.equal('listitem');
      expect(getComputedStyle(row).cursor, 'no pointer on a non-clickable row').to.not.equal('pointer');
    });

    it('names the trailing control with its subject', async () => {
      /* "Approve" alone is meaningless in a screen reader's list of controls. */
      const el = await fixture(html`
        <ds-item-list>
          <ds-item text="23 devices pending enrollment">
            <a slot="trailing" href="#">Approve</a>
          </ds-item>
        </ds-item-list>`);
      await nextFrame();
      const ctl = el.querySelector('.ds-item__trailing a');
      expect(ctl).to.exist;
      expect(ctl.getAttribute('aria-label')).to.equal('Approve — 23 devices pending enrollment');
    });

    it('builds a real button from items.action and fires ds-item-action', async () => {
      const el = await mk([{ text: 'Reboot required', value: 'dev-9',
        action: { text: 'Reboot', actionId: 'reboot' } }]);
      const btn = el.querySelector('.ds-item__trailing ds-button');
      expect(btn, 'a ds-button, not a div with a handler').to.exist;
      expect(btn.getAttribute('label'), 'label attr survives re-render').to.equal('Reboot');

      let detail = null;
      el.addEventListener('ds-item-action', (e) => { detail = e.detail; });
      btn.querySelector('button').click();
      expect(detail).to.include({ actionId: 'reboot', value: 'dev-9', index: 0 });
      expect(detail.item.text).to.equal('Reboot required');
    });

    it('builds a link, not a button, when the action navigates', async () => {
      const el = await mk([{ text: 'BitLocker report', action: { text: 'View', href: '/r/1' } }]);
      const link = el.querySelector('.ds-item__trailing ds-text-link');
      expect(link).to.exist;
      expect(link.getAttribute('href')).to.equal('/r/1');
      expect(el.querySelector('.ds-item__trailing ds-button'), 'navigation is not a button').to.not.exist;
    });

    it('renders a real ds-badge from items[].badge, inheriting the row status', async () => {
      /* The tints belong to ds-badge; item-list must never re-implement them. */
      const el = await mk([{ text: 'Agent unreachable', status: 'critical', badge: 'Security', meta: '3 mins ago' }]);
      const badge = el.querySelector('.ds-item__meta ds-badge');
      expect(badge, 'a ds-badge, not a hand-tinted span').to.exist;
      expect(badge.getAttribute('label')).to.equal('Security');
      expect(badge.getAttribute('state'), 'critical maps to ds-badge state critical').to.equal('critical');
      expect(badge.getAttribute('variant')).to.equal('subtle');
    });

    it('maps our status vocabulary onto ds-badge states', async () => {
      const pairs = [['info', 'active'], ['warning', 'important'], ['success', 'success'], ['default', 'default']];
      for (const [status, state] of pairs) {
        const el = await mk([{ text: 'Row', status, badge: 'Tag' }]);
        expect(el.querySelector('ds-badge').getAttribute('state'), status).to.equal(state);
      }
    });

    it('lets an explicit badge state override the row status', async () => {
      const el = await mk([{ text: 'Row', status: 'critical', badge: { text: 'Info', state: 'active' } }]);
      expect(el.querySelector('ds-badge').getAttribute('state')).to.equal('active');
    });

    it('passes an explicit badge shape through, and otherwise leaves it to ds-badge', async () => {
      /* .pu-item and .sup-upg__item use shape="rounded"; pill is ds-badge's own
         default, so we set nothing when the call site says nothing. */
      const rounded = await mk([{ text: 'Row', badge: { text: 'Security', shape: 'rounded' } }]);
      expect(rounded.querySelector('ds-badge').getAttribute('shape')).to.equal('rounded');
      const plain = await mk([{ text: 'Row', badge: 'Security' }]);
      expect(plain.querySelector('ds-badge').hasAttribute('shape'),
        'no shape attribute, so ds-badge keeps its own default').to.be.false;
    });

    it('renders the meta strip for a badge with no meta text', async () => {
      const el = await mk([{ text: 'Row', badge: 'Security' }]);
      expect(el.querySelector('.ds-item__meta ds-badge'), 'strip exists for badge alone').to.exist;
    });

    it('renders a trailing value that is NOT a control (.wl-row, .srch-row)', async () => {
      /* A count is data, not an affordance: no focus stop, no accessible name,
         no pointer. Getting this wrong turns 16 files of stat rows into fake
         buttons. */
      const el = await mk([{ text: 'Managed devices', icon: 'laptop', lead: 'box', trailing: '412' }]);
      const val = el.querySelector('.ds-item__trailing .ds-item__value');
      expect(val, 'a value span').to.exist;
      expect(val.textContent).to.equal('412');
      expect(el.querySelector('.ds-item__trailing a, .ds-item__trailing button'), 'not a control').to.not.exist;
      expect(val.hasAttribute('aria-label'), 'a value is not named like a control').to.be.false;
      expect(val.hasAttribute('tabindex')).to.be.false;
    });

    it('accepts a badge as the trailing value, delegating to ds-badge', async () => {
      const el = await mk([{ text: 'DESKTOP-4471-QA', status: 'success', trailing: { badge: 'Online' } }]);
      const badge = el.querySelector('.ds-item__trailing ds-badge');
      expect(badge, 'a real ds-badge in the trailing region').to.exist;
      expect(badge.getAttribute('label')).to.equal('Online');
      expect(badge.getAttribute('state'), 'inherits the row status').to.equal('success');
    });

    it('renders a value and an action together, value first', async () => {
      const el = await mk([{ text: 'Pending', trailing: '9', action: { text: 'Review', actionId: 'r' } }]);
      const kids = [...el.querySelector('.ds-item__trailing').children];
      expect(kids).to.have.lengthOf(2);
      expect(kids[0].classList.contains('ds-item__value'), 'value leads').to.be.true;
      expect(kids[1].tagName.toLowerCase(), 'action is rightmost').to.equal('ds-button');
    });

    it('still names the action when a value sits beside it', async () => {
      const el = await mk([{ text: '23 devices pending', trailing: '23', action: { text: 'Approve', actionId: 'a' } }]);
      const btn = el.querySelector('.ds-item__trailing ds-button button');
      expect(btn.getAttribute('aria-label')).to.equal('Approve — 23 devices pending');
    });

    it('renders trailing 0 rather than dropping it', async () => {
      /* A falsy-but-real count is the whole point of a stat row. */
      const el = await mk([{ text: 'Failed', trailing: 0 }]);
      expect(el.querySelector('.ds-item__value').textContent).to.equal('0');
    });

    it('sizes a badge by WHERE it sits: small in meta, medium in trailing', async () => {
      /* A chip in the meta strip is an aside among 12px text; a chip in the
         trailing column stands in for the row's value. .wl-row uses medium there. */
      const el = await mk([{ text: 'DESKTOP-4471-QA', status: 'success',
        badge: 'Security', trailing: { badge: 'Online' } }]);
      expect(el.querySelector('.ds-item__meta ds-badge').getAttribute('size')).to.equal('small');
      expect(el.querySelector('.ds-item__trailing ds-badge').getAttribute('size')).to.equal('medium');
    });

    it('lets an explicit badge size override the positional default', async () => {
      const el = await mk([{ text: 'Row', trailing: { badge: { text: 'On', size: 'small' } } }]);
      expect(el.querySelector('.ds-item__trailing ds-badge').getAttribute('size')).to.equal('small');
    });

    it('drops the action button to xsmall at small density', async () => {
      /* A small row is ~32px of content; a 36px `small` button overflows it. */
      const med = await mk([{ text: 'Reboot required', action: { text: 'Reboot', actionId: 'r' } }]);
      const medBtn = med.querySelector('.ds-item__trailing ds-button');
      expect(medBtn.getAttribute('size')).to.equal('small');

      const sm = await mk([{ text: 'Reboot required', action: { text: 'Reboot', actionId: 'r' } }], 'size="small"');
      const smBtn = sm.querySelector('.ds-item__trailing ds-button');
      expect(smBtn.getAttribute('size')).to.equal('xsmall');

      /* Assert it actually renders smaller, not just that the attribute changed. */
      const h = (b) => b.querySelector('button').getBoundingClientRect().height;
      expect(h(smBtn), 'xsmall is shorter than small').to.be.lessThan(h(medBtn));
    });

    it('holds ds-text-link and the meta badge at small — they have no xsmall', async () => {
      /* Passing a size a component does not define makes it fall back to its own
         default, which is LARGER than the medium case. So these floor at small. */
      const el = await mk([
        { text: 'Report', action: { text: 'View', href: '#' } },
        { text: 'Note', description: 'D', link: 'Read more', badge: 'Tag' },
      ], 'size="small"');
      expect(el.querySelector('.ds-item__trailing ds-text-link').getAttribute('size')).to.equal('small');
      expect(el.querySelector('.ds-item__link ds-text-link').getAttribute('size')).to.equal('small');
      expect(el.querySelector('.ds-item__meta ds-badge').getAttribute('size')).to.equal('small');
    });

    it('steps the trailing badge down with the density', async () => {
      const med = await mk([{ text: 'Row', trailing: { badge: 'Online' } }]);
      expect(med.querySelector('.ds-item__trailing ds-badge').getAttribute('size')).to.equal('medium');
      const sm = await mk([{ text: 'Row', trailing: { badge: 'Online' } }], 'size="small"');
      expect(sm.querySelector('.ds-item__trailing ds-badge').getAttribute('size')).to.equal('small');
    });

    it('lets an explicit action size override the density default', async () => {
      const el = await mk([{ text: 'Row', action: { text: 'Go', actionId: 'g', size: 'medium' } }], 'size="small"');
      expect(el.querySelector('.ds-item__trailing ds-button').getAttribute('size')).to.equal('medium');
    });

    it('rebuilds rows when size changes, so controls follow the density', async () => {
      /* size is structural now: a chrome-only repaint would leave a small-density
         row holding a medium-density button. */
      const el = await mk([{ text: 'Row', action: { text: 'Go', actionId: 'g' } }]);
      expect(el.querySelector('.ds-item__trailing ds-button').getAttribute('size')).to.equal('small');
      el.setAttribute('size', 'small');
      await nextFrame();
      expect(el.querySelector('.ds-item__trailing ds-button').getAttribute('size')).to.equal('xsmall');
    });

    it('moves slotted regions in as live elements, not serialised markup', async () => {
      const el = await fixture(html`
        <ds-item-list>
          <ds-item text="Row"><ds-badge slot="meta">Security</ds-badge></ds-item>
        </ds-item-list>`);
      await nextFrame();
      const badge = el.querySelector('.ds-item__meta ds-badge');
      expect(badge, 'the real ds-badge, still upgraded').to.exist;
      expect(badge.hasAttribute('slot'), 'slot attribute consumed').to.be.false;
    });
  });

  describe('dividers + timeline', () => {
    it('applies the divider mode to the container', async () => {
      const el = await mk(ACTIVITY, 'divider="dashed"');
      expect(el.querySelector('.ds-item-list').classList.contains('ds-item-list--divider-dashed')).to.be.true;
    });

    it('forces dividers off in the timeline variant', async () => {
      /* The connector already separates rows; a rule on top competes with it. */
      const el = await mk(ACTIVITY, 'variant="timeline" divider="dashed"');
      const root = el.querySelector('.ds-item-list');
      expect(root.classList.contains('ds-item-list--timeline')).to.be.true;
      expect(root.classList.contains('ds-item-list--divider-none')).to.be.true;
      expect(root.classList.contains('ds-item-list--divider-dashed')).to.be.false;
    });

    it('supports an icon marker, reusing the circle rail for its tints', async () => {
      const el = await mk(
        [{ text: 'Package distributed', icon: 'circle-tick', status: 'success', meta: '10:14 AM' }],
        'variant="timeline" timeline-marker="icon"');
      const root = el.querySelector('.ds-item-list');
      expect(root.classList.contains('ds-item-list--timeline-icon')).to.be.true;
      const row = rows(el)[0];
      /* circle, not a bespoke timeline rail — the status tints are the SAME rules
         the default variant uses, so they can never drift apart. */
      expect(row.classList.contains('ds-item--lead-circle')).to.be.true;
      expect(row.querySelector('.ds-item__lead ds-icon'), 'the glyph IS the marker').to.exist;
      expect(row.querySelector('.ds-item__dot'), 'no dot when the marker is an icon').to.not.exist;
      expect(row.querySelector('.ds-item__lead').getAttribute('aria-hidden')).to.equal('true');
    });

    it('defaults the marker to dot and rejects an unknown value', async () => {
      for (const attrs of ['variant="timeline"', 'variant="timeline" timeline-marker="bogus"']) {
        const el = await mk([{ text: 'Created' }], attrs);
        expect(el.querySelector('.ds-item-list').classList.contains('ds-item-list--timeline-dot'), attrs).to.be.true;
        expect(rows(el)[0].querySelector('.ds-item__dot'), attrs).to.exist;
      }
    });

    it('only applies the marker class in the timeline variant', async () => {
      const el = await mk([{ text: 'Row' }], 'timeline-marker="icon"');
      const cls = el.querySelector('.ds-item-list').className;
      expect(cls).to.not.contain('timeline');
    });

    it('rebuilds rows when variant or marker changes, not just the class list', async () => {
      /* Both decide the rail, so a chrome-only repaint would leave a stale marker
         behind — a dot floating in a list of icon discs. */
      const el = await mk([{ text: 'Created', icon: 'clock' }]);
      expect(rows(el)[0].querySelector('.ds-item__dot'), 'default: no dot').to.not.exist;

      el.setAttribute('variant', 'timeline');
      await nextFrame();
      expect(rows(el)[0].querySelector('.ds-item__dot'), 'became a dot').to.exist;

      el.setAttribute('timeline-marker', 'icon');
      await nextFrame();
      expect(rows(el)[0].querySelector('.ds-item__dot'), 'dot replaced').to.not.exist;
      expect(rows(el)[0].querySelector('.ds-item__lead ds-icon'), 'now an icon disc').to.exist;
    });

    it('keeps both markers centred on the first text line, connector flush', async () => {
      for (const [attrs, size] of [['variant="timeline"', 14], ['variant="timeline" timeline-marker="icon"', 28]]) {
        const el = await mk(
          [{ text: 'Step one', icon: 'clock', meta: '10:02' }, { text: 'Step two', icon: 'clock', meta: '10:14' }],
          attrs);
        const [a, b] = rows(el);
        const marker = (r) => (r.querySelector('.ds-item__dot') || r.querySelector('.ds-item__lead')).getBoundingClientRect();
        const ma = marker(a);
        expect(Math.round(ma.width), `${attrs} marker width`).to.equal(size);

        const text = a.querySelector('.ds-item__text').getBoundingClientRect();
        const lh = parseFloat(getComputedStyle(a).lineHeight);
        expect(Math.abs((ma.top + ma.height / 2) - (text.top + lh / 2)), `${attrs} centring`).to.be.lessThan(1);

        /* The connector must meet the marker it leaves and the one it reaches. */
        const cs = getComputedStyle(a, '::before');
        const box = a.getBoundingClientRect();
        expect(Math.abs((box.top + parseFloat(cs.top)) - ma.bottom), `${attrs} connector top`).to.be.lessThan(1);
        expect(Math.abs(marker(b).top - (box.bottom - parseFloat(cs.bottom))), `${attrs} connector bottom`).to.be.lessThan(1);
        /* …and sit under its centre, not beside it. */
        expect(Math.abs((box.left + parseFloat(cs.left) + 1) - (ma.left + ma.width / 2)), `${attrs} connector centre`).to.be.lessThan(1);
      }
    });

    it('uses the dot rail for every timeline row, whatever lead was asked for', async () => {
      const el = await mk([{ text: 'Queued', icon: 'clock', lead: 'box' }], 'variant="timeline"');
      const row = rows(el)[0];
      expect(row.classList.contains('ds-item--lead-dot'), 'connector needs a fixed anchor').to.be.true;
      expect(row.querySelector('.ds-item__dot')).to.exist;
    });
  });

  describe('spacing', () => {
    /* An undefined token (there is no --spacing-10) silently invalidates the WHOLE
       padding shorthand, so medium rows rendered flush with no padding while small
       — which overrides both with real tokens — looked fine. Nothing else in this
       file can see that, so assert the resolved box directly.

       Layout assertions here rely on the root `before` hook loading the real
       stylesheet — see the top of this file. */

    it('resolves real padding and gap at both densities', async () => {
      const med = await mk(ACTIVITY);
      const medRow = rows(med)[0];
      expect(getComputedStyle(medRow).paddingTop, 'medium row padding').to.equal('12px');
      expect(getComputedStyle(medRow).columnGap, 'medium rail gap').to.equal('12px');

      const sm = await mk(ACTIVITY, 'size="small"');
      const smRow = rows(sm)[0];
      expect(getComputedStyle(smRow).paddingTop, 'small row padding').to.equal('6px');
      expect(getComputedStyle(smRow).columnGap, 'small rail gap').to.equal('8px');
    });

    it('leaves no unresolved custom property in the row box', async () => {
      /* Catches the whole class of bug, not just this instance: an undefined var
         computes to the empty string or the property's initial value. */
      const el = await mk(ACTIVITY);
      const cs = getComputedStyle(rows(el)[0]);
      for (const prop of ['paddingTop', 'paddingBottom', 'paddingLeft', 'columnGap', 'borderRadius', 'fontSize', 'lineHeight']) {
        expect(cs[prop], `${prop} resolved`).to.not.equal('');
        expect(cs[prop], `${prop} is not a collapsed zero`).to.not.equal('0px');
      }
    });

    it('centres the timeline dot on the first text line at both densities', async () => {
      /* The dot is absolutely positioned, so it does not follow row padding on its
         own — it is derived from it. If that derivation breaks, the dot drifts off
         the line it marks. */
      for (const [attrs, label] of [['variant="timeline"', 'medium'], ['variant="timeline" size="small"', 'small']]) {
        const el = await mk([{ text: 'Deployment created', meta: '10:02 AM' }], attrs);
        const row = rows(el)[0];
        const dot = row.querySelector('.ds-item__dot').getBoundingClientRect();
        const text = row.querySelector('.ds-item__text').getBoundingClientRect();
        const lineHeight = parseFloat(getComputedStyle(row).lineHeight);
        const offset = (dot.top + dot.height / 2) - (text.top + lineHeight / 2);
        expect(Math.abs(offset), `${label} dot offset from first line`).to.be.lessThan(1);
      }
    });
  });

  describe('inline body link (.pu-item__more)', () => {
    it('ends the BODY, never the trailing column', async () => {
      /* "Read more" continues the description — it is the content carrying on, not
         an action on the row. Putting it in trailing reads as a row-level control. */
      const el = await mk([{ text: 'Backoff is now adaptive', description: 'Agents retry on a widening interval.', link: 'Read more' }]);
      const row = rows(el)[0];
      expect(row.querySelector('.ds-item__trailing'), 'no trailing region').to.not.exist;
      const order = [...row.querySelector('.ds-item__body').children].map((c) => c.className.split(' ')[0]);
      expect(order).to.eql(['ds-item__text', 'ds-item__description', 'ds-item__link']);
    });

    it('renders a real ds-text-link with a continuation chevron', async () => {
      const el = await mk([{ text: 'T', link: { text: 'View release note', href: '/n/1' } }]);
      const lk = el.querySelector('.ds-item__link ds-text-link');
      expect(lk, 'a real link component').to.exist;
      expect(lk.getAttribute('label')).to.equal('View release note');
      expect(lk.getAttribute('href')).to.equal('/n/1');
      expect(lk.getAttribute('trailing-icon')).to.equal('chevron-right');
      expect(lk.getAttribute('size')).to.equal('small');
    });

    it('accepts a bare string and defaults the label', async () => {
      const str = await mk([{ text: 'T', link: 'More' }]);
      expect(str.querySelector('.ds-item__link ds-text-link').getAttribute('label')).to.equal('More');
      const bare = await mk([{ text: 'T', link: {} }]);
      expect(bare.querySelector('.ds-item__link ds-text-link').getAttribute('label')).to.equal('Read more');
    });

    it('drops the chevron when icon is null', async () => {
      const el = await mk([{ text: 'T', link: { text: 'More', icon: null } }]);
      expect(el.querySelector('.ds-item__link ds-text-link').hasAttribute('trailing-icon')).to.be.false;
    });

    it('coexists with a trailing action, each in its own region', async () => {
      /* .pu-item has both: "View" continues the text, "Install" acts on the row. */
      const el = await mk([{ text: 'Google Chrome 141', description: 'Approved for 412 devices',
        link: { text: 'View', href: '#' }, action: { text: 'Install', actionId: 'i' } }]);
      const row = rows(el)[0];
      expect(row.querySelector('.ds-item__body .ds-item__link ds-text-link'), 'link in body').to.exist;
      expect(row.querySelector('.ds-item__trailing ds-button'), 'action in trailing').to.exist;
      expect(row.querySelector('.ds-item__trailing .ds-item__link'), 'link is not in trailing').to.not.exist;
    });

    it('sits after the meta strip when meta is below', async () => {
      const el = await mk([{ text: 'T', description: 'D', meta: 'M', link: 'More' }]);
      const order = [...el.querySelector('.ds-item__body').children].map((c) => c.className.split(' ')[0]);
      expect(order).to.eql(['ds-item__text', 'ds-item__description', 'ds-item__meta', 'ds-item__link']);
    });
  });

  describe('output block (.tl-out)', () => {
    it('renders command output as pre-wrap text, not prose', async () => {
      const el = await mk([{ text: 'Script completed', output: 'line one\nline two' }]);
      const out = el.querySelector('.ds-item__output');
      expect(out, 'its own region, not the description').to.exist;
      expect(out.textContent).to.equal('line one\nline two');
      expect(getComputedStyle(out).whiteSpace, 'newlines are content').to.equal('pre-wrap');
    });

    it('switches to monospace on request', async () => {
      const plain = await mk([{ text: 'T', output: 'out' }]);
      expect(plain.querySelector('.ds-item__output').classList.contains('ds-item__output--mono')).to.be.false;
      const mono = await mk([{ text: 'T', output: 'out', mono: true }]);
      const el = mono.querySelector('.ds-item__output');
      expect(el.classList.contains('ds-item__output--mono')).to.be.true;
      expect(getComputedStyle(el).fontFamily.toLowerCase(), 'a monospace stack').to.match(/mono|menlo|consolas|courier/);
    });

    it('renders output as TEXT — program output is untrusted', async () => {
      const el = await mk([{ text: 'T', output: '<script>alert(1)</script>' }]);
      const out = el.querySelector('.ds-item__output');
      expect(out.querySelector('script')).to.not.exist;
      expect(out.textContent).to.equal('<script>alert(1)</script>');
    });

    it('sits between the description and the meta strip', async () => {
      const el = await mk([{ text: 'T', description: 'D', output: 'O', meta: 'M' }]);
      const order = [...el.querySelector('.ds-item__body').children].map((c) => c.className.split(' ')[0]);
      expect(order).to.eql(['ds-item__text', 'ds-item__description', 'ds-item__output', 'ds-item__meta']);
    });
  });

  it('reflects rtl on the root', async () => {
    const el = await mk(ACTIVITY, 'rtl');
    expect(el.querySelector('.ds-item-list').getAttribute('dir')).to.equal('rtl');
  });

  it('repaints chrome without rebuilding rows', async () => {
    /* An attribute change must not drop a slotted trailing control. */
    const el = await fixture(html`
      <ds-item-list>
        <ds-item text="Row"><a slot="trailing" href="#">Go</a></ds-item>
      </ds-item-list>`);
    await nextFrame();
    const before = el.querySelector('.ds-item__trailing a');
    el.setAttribute('size', 'small');
    await nextFrame();
    expect(el.querySelector('.ds-item__trailing a'), 'same node, not re-parsed').to.equal(before);
  });

  it('marks disabled rows', async () => {
    const el = await mk([{ text: 'Retired device', disabled: true }]);
    expect(rows(el)[0].getAttribute('aria-disabled')).to.equal('true');
  });

  it('is accessible', async () => {
    const el = await mk(ACTIVITY);
    await expect(el).to.be.accessible(A11Y);
    expect(el.querySelector('.ds-item-list').getAttribute('role')).to.equal('list');
    expect(rows(el)[0].getAttribute('role')).to.equal('listitem');
  });

  it('adds no net global listeners', async () => {
    const t = trackListeners();
    try {
      const el = await mk(ACTIVITY);
      el.remove();
    } finally {
      t.restore();
    }
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
  });
});
