import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * Patterns::SectionedForm — the L06 sectioned-form archetype
 * (Layout/views/layout-sectioned-form.html) as a reusable scaffold. It owns the
 * .sform frame: page header (+ breadcrumbs), the scrolling body, the pinned
 * ds-form-footer (Cancel · Save as ▾ · primary), and the Save-as dropdown mechanics.
 *
 * The FIELDS differ per form, so the body is a yielded block that receives a
 * <Form.Section> component for each section:
 *
 *   <Patterns::SectionedForm @header=… @breadcrumbs=… @primaryLabel="Deploy"
 *       @saveAsItems=… @onPrimary=… @onCancel=… @onSaveAs=…>
 *     <:body as |Form|>
 *       <Form.Section @title="Basic Information" @description="…">
 *         <ds-text-input …/>
 *       </Form.Section>
 *     </:body>
 *   </Patterns::SectionedForm>
 *
 * Args: @header {icon,title,description} · @breadcrumbs · @footerNote ·
 *       @primaryLabel · @saveAsItems[] · @onPrimary() · @onCancel() · @onSaveAs(value)
 */
export default class SectionedFormPattern extends Component {
  get header() { return this.args.header ?? {}; }

  @action onPrimary() { this.args.onPrimary?.(); }
  @action onCancel() { this.args.onCancel?.(); }

  // Anchor the Save-as menu above the footer button (footer sits at the viewport bottom).
  @action openSaveAs(event) {
    const btn = event.currentTarget;
    const menu = btn.closest('.sform')?.querySelector('ds-dropdown-menu');
    if (!menu) return;
    event.stopPropagation();
    const r = btn.getBoundingClientRect();
    Object.assign(menu.style, {
      position: 'fixed', left: `${r.left}px`, right: 'auto',
      bottom: `${window.innerHeight - r.top + 6}px`,
      zIndex: '2000', minWidth: `${Math.max(200, Math.round(r.width))}px`,
    });
    menu.toggle?.();
  }

  @action onSaveAsChange(event) {
    const d = event.detail || {};
    event.currentTarget.close?.();
    this.args.onSaveAs?.(d.value || d.id || '');
  }
}
