import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | nav', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    document.documentElement.classList.remove('nav-left');
  });

  test('setMode toggles html.nav-left and tracks the mode', function (assert) {
    const nav = this.owner.lookup('service:nav');

    nav.setMode('left');
    assert.strictEqual(nav.mode, 'left');
    assert.true(document.documentElement.classList.contains('nav-left'), 'left mode adds nav-left');

    nav.setMode('top');
    assert.strictEqual(nav.mode, 'top');
    assert.false(document.documentElement.classList.contains('nav-left'), 'top mode removes nav-left');

    nav.setMode('garbage');
    assert.strictEqual(nav.mode, 'top', 'unknown mode falls back to top');
  });

  test('setRailIcons tracks the icons-only preference', function (assert) {
    const nav = this.owner.lookup('service:nav');
    nav.setRailIcons(true);
    assert.true(nav.railIcons);
    nav.setRailIcons(false);
    assert.false(nav.railIcons);
  });
});
