/* ds-section-header — a compact heading that labels a section. Covers structure,
   the `title`-attribute caching quirk (title is a global HTML attr → cached +
   stripped to avoid a native tooltip), size→heading-level mapping, the style
   variants (default / with-description / with-border), dividers, the opt-in
   action link, escaping, a11y, and teardown. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/section-header/section-header.js';

const root = (el) => el.querySelector('.ds-section-header');
const titleEl = (el) => el.querySelector('.ds-section-header__title');
const descEl = (el) => el.querySelector('.ds-section-header__description');

describe('ds-section-header — structure & defaults', () => {
  it('renders a content group with a title inside a wrapper root', async () => {
    const el = await fixture(html`<ds-section-header title="Devices"></ds-section-header>`);
    expect(root(el)).to.exist;
    expect(el.querySelector('.ds-section-header__content')).to.exist;
    expect(titleEl(el).textContent).to.equal('Devices');
  });

  it('falls back to the placeholder title when none is given', async () => {
    const el = await fixture(html`<ds-section-header></ds-section-header>`);
    expect(titleEl(el).textContent).to.equal('Section Title');
  });

  it('strips the global `title` attribute (no native hover tooltip)', async () => {
    const el = await fixture(html`<ds-section-header title="Devices"></ds-section-header>`);
    expect(el.hasAttribute('title'), 'title attr must be cached + removed').to.be.false;
    expect(titleEl(el).textContent).to.equal('Devices');
  });

  it('defaults to the medium size class', async () => {
    const el = await fixture(html`<ds-section-header title="X"></ds-section-header>`);
    expect(root(el).classList.contains('ds-section-header--medium')).to.be.true;
  });

  it('does not render a description in the default style', async () => {
    const el = await fixture(html`<ds-section-header title="X" description="Hi"></ds-section-header>`);
    expect(descEl(el)).to.not.exist;
  });

  it('does not render an action link by default', async () => {
    const el = await fixture(html`<ds-section-header title="X" action-label="Edit"></ds-section-header>`);
    expect(el.querySelector('.ds-section-header__action')).to.not.exist;
  });
});

describe('ds-section-header — heading level', () => {
  it('maps size → heading tag (large h2, medium h3, small h4)', async () => {
    for (const [size, tag] of [['large', 'H2'], ['medium', 'H3'], ['small', 'H4']]) {
      const el = await fixture(html`<ds-section-header title="T" size="${size}"></ds-section-header>`);
      expect(titleEl(el).tagName, `${size} → ${tag}`).to.equal(tag);
    }
  });

  it('an explicit heading-level overrides the size-derived tag', async () => {
    const el = await fixture(html`<ds-section-header title="T" size="small" heading-level="1"></ds-section-header>`);
    expect(titleEl(el).tagName).to.equal('H1');
  });

  it('ignores an out-of-range heading-level and derives from size', async () => {
    const el = await fixture(html`<ds-section-header title="T" size="large" heading-level="9"></ds-section-header>`);
    expect(titleEl(el).tagName).to.equal('H2');
  });
});

describe('ds-section-header — style variants', () => {
  it('with-description renders the description in the text group', async () => {
    const el = await fixture(html`<ds-section-header title="T" style-variant="with-description" description="More info"></ds-section-header>`);
    expect(descEl(el)).to.exist;
    expect(descEl(el).textContent).to.equal('More info');
    /* stacked inside the title group, not on a separate row */
    expect(el.querySelector('.ds-section-header__group .ds-section-header__description')).to.exist;
  });

  it('with-border adds the border class, a trailing rule, and a full-width description row', async () => {
    const el = await fixture(html`<ds-section-header title="T" style-variant="with-border" description="Row"></ds-section-header>`);
    expect(root(el).classList.contains('ds-section-header--with-border')).to.be.true;
    expect(el.querySelector('.ds-section-header__rule')).to.exist;
    expect(descEl(el)).to.exist;
    /* the description sits OUTSIDE the title group (2nd row) for with-border */
    expect(el.querySelector('.ds-section-header__group .ds-section-header__description')).to.not.exist;
  });

  it('maps divider="bottom" and divider="both" to the right classes', async () => {
    const bottom = await fixture(html`<ds-section-header title="T" divider="bottom"></ds-section-header>`);
    expect(root(bottom).classList.contains('ds-section-header--divider-bottom')).to.be.true;
    const both = await fixture(html`<ds-section-header title="T" divider="both"></ds-section-header>`);
    expect(root(both).classList.contains('ds-section-header--divider-both')).to.be.true;
  });
});

