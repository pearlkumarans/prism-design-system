/* ds-criteria-filter — the rule-tree model: setQuery/getQuery round-trip,
   add/remove rules, and clear. (The max-rules cap is UI-enforced — the add
   control disables — so it's covered by interaction tests, not the model.) */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/criteria-filter/criteria-filter.js';

const FIELDS = [
  { name: 'os', label: 'OS', type: 'select', options: [{ label: 'Windows', value: 'win' }, { label: 'macOS', value: 'mac' }] },
  { name: 'host', label: 'Host name', type: 'text' },
];

async function mk() {
  const el = await fixture(html`<ds-criteria-filter></ds-criteria-filter>`);
  el.fields = FIELDS;
  await nextFrame();
  return el;
}

describe('ds-criteria-filter — rule tree', () => {
  it('round-trips a query through setQuery / getQuery', async () => {
    const el = await mk();
    el.query = { combinator: 'and', rules: [{ field: 'os', operator: 'is', value: 'win' }] };
    await nextFrame();

    const rules = el._allRules();
    expect(rules.length).to.equal(1);
    expect(rules[0].field).to.equal('os');
    expect(rules[0].value).to.equal('win');
    expect(el.getQuery().combinator).to.equal('and');
  });

  it('addRule grows the tree; removeRule shrinks it', async () => {
    const el = await mk();
    el.query = { combinator: 'and', rules: [{ field: 'os', operator: 'is', value: 'win' }] };
    await nextFrame();

    const start = el._allRules().length;
    el.addRule();
    await nextFrame();
    expect(el._allRules().length).to.equal(start + 1);

    const last = el._allRules()[el._allRules().length - 1];
    el.removeRule(last.id);
    await nextFrame();
    expect(el._allRules().length).to.equal(start);
  });

  it('clear resets to a single blank rule', async () => {
    const el = await mk();
    el.query = { combinator: 'and', rules: [
      { field: 'os', operator: 'is', value: 'win' },
      { field: 'host', operator: 'contains', value: 'srv' },
    ] };
    await nextFrame();
    expect(el._allRules().length).to.equal(2);

    el.clear();
    await nextFrame();
    const rules = el._allRules();
    expect(rules.length).to.equal(1);
    expect(rules[0].value ?? '').to.equal('');
  });
});
