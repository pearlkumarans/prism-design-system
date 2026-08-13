'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // The design system is a plain npm package of Web Components; ember-auto-import
    // bundles its ES module when we `import '@uems/design-system'` in app/app.js.
    autoImport: {
      watchDependencies: ['@uems/design-system'],
    },
  });

  return app.toTree();
};
