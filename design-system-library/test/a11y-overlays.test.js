/* Accessibility gate for PORTALED / OPEN-STATE overlays (axe-core via @open-wc).
   These render their panel only when open (and may reparent to <body>). Each is
   opened, then axe runs on the host — whose dialog/surface/menu is a descendant,
   so axe reaches it even after a reparent. Tooltip is the exception: its tip is a
   standalone <body> node, so axe runs on that node directly.
   color-contrast is ignored (the harness loads no component CSS). */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/modal/modal.js';
import '../src/components/confirmation-modal/confirmation-modal.js';
import '../src/components/fullscreen-modal/fullscreen-modal.js';
import '../src/components/drawer/drawer.js';
import '../src/components/popover/popover.js';
import '../src/components/tooltip/tooltip.js';
import '../src/components/dropdown-menu/dropdown-menu.js';
import '../src/components/split-button/split-button.js';
import '../src/components/toast/toast.js';

const A11Y = { ignoredRules: ['color-contrast'] };
const settle = async () => { await nextFrame(); await nextFrame(); };
/* These modals reparent the HOST to <body> on open — if `open` is in the fixture
   template the wrapper is empty and fixture() returns null. So open AFTER mount. */
const openAfter = async (el) => { el.setAttribute('open', ''); await settle(); };

describe('a11y overlays — modal family (open state)', () => {
  it('ds-modal', async () => {
    const el = await fixture(html`<ds-modal title="Delete item" description="This cannot be undone.">
      <p>Body content of the dialog.</p>
    </ds-modal>`);
    await openAfter(el);
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-confirmation-modal', async () => {
    const el = await fixture(html`<ds-confirmation-modal title="Discard changes?"
      description="Your edits will be lost."
      primary-label="Discard" secondary-label="Keep editing" tertiary-label="Learn more"></ds-confirmation-modal>`);
    await openAfter(el);
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-fullscreen-modal', async () => {
    const el = await fixture(html`<ds-fullscreen-modal title="Edit record"
      primary-label="Save" secondary-label="Cancel" tertiary-label="Back">
      <p>Fullscreen body.</p>
    </ds-fullscreen-modal>`);
    await openAfter(el);
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-drawer', async () => {
    const el = await fixture(html`<ds-drawer title="Filters" subtitle="Refine results">
      <p>Drawer body.</p>
    </ds-drawer>`);
    await openAfter(el);
    await expect(el).to.be.accessible(A11Y);
  });
});

describe('a11y overlays — anchored panels & menus (open state)', () => {
  it('ds-popover', async () => {
    const el = await fixture(html`<ds-popover open title="More info">
      <button slot="trigger" type="button">Open</button>
      <p>Popover body content.</p>
    </ds-popover>`);
    await settle();
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-dropdown-menu (open, with items)', async () => {
    const el = await fixture(html`<ds-dropdown-menu open aria-label="Actions"></ds-dropdown-menu>`);
    el.items = [
      { label: 'Edit', value: 'edit' },
      { label: 'Duplicate', value: 'dup' },
      { label: 'Delete', value: 'del' },
    ];
    await settle();
    await expect(el).to.be.accessible(A11Y);
  });

  it('ds-split-button (menu opened)', async () => {
    const el = await fixture(html`<ds-split-button label="Save"></ds-split-button>`);
    el.menuItems = [{ label: 'Save as…', value: 'as' }, { label: 'Save all', value: 'all' }];
    await settle();
    // open the caret menu (it's a descendant ds-dropdown-menu)
    const chevron = el.querySelector('[class*="chevron"], [aria-haspopup], .ds-split-button__caret, .ds-split-button__chevron');
    if (chevron) { chevron.click(); await settle(); }
    await expect(el).to.be.accessible(A11Y);
  });
});

describe('a11y overlays — transient (tooltip / toast)', () => {
  it('ds-tooltip (shown — tip lives in <body>)', async () => {
    const el = await fixture(html`<ds-tooltip text="Delete this permanently"><button type="button">Info</button></ds-tooltip>`);
    await settle();
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await settle();
    const tip = el._tip || document.getElementById('ds-tooltip-tip');
    expect(tip, 'tooltip tip element').to.exist;
    await expect(tip).to.be.accessible(A11Y);
  });

  it('ds-toast (single notification)', async () => {
    const el = await fixture(html`<ds-toast status="success" title="Saved" description="Your changes are live."></ds-toast>`);
    await settle();
    await expect(el).to.be.accessible(A11Y);
  });
});
