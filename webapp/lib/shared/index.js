'use strict';

/**
 * shared — in-repo Ember addon (v1) holding the reusable UI layer that sits BELOW
 * the product modules: the Patterns::* page archetypes and the modifiers they use.
 *
 * These are invoked by NAME in templates (<Patterns::ModuleDashboard>,
 * {{config-chart}}), never imported by module path — so they live in the addon's
 * `app/` tree, which merges into the host app namespace at their original resolver
 * paths (components/patterns/…, modifiers/…). That's why no `app/` re-export bridges
 * are needed here (unlike the product modules, which keep code in `addon/` to stay
 * promotable to engines). Dependency direction: host + modules → shared → design-system.
 */
module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },
};
