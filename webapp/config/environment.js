'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'prism-webapp',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {},
    },
    APP: {},
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
  }

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
