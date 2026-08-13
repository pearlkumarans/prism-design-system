import Controller from '@ember/controller';
import { service } from '@ember/service';

// Gives the application template access to live nav state for the header chrome.
export default class ApplicationController extends Controller {
  @service shell;
  @service router;

  // The /patterns gallery renders standalone (no shell chrome).
  get isPatternPreview() {
    return (this.router.currentRouteName || '').startsWith('patterns');
  }
}
