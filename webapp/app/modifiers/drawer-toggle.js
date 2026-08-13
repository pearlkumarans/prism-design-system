import { modifier } from 'ember-modifier';

/**
 * drawer-toggle — drive a <ds-drawer>'s open state from a tracked boolean.
 *
 * A plain `open={{if this.isOpen "" null}}` binding is unreliable for a custom
 * element's boolean attribute (empty-string vs absent), so we call the drawer's
 * own open()/close() methods instead. The modifier re-runs whenever the tracked
 * arg changes, and waits for the element to upgrade before poking it.
 *
 *   <ds-drawer {{drawer-toggle this.panelOpen}} …></ds-drawer>
 */
export default modifier(function drawerToggle(el, [isOpen]) {
  customElements.whenDefined('ds-drawer').then(() => {
    if (isOpen) el.open?.();
    else el.close?.();
  });
});
