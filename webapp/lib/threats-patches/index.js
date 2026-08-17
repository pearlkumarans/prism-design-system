'use strict';

/**
 * threats-patches — in-repo Ember addon (v1) packaging the Threats & Patches module
 * as a self-contained slice, following the inventory reference: view components live
 * under addon/, and app/ re-exports them into the host app namespace so the shell's
 * resolver finds them unchanged (views/<slug>).
 *
 * Registered via the host app's package.json → ember-addon.paths.
 */
module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },
};
