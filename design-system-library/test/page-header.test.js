/* ds-page-header — page title block (breadcrumbs + title + actions + tabs).
   Covers structure/title default, the native `title` attr capture+strip, the
   opt-in toggles (back / star), breadcrumb rendering via the composed
   <ds-breadcrumb> + href/label escaping, slotted actions, RTL, a11y, and
   teardown (window resize listener released — no leak). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/page-header/page-header.js';
import { trackListeners } from './helpers/listeners.js';

const XSS = '<img src=x onerror=alert(1)>';
const titleEl = (el) => el.querySelector('.ds-page-header__title');

describe('ds-page-header — structure & title', () => {
  it('renders an inner <header> with the component class and the title', async () => {
    const el = await fixture(html`<ds-page-header title="Devices"></ds-page-header>`);
    const header = el.querySelector('header.ds-page-header');
    expect(header).to.exist;
    expect(titleEl(el).textContent).to.equal('Devices');
  });

  it('captures + strips the native `title` attribute (no browser tooltip)', async () => {
    const el = await fixture(html`<ds-page-header title="Devices"></ds-page-header>`);
    expect(el.hasAttribute('title')).to.be.false;
    expect(titleEl(el).textContent).to.equal('Devices');
  });

  it('defaults the heading when no title is set', async () => {
    const el = await fixture(html`<ds-page-header></ds-page-header>`);
    expect(titleEl(el).textContent).to.equal('Page Title');
  });

  it('updates the title reactively', async () => {
    const el = await fixture(html`<ds-page-header title="Old"></ds-page-header>`);
    el.setAttribute('title', 'New');
    await nextFrame();
    expect(titleEl(el).textContent).to.equal('New');
  });
});

describe('ds-page-header — opt-in toggles', () => {
  it('renders the back button only when show-back is set', async () => {
    const off = await fixture(html`<ds-page-header title="T"></ds-page-header>`);
    expect(off.querySelector('[data-back]')).to.not.exist;
    const on = await fixture(html`<ds-page-header title="T" show-back></ds-page-header>`);
    expect(on.querySelector('[data-back]')).to.exist;
  });

  it('renders the star toggle only when show-star is set, and toggles aria-pressed', async () => {
    const on = await fixture(html`<ds-page-header title="T" show-star></ds-page-header>`);
    const star = on.querySelector('[data-star]');
    expect(star).to.exist;
    expect(star.getAttribute('aria-pressed')).to.equal('false');
    star.click();
    expect(star.getAttribute('aria-pressed')).to.equal('true');
  });

  it('treats show-star="false" as OFF (presence-with-false gotcha)', async () => {
    const el = await fixture(html`<ds-page-header title="T" show-star="false"></ds-page-header>`);
    expect(el.querySelector('[data-star]')).to.not.exist;
  });
});

describe('ds-page-header — breadcrumbs (composed ds-breadcrumb)', () => {
  it('renders breadcrumb links from the breadcrumbs property (last is current)', async () => {
    const el = await fixture(html`<ds-page-header title="Detail"></ds-page-header>`);
    el.breadcrumbs = [
      { label: 'Home', href: '/home' },
      { label: 'Devices', href: '/devices' },
      { label: 'Detail' },
    ];
    await nextFrame();
    const bc = el.querySelector('.ds-page-header__breadcrumbs');
    expect(bc, 'breadcrumb component rendered').to.exist;
    const links = bc.querySelectorAll('a[href]');
    expect(links.length, 'two non-current crumbs are links').to.equal(2);
    expect(links[0].getAttribute('href')).to.equal('/home');
  });

  it('renders no breadcrumbs when the list is empty', async () => {
    const el = await fixture(html`<ds-page-header title="T"></ds-page-header>`);
    expect(el.querySelector('.ds-page-header__breadcrumbs')).to.not.exist;
  });

  it('escapes a hostile breadcrumb href — no attribute break-out, no injected node', async () => {
    const el = await fixture(html`<ds-page-header title="T"></ds-page-header>`);
    const hostileHref = '"><img src=x onerror=alert(1)>';
    el.breadcrumbs = [{ label: 'Home', href: hostileHref }, { label: 'Now' }];
    await nextFrame();
    const bc = el.querySelector('.ds-page-header__breadcrumbs');
    expect(bc.querySelector('img'), 'href must not inject an <img>').to.not.exist;
    const link = bc.querySelector('a[href]');
    expect(link.getAttribute('href'), 'href preserved as a literal string').to.equal(hostileHref);
  });

  it('escapes a hostile breadcrumb label as literal text', async () => {
    const el = await fixture(html`<ds-page-header title="T"></ds-page-header>`);
    el.breadcrumbs = [{ label: XSS, href: '/x' }, { label: 'Now' }];
    await nextFrame();
    const bc = el.querySelector('.ds-page-header__breadcrumbs');
    expect(bc.querySelector('img')).to.not.exist;
    expect(bc.textContent).to.contain('<img');
  });
});

describe('ds-page-header — actions & RTL', () => {
  it('re-homes slot="actions" content into the actions region', async () => {
    const el = await fixture(html`<ds-page-header title="T">
      <ds-button slot="actions" variant="primary">Add</ds-button>
    </ds-page-header>`);
    expect(el.querySelector('.ds-page-header__action-slot ds-button')).to.exist;
  });

  it('escapes a hostile leading icon name', async () => {
    const el = await fixture(html`<ds-page-header title="T" icon='x" onload="alert(1)'></ds-page-header>`);
    const iconWrap = el.querySelector('.ds-page-header__icon');
    expect(iconWrap).to.exist;
    expect(iconWrap.querySelector('ds-icon').hasAttribute('onload'), 'no injected onload').to.be.false;
  });

  it('mirrors via dir="rtl" on the inner header', async () => {
    const el = await fixture(html`<ds-page-header title="T" rtl></ds-page-header>`);
    expect(el.querySelector('header').getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-page-header — a11y', () => {
  it('is accessible with breadcrumbs, title and actions', async () => {
    const el = await fixture(html`<ds-page-header title="Device detail">
      <ds-button slot="actions" variant="primary">Add</ds-button>
    </ds-page-header>`);
    el.breadcrumbs = [{ label: 'Home', href: '/home' }, { label: 'Device detail' }];
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-page-header — teardown', () => {
  it('connect → disconnect releases the window resize listener (no leak)', async () => {
    const t = trackListeners();
    const el = await fixture(html`<ds-page-header title="Devices"></ds-page-header>`);
    el.remove();
    t.restore();
    expect(t.net(), JSON.stringify(t.byType())).to.equal(0);
    expect(el.isConnected).to.be.false;
  });

  it('survives disconnect → reconnect without duplicating the header', async () => {
    const el = await fixture(html`<ds-page-header title="Devices"></ds-page-header>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('header.ds-page-header').length).to.equal(1);
    expect(titleEl(el).textContent).to.equal('Devices');
  });
});
