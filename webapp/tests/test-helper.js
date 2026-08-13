import Application from 'prism-webapp/app';
import config from 'prism-webapp/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

export function setupApp() {
  setApplication(Application.create(config.APP));
}

setup(QUnit.assert);
setupApp();
start();
