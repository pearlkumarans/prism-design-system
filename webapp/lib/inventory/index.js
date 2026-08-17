'use strict';

/**
 * inventory — in-repo Ember addon (v1) packaging the Inventory module as a
 * self-contained slice: its view components live under addon/, and app/ re-exports
 * them into the host app namespace so the shell's resolver finds them unchanged
 * (views/<slug>). This is the reference for the per-module architecture — every
 * standalone-product module becomes one of these folders under lib/.
 *
 * Registered via the host app's package.json → ember-addon.paths. isDevelopingAddon
 * keeps its trees rebuilding on change during `ember serve`.
 */
module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },
};