describe('ds-section-header — action', () => {
  it('show-action + action-label renders a ds-text-link', async () => {
    const el = await fixture(html`<ds-section-header title="T" show-action action-label="Manage"></ds-section-header>`);
    const action = el.querySelector('.ds-section-header__action');
    expect(action).to.exist;
    const link = action.querySelector('ds-text-link');
    expect(link).to.exist;
    expect(link.textContent.trim()).to.equal('Manage');
  });

  it('re-homes a slotted [slot="action"] element into the action region', async () => {
    const el = await fixture(html`
      <ds-section-header title="T" show-action>
        <button slot="action" id="custom-act">Go</button>
      </ds-section-header>`);
    await nextFrame();
    const slotted = el.querySelector('.ds-section-header__action #custom-act');
    expect(slotted).to.exist;
  });

  it('show-action="false" suppresses the link', async () => {
    const el = await fixture(html`<ds-section-header title="T" show-action="false" action-label="Manage"></ds-section-header>`);
    expect(el.querySelector('.ds-section-header__action')).to.not.exist;
  });

  it('warns, rather than silently dropping, a slotted action with no show-action', async () => {
    /* The host's children are emptied during render, so without show-action there
       is no action region for the captured node to return to and the element leaves
       the DOM. A page doing getElementById on it then gets null — which is exactly
       how this was found. The opt-in stays required; it just says so now. */
    const seen = [];
    const orig = console.warn;
    console.warn = (...a) => { seen.push(String(a[0])); };
    try {
      const el = await fixture(html`
        <ds-section-header title="T">
          <button slot="action" id="dropped-act">Go</button>
        </ds-section-header>`);
      await nextFrame();
      expect(el.querySelector('#dropped-act'), 'still dropped — documented behaviour').to.not.exist;
      expect(seen.some((m) => /slot="action".*show-action/.test(m)), 'but warned about it').to.be.true;
    } finally {
      console.warn = orig;
    }
  });

  it('stays silent when the slotted action is opted in', async () => {
    const seen = [];
    const orig = console.warn;
    console.warn = (...a) => { seen.push(String(a[0])); };
    try {
      const el = await fixture(html`
        <ds-section-header title="T" show-action>
          <button slot="action" id="kept-act">Go</button>
        </ds-section-header>`);
      await nextFrame();
      expect(el.querySelector('.ds-section-header__action #kept-act')).to.exist;
      expect(seen.filter((m) => /show-action/.test(m)), 'no warning').to.have.lengthOf(0);
    } finally {
      console.warn = orig;
    }
  });
});

describe('ds-section-header — reactivity', () => {
  it('updates the title when the attribute changes after mount', async () => {
    const el = await fixture(html`<ds-section-header title="First"></ds-section-header>`);
    el.setAttribute('title', 'Second');
    await nextFrame();
    expect(titleEl(el).textContent).to.equal('Second');
    expect(el.hasAttribute('title')).to.be.false;
  });

  it('toggling style-variant to with-description reveals the description', async () => {
    const el = await fixture(html`<ds-section-header title="T" description="D"></ds-section-header>`);
    expect(descEl(el)).to.not.exist;
    el.setAttribute('style-variant', 'with-description');
    await nextFrame();
    expect(descEl(el)).to.exist;
  });

  it('mirrors rtl onto the root as dir="rtl" and clears it', async () => {
    const el = await fixture(html`<ds-section-header title="T" rtl></ds-section-header>`);
    expect(root(el).getAttribute('dir')).to.equal('rtl');
    el.removeAttribute('rtl');
    await nextFrame();
    expect(root(el).hasAttribute('dir')).to.be.false;
  });
});

describe('ds-section-header — repaint-split', () => {
  it('keeps the action ds-text-link node across a visual-only divider change', async () => {
    const el = await fixture(html`<ds-section-header title="Devices" show-action action-label="View all"></ds-section-header>`);
    await nextFrame();
    const link = el.querySelector('.ds-section-header__action ds-text-link');
    expect(link, 'action link rendered').to.exist;
    el.setAttribute('divider', 'bottom');
    await nextFrame();
    expect(el.querySelector('.ds-section-header__action ds-text-link'), 'same link node (not re-parsed)').to.equal(link);
    expect(root(el).classList.contains('ds-section-header--divider-bottom'), 'divider class applied').to.be.true;
  });
});

describe('ds-section-header — escaping', () => {
  it('renders a hostile title as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-section-header></ds-section-header>`);
    el.setAttribute('title', '<img src=x onerror=alert(1)>');
    await nextFrame();
    expect(titleEl(el).querySelector('img')).to.not.exist;
    expect(titleEl(el).textContent).to.contain('<img');
  });

  it('renders a hostile description as literal text', async () => {
    const el = await fixture(html`<ds-section-header title="T" style-variant="with-description"
      description="<img src=x onerror=alert(1)>"></ds-section-header>`);
    expect(descEl(el).querySelector('img')).to.not.exist;
    expect(descEl(el).textContent).to.contain('<img');
  });
});

describe('ds-section-header — a11y', () => {
  it('is accessible with description + action', async () => {
    const el = await fixture(html`<ds-section-header title="Managed devices"
      style-variant="with-description" description="Endpoints enrolled in this policy."
      show-action action-label="View all"></ds-section-header>`);
    await nextFrame();
    await expect(el).to.be.accessible({ ignoredRules: ['color-contrast'] });
  });
});

describe('ds-section-header — teardown', () => {
  it('disconnects without throwing', async () => {
    const el = await fixture(html`<ds-section-header title="T"></ds-section-header>`);
    expect(() => el.remove()).to.not.throw();
  });

  it('survives disconnect → reconnect with a single root + title', async () => {
    const el = await fixture(html`<ds-section-header title="Reattach"></ds-section-header>`);
    const parent = el.parentNode;
    el.remove();
    parent.appendChild(el);
    await nextFrame();
    expect(el.querySelectorAll('.ds-section-header__title').length).to.equal(1);
    expect(titleEl(el).textContent).to.equal('Reattach');
  });
});
