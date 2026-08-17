import Component from '@glimmer/component';

/**
 * Empty state — promo variant preview. A ds-empty-state type="promo": media +
 * title/description + primary action + footer links on the left, beside a
 * benefits list on the right (benefits are set as a JS property via set-prop).
 */
export default class EmptyStatePromo extends Component {
  benefits = [
    'Per-device digital experience scores',
    'Root-cause insights — CPU, memory, disk, boot & network',
    'One-click remote remediation from the console',
    'Localized dashboards — English & Arabic (RTL)',
  ];
}
