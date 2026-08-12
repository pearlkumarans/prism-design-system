import Controller from '@ember/controller';
import { service } from '@ember/service';

// Gives the application template access to live nav state for the header chrome.
export default class ApplicationController extends Controller {
  @service shell;
}
