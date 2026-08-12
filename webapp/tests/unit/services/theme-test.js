import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | theme', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    document.documentElement.removeAttribute('data-theme');
  });

  test('applyTheme sets data-theme and PRESERVES the green family', function (assert) {
    const theme = this.owner.lookup('service:theme');

    theme.applyTheme('dark');
    assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(theme.family, 'blue', 'non-green is the blue family');

    // Regression guard: the earlier bug stripped "green-" and set data-theme="light".
    theme.applyTheme('green-light');
    assert.strictEqual(
      document.documentElement.getAttribute('data-theme'),
      'green-light',
      'green family is NOT stripped',
    );
    assert.strictEqual(theme.family, 'green');

    theme.applyTheme('light');
    assert.strictEqual(theme.family, 'blue');
  });

  test('system / green-system resolve to a concrete light|dark value', function (assert) {
    const theme = this.owner.lookup('service:theme');
    theme.applyTheme('system');
    assert.true(['light', 'dark'].includes(document.documentElement.getAttribute('data-theme')));
    theme.applyTheme('green-system');
    assert.true(['green-light', 'green-dark'].includes(document.documentElement.getAttribute('data-theme')));
  });
});
