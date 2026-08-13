import { module, test } from 'qunit';
import { resolveViewUrl } from 'prism-webapp/lib/inject-view';

/**
 * The injectDrawer URL contract: a bare name lives under Layout/views/; a slashed
 * path is relative to Layout/. ContentOutlet + the drawers service both depend on
 * this resolving to the vendored public/ locations.
 */
module('Unit | lib | inject-view', function () {
  test('resolveViewUrl maps bare names and slashed paths correctly', function (assert) {
    assert.strictEqual(
      resolveViewUrl('layout-module-dashboard'),
      '/Layout/views/layout-module-dashboard.html',
      'bare name → Layout/views/',
    );
    assert.strictEqual(
      resolveViewUrl('profile'),
      '/Layout/views/profile.html',
      'bare drawer name → Layout/views/',
    );
    assert.strictEqual(
      resolveViewUrl('../projects/bitlocker/layout-summary-dashboard'),
      '/projects/bitlocker/layout-summary-dashboard.html',
      'slashed path → resolved relative to Layout/',
    );
  });
});
