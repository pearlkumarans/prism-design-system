import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Patterns::TabbedForm — the L07 tabbed-settings archetype
 * (Layout/views/layout-tabbed-form.html). A tab strip swaps between sectioned-form
 * panels. It reuses Patterns::SectionedForm's <Form.Section> and adds a
 * <Form.Panel @id> per tab (only the active panel shows). ≤5 tabs → horizontal
 * underline bar on top; >5 → vertical fill nav on the left (override via @orientation).
 *
 *   <Patterns::TabbedForm @header=… @breadcrumbs=… @tabs=[{id,label}]
 *       @primaryLabel="Save" @onPrimary=… @onCancel=…>
 *     <:body as |Form|>
 *       <Form.Panel @id="general">
 *         <Form.Section @title="Identity" @description="…"><ds-text-input …/></Form.Section>
 *       </Form.Panel>
 *     </:body>
 *   </Patterns::TabbedForm>
 */
export default class TabbedFormPattern extends Component {
  @tracked activeId;

  constructor() {
    super(...arguments);
    this.activeId = this.args.activeId ?? this.args.tabs?.[0]?.id;
  }

  get header() { return this.args.header ?? {}; }
  get tabs() { return this.args.tabs ?? []; }
  get vertical() { return this.args.orientation ? this.args.orientation === 'vertical' : this.tabs.length > 5; }

  @action onTabChange(event) { const id = event.detail?.id; if (id) this.activeId = id; }
  @action onPrimary() { this.args.onPrimary?.(); }
  @action onCancel() { this.args.onCancel?.(); }
}
