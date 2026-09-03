/* ds-empty-state — a four-layout placeholder surface (centered / steps /
   option-cards / promo) rendered into an internal root div. Covers structure,
   spec defaults (centered / md), the layout variants, title/description,
   illustration, actions + their events, the steps/options/benefits collections,
   escaping, reactivity, a11y, and teardown. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/empty-state/empty-state.js';

const XSS = '<img src=x onerror=alert(1)>';
const root = (el) => el.querySelector('.ds-empty-state');
const titleEl = (el) => el.querySelector('.ds-empty-state__title');
const descEl = (el) => el.querySelector('.ds-empty-state__description');

describe('ds-empty-state — structure & defaults', () => {
  it('renders a region root with the title + description', async () => {
    const el = await fixture(html`
      <ds-empty-state title="No results" description="Try another search."></ds-empty-state>`);
    expect(root(el), 'root missing').to.exist;
    expect(root(el).getAttribute('role')).to.equal('region');
    expect(titleEl(el).textContent).to.equal('No results');
    expect(descEl(el).textContent).to.equal('Try another search.');
  });

  it('applies the spec default classes (centered / md)', async () => {
    const el = await fixture(html`<ds-empty-state title="X"></ds-empty-state>`);
    expect(root(el).classList.contains('ds-empty-state--centered')).to.be.true;
    expect(root(el).classList.contains('ds-empty-state--md')).to.be.true;
  });

  it('labels the region by the title', async () => {
    const el = await fixture(html`<ds-empty-state title="No results"></ds-empty-state>`);
    expect(root(el).getAttribute('aria-labelledby')).to.equal(titleEl(el).id);
    expect(titleEl(el).id).to.not.equal('');
  });

  it('falls back to defaults on invalid enums', async () => {
    const el = await fixture(html`<ds-empty-state type="fancy" size="xl" title="X"></ds-empty-state>`);
    expect(root(el).classList.contains('ds-empty-state--centered')).to.be.true;
    expect(root(el).classList.contains('ds-empty-state--md')).to.be.true;
  });

  it('mirrors rtl onto the root as dir="rtl"', async () => {
    const el = await fixture(html`<ds-empty-state title="X" rtl></ds-empty-state>`);
    expect(root(el).getAttribute('dir')).to.equal('rtl');
  });
});

describe('ds-empty-state — layout variants', () => {
  it('centered renders an illustration when one is named', async () => {
    const el = await fixture(html`
      <ds-empty-state illustration="common-search" title="X"></ds-empty-state>`);
    const ill = el.querySelector('.ds-empty-state__illustration ds-illustration');
    expect(ill).to.exist;
    expect(ill.getAttribute('name')).to.equal('common-search');
  });

  it('steps renders a stepped list', async () => {
    const el = await fixture(html`<ds-empty-state type="steps" title="Setup"></ds-empty-state>`);
    expect(root(el).classList.contains('ds-empty-state--steps')).to.be.true;
    expect(el.querySelector('.ds-empty-state__steps')).to.exist;
    expect(el.querySelectorAll('.ds-empty-state__step').length).to.be.greaterThan(0);
  });

  it('option-cards renders a banner + options from the options property', async () => {
    const el = await fixture(html`<ds-empty-state type="option-cards" banner-text="Pick one" title="X"></ds-empty-state>`);
    el.options = [
      { icon: 'cloud', title: 'Cloud', description: 'Managed', actionLabel: 'Choose' },
      { icon: 'server', title: 'On-prem', description: 'Self-hosted', actionLabel: 'Choose' },
    ];
    await nextFrame();
    expect(el.querySelector('.ds-empty-state__banner')).to.exist;
    expect(el.querySelectorAll('.ds-empty-state__option').length).to.equal(2);
  });

  it('promo renders a benefits list from the benefits property', async () => {
    const el = await fixture(html`<ds-empty-state type="promo" title="Upgrade"></ds-empty-state>`);
    el.benefits = ['Fast', 'Secure', 'Scalable'];
    await nextFrame();
    await nextFrame();
    expect(root(el).classList.contains('ds-empty-state--promo')).to.be.true;
    const benefits = el.querySelector('.ds-empty-state__benefits');
    expect(benefits, 'benefits block missing').to.exist;
    // ds-list rewrites its <ds-list-item> children into <li class="ds-list__item">
    expect(benefits.querySelectorAll('.ds-list__item').length).to.equal(3);
    expect(benefits.textContent).to.contain('Scalable');
  });
});

describe('ds-empty-state — actions', () => {
  it('renders primary + secondary buttons for the supplied labels', async () => {
    const el = await fixture(html`
      <ds-empty-state title="X" primary-label="Clear" secondary-label="Learn more"></ds-empty-state>`);
    expect(el.querySelector('[data-primary]').textContent).to.equal('Clear');
    expect(el.querySelector('[data-secondary]').textContent).to.equal('Learn more');
  });

  it('omits actions when no labels are given', async () => {
    const el = await fixture(html`<ds-empty-state title="X"></ds-empty-state>`);
    expect(el.querySelector('.ds-empty-state__actions')).to.not.exist;
  });

  it('emits ds-empty-state-primary when the primary action is clicked', async () => {
    const el = await fixture(html`<ds-empty-state title="X" primary-label="Clear"></ds-empty-state>`);
    setTimeout(() => el.querySelector('[data-primary]').click());
    const ev = await oneEvent(el, 'ds-empty-state-primary');
    expect(ev).to.exist;
  });

  it('emits ds-empty-state-option with the index when an option action is clicked', async () => {
    const el = await fixture(html`<ds-empty-state type="option-cards" title="X"></ds-empty-state>`);
    el.options = [{ title: 'A', actionLabel: 'Go' }, { title: 'B', actionLabel: 'Go' }];
    await nextFrame();
    const btns = el.querySelectorAll('[data-option]');
    setTimeout(() => btns[1].click());
    const ev = await oneEvent(el, 'ds-empty-state-option');
    expect(ev.detail.index).to.equal(1);
  });
});

describe('ds-empty-state — footer links', () => {
  it('renders useful-link + watch-video text links', async () => {
    const el = await fixture(html`
      <ds-empty-state title="X" useful-link="/docs" watch-video="/video"></ds-empty-state>`);
    const links = el.querySelectorAll('.ds-empty-state__link');
    expect(links.length).to.equal(2);
  });

  it('renders the supported-OS icons', async () => {
    const el = await fixture(html`<ds-empty-state title="X" supported="windows,linux"></ds-empty-state>`);
    expect(el.querySelectorAll('.ds-empty-state__supported-icons ds-icon').length).to.equal(2);
  });
});

describe('ds-empty-state — escaping & reactivity', () => {
  it('escapes a hostile title — no <img> injected', async () => {
    const el = await fixture(html`<ds-empty-state title="${XSS}"></ds-empty-state>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
    expect(titleEl(el).textContent).to.contain('<img');
  });

  it('escapes a hostile description — no <img> injected', async () => {
    const el = await fixture(html`<ds-empty-state title="X" description="${XSS}"></ds-empty-state>`);
    await nextFrame();
    expect(el.querySelector('img')).to.not.exist;
  });

  it('re-renders into the new layout when type changes after mount', async () => {
    const el = await fixture(html`<ds-empty-state title="X"></ds-empty-state>`);
    expect(root(el).classList.contains('ds-empty-state--centered')).to.be.true;
    el.setAttribute('type', 'steps');
    await nextFrame();
    expect(root(el).classList.contains('ds-empty-state--steps')).to.be.true;
    expect(el.querySelector('.ds-empty-state__steps')).to.exist;
  });

  it('updates the title text when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-empty-state title="Old"></ds-empty-state>`);
    el.setAttribute('title', 'New');
    await nextFrame();
    expect(titleEl(el).textContent).to.equal('New');
  });
});

describe('ds-empty-state — a11y & teardown', () => {
  it('is accessible', async () => {
    const el = await fixture(html`
      <ds-empty-state illustration="common-search" title="No results"
        description="Try another search." primary-label="Clear"></ds-empty-state>`);
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });

  it('survives disconnect → reconnect without throwing or duplicating the root', async () => {
    const el = await fixture(html`<ds-empty-state title="No results"></ds-empty-state>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-empty-state').length).to.equal(1);
    expect(titleEl(el).textContent).to.equal('No results');
  });
});
