/* ds-dropdown-menu — injection safety. Menu labels are frequently data-derived
   (customer names, saved filters, dynamic options), so they must render as text,
   never as HTML. */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/dropdown-menu/dropdown-menu.js';

describe('ds-dropdown-menu — injection safety', () => {
  it('escapes data-derived item labels — no HTML is injected', async () => {
    const el = await fixture(html`<ds-dropdown-menu open></ds-dropdown-menu>`);
    el.items = [
      { label: '<img src=x onerror=alert(1)>', value: '1' },
      { label: 'A & B <b>bold</b>', value: '2' },
    ];
    await nextFrame();

    const labels = [...el.querySelectorAll('.ds-dropdown-menu__item-label')];
    expect(labels.length, 'items did not render').to.equal(2);
    // No element was parsed out of the label string.
    expect(el.querySelector('.ds-dropdown-menu__item-label img'), 'label injected an <img>').to.not.exist;
    expect(el.querySelector('.ds-dropdown-menu__item-label b'), 'label injected a <b>').to.not.exist;
    // The literal text is preserved.
    expect(labels[0].textContent).to.contain('<img');
    expect(labels[1].textContent).to.contain('<b>bold</b>');
  });

  it('escapes description and badge text', async () => {
    const el = await fixture(html`<ds-dropdown-menu open></ds-dropdown-menu>`);
    el.items = [{ label: 'Item', value: '1', description: '<i>d</i>', badge: '<u>b</u>' }];
    await nextFrame();
    expect(el.querySelector('.ds-dropdown-menu__item-description i')).to.not.exist;
    expect(el.querySelector('.ds-dropdown-menu__item-badge u')).to.not.exist;
  });
});
