/* ds-checkbox-group — wraps slotted <ds-checkbox> children, cascades size/state,
   applies a controlled `value`, exposes a `values` array, and bubbles a single
   group-change event. NOTE: checkbox-group.js does not register ds-checkbox, so
   the child component is imported explicitly here. */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../src/components/checkbox/checkbox.js';
import '../src/components/checkbox-group/checkbox-group.js';

const group = () => html`
  <ds-checkbox-group label="Notify me about">
    <ds-checkbox value="comments" label="Comments"></ds-checkbox>
    <ds-checkbox value="mentions" label="Mentions"></ds-checkbox>
    <ds-checkbox value="reminders" label="Reminders"></ds-checkbox>
  </ds-checkbox-group>`;

describe('ds-checkbox-group — structure', () => {
  it('renders the group label and an items group container', async () => {
    const el = await fixture(group());
    await nextFrame();
    expect(el.querySelector('.ds-checkbox-group__label').textContent).to.equal('Notify me about');
    expect(el.querySelector('.ds-checkbox-group__items[role="group"]')).to.exist;
  });

  it('keeps one child ds-checkbox per slotted option', async () => {
    const el = await fixture(group());
    await nextFrame();
    expect(el.querySelectorAll('ds-checkbox').length).to.equal(3);
  });
});

describe('ds-checkbox-group — cascade', () => {
  it('cascades the default size (small) onto children', async () => {
    const el = await fixture(group());
    await nextFrame();
    el.querySelectorAll('ds-checkbox').forEach((cb) => {
      expect(cb.getAttribute('size')).to.equal('small');
    });
  });

  it('cascades an updated size onto children', async () => {
    const el = await fixture(group());
    el.setAttribute('size', 'medium');
    await nextFrame();
    el.querySelectorAll('ds-checkbox').forEach((cb) => {
      expect(cb.getAttribute('size')).to.equal('medium');
    });
  });

  it('cascades state="disabled" onto children', async () => {
    const el = await fixture(group());
    el.setAttribute('state', 'disabled');
    await nextFrame();
    el.querySelectorAll('ds-checkbox').forEach((cb) => {
      expect(cb.hasAttribute('disabled')).to.be.true;
    });
  });
});

describe('ds-checkbox-group — controlled value & values', () => {
  it('checks the children named by a comma-separated value', async () => {
    const el = await fixture(group());
    el.setAttribute('value', 'comments,reminders');
    await nextFrame();
    expect(el.querySelector('ds-checkbox[value="comments"]').hasAttribute('checked')).to.be.true;
    expect(el.querySelector('ds-checkbox[value="mentions"]').hasAttribute('checked')).to.be.false;
    expect(el.querySelector('ds-checkbox[value="reminders"]').hasAttribute('checked')).to.be.true;
  });

  it('the values getter returns the checked values as an array', async () => {
    const el = await fixture(group());
    el.setAttribute('value', 'mentions');
    await nextFrame();
    expect(el.values).to.deep.equal(['mentions']);
  });

  it('the values setter round-trips through the value attribute', async () => {
    const el = await fixture(group());
    el.values = ['comments', 'mentions'];
    await nextFrame();
    expect(el.getAttribute('value')).to.equal('comments,mentions');
    expect(el.values).to.deep.equal(['comments', 'mentions']);
  });
});

describe('ds-checkbox-group — events', () => {
  it('emits ds-checkbox-group-change when a child toggles', async () => {
    const el = await fixture(group());
    await nextFrame();
    const cb = el.querySelector('ds-checkbox[value="comments"]');
    setTimeout(() => cb.click());
    const ev = await oneEvent(el, 'ds-checkbox-group-change');
    expect(ev.detail.values).to.include('comments');
  });
});

describe('ds-checkbox-group — escaping & teardown', () => {
  it('renders a hostile label as literal text (no injected <img>)', async () => {
    const el = await fixture(html`<ds-checkbox-group label='"><img src=x onerror=alert(1)>'></ds-checkbox-group>`);
    await nextFrame();
    const labelEl = el.querySelector('.ds-checkbox-group__label');
    expect(labelEl.querySelector('img')).to.not.exist;
    expect(labelEl.textContent).to.contain('<img');
  });

  it('disconnects without throwing', async () => {
    const el = await fixture(group());
    await nextFrame();
    expect(() => el.remove()).to.not.throw();
  });
});
