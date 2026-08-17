import Component from '@glimmer/component';

/**
 * A tab panel: visible only when its @id matches the tab bar's active id. Binding
 * `hidden` to undefined removes the attribute (shown); to true adds it (hidden),
 * so all panels stay in the DOM and keep their field state across tab switches.
 */
export default class TabbedFormPanel extends Component {
  get hiddenAttr() { return this.args.id === this.args.activeId ? undefined : true; }
}
