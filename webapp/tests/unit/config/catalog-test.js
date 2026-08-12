import { module, test } from 'qunit';
import {
  PRODUCTS,
  CONTENT_VIEWS,
  TAB_DEFAULT_VIEW,
  isValidProduct,
  tabAllowedForProduct,
  tabsForProduct,
  landingForProduct,
} from 'prism-webapp/config/catalog';

/**
 * Characterizes the SSOT-derived routing tables + helpers. If a future refactor
 * (or a bad sync from Layout/shell-catalog.js) changes product scope, view→tab
 * mapping, or landing resolution, these fail loudly.
 */
module('Unit | config | catalog (single source of truth)', function () {
  test('shared tables are present and correctly shaped', function (assert) {
    assert.strictEqual(PRODUCTS.ec.tabs, null, 'ec spans all tabs (null)');
    assert.true(PRODUCTS.pmp.tabs.includes('tp'), 'pmp is scoped and includes tp');
    assert.strictEqual(CONTENT_VIEWS['bitlocker-dashboard'].tab, 'bitlocker', 'view maps to its owning tab');
    assert.strictEqual(
      CONTENT_VIEWS['bitlocker-device-detail'].nav,
      'bitlocker-managed-systems',
      'drill-down parent (nav) is preserved',
    );
    assert.strictEqual(TAB_DEFAULT_VIEW.bitlocker, 'bitlocker-dashboard', 'bitlocker lands on its dashboard');
  });

  test('isValidProduct', function (assert) {
    assert.true(isValidProduct('ec'));
    assert.true(isValidProduct('pmp'));
    assert.false(isValidProduct('nope'));
  });

  test('tabAllowedForProduct honors product scope', function (assert) {
    assert.true(tabAllowedForProduct('ec', 'bitlocker'), 'ec (null) allows any tab');
    assert.true(tabAllowedForProduct('pmp', 'tp'), 'pmp allows tp');
    assert.false(tabAllowedForProduct('pmp', 'bitlocker'), 'pmp does not offer bitlocker');
    assert.false(tabAllowedForProduct('nope', 'tp'), 'unknown product allows nothing');
  });

  test('tabsForProduct returns id + label objects', function (assert) {
    const pmp = tabsForProduct('pmp');
    assert.strictEqual(pmp.length, 6, 'pmp has 6 header tabs');
    assert.deepEqual(pmp[0], { id: 'home', label: 'Home' }, 'first tab labelled');
    assert.true(tabsForProduct('ec').length > 6, 'ec (null) lists every labelled tab');
  });

  test('landingForProduct resolves the entry view', function (assert) {
    assert.deepEqual(landingForProduct('ec'), { tab: 'home', view: 'module-dashboard' }, 'ec → home dashboard');
    assert.deepEqual(
      landingForProduct('pmp'),
      { tab: 'tp', view: 'threats-patches-highly-vulnerable-systems' },
      'pmp → its declared defaultView (owning tab derived from the view)',
    );
  });
});
