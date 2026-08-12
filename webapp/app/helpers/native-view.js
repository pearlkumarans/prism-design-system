import { helper } from '@ember/component/helper';
import { NATIVE_VIEWS } from 'prism-webapp/config/native-views';

/**
 * {{native-view slug}} → the component name ("views/<slug>") if this slug has a
 * native Ember implementation, else null. The view template uses it to choose
 * between {{component}} (native) and <ContentOutlet> (legacy injection).
 */
export default helper(function nativeView([slug]) {
  return NATIVE_VIEWS.has(slug) ? `views/${slug}` : null;
});
