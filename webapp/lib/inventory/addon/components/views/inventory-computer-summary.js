import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Inventory · Computer summary — the CANONICAL L04 list-detail
 * (Layout/views/layout-list-detail.html). A device drill-down: a full RecordHeader
 * (identity · Online status · IP/owner summary · facet tabs · Actions) over the
 * Summary facet — an L05 read-only bento of ds-widget cards (checks, charts,
 * description-lists, activity, empty-state). All Prism components + tokens.
 *
 * Like the vanilla view, the bento content is static demo data (this page shows
 * the archetype, not a live record), exposed here as getters. Non-Summary facets
 * swap to a demo empty-state.
 */
export default class InventoryComputerSummary extends Component {
  @service router;
  @service shell;

  @tracked facet = 'summary';

  get header() { return { icon: 'computer', title: 'DESKTOP-G9STR9D' }; }

  get breadcrumbs() {
    return [
      { label: 'Inventory', href: '#' },
      { label: 'Computers', href: '#' },
      { label: 'DESKTOP-G9STR9D' },
    ];
  }

  get summary() {
    return [
      { label: 'Status', value: 'Online', status: 'success' },
      { label: 'IP Address', value: '192.168.1.1, 192.168.1.290 (+3)' },
      { label: 'Primary Owner', value: 'Jane Smith' },
    ];
  }

  get tabs() {
    return [
      { id: 'summary', label: 'Summary', active: this.facet === 'summary' },
      { id: 'security', label: 'Security', active: this.facet === 'security' },
      { id: 'audit', label: 'Audit', active: this.facet === 'audit' },
      { id: 'tasks', label: 'Tasks', active: this.facet === 'tasks' },
      { id: 'groups', label: 'Custom Groups', active: this.facet === 'groups' },
      { id: 'software', label: 'Softwares', active: this.facet === 'software' },
      { id: 'hardware', label: 'Hardwares', active: this.facet === 'hardware' },
      { id: 'systems', label: 'Systems', active: this.facet === 'systems' },
      { id: 'restrictions', label: 'Restrictions', active: this.facet === 'restrictions' },
    ];
  }

  get onSummary() { return this.facet === 'summary'; }

  get facetLabel() { return (this.tabs.find((t) => t.id === this.facet) || {}).label || 'Facet'; }

  // ── Security & Compliance checks — order reads down each column (Figma). ──
  get checks() {
    return [
      { icon: 'patch', tone: 'neutral', k: 'Missing Patches', v: '40' },
      { icon: 'firewall', tone: 'error', k: 'Firewall', v: 'Disabled' },
      { icon: 'clock', tone: 'warning', k: 'Device Warranty', v: 'Expired' },
      { icon: 'circle-tick', tone: 'success', k: 'Exploitable Vulnerabilities', v: '0' },
      { icon: 'circle-tick', tone: 'success', k: 'Antivirus', v: 'Up-to-date' },
      { icon: 'certificate', tone: 'success', k: 'OS License', v: 'Licensed' },
      { icon: 'lock', tone: 'success', k: 'Bit-locker', v: 'Enabled' },
    ];
  }

  // ── Charts (ds-chart data: categories + one series with semantic colors). ──
  get diskChart() {
    return { categories: ['Used', 'Free'], series: [{ name: 'Total Size', values: [190, 310], colors: ['blue', 'grey'] }] };
  }

  get softwareChart() {
    return {
      categories: ['Recently Installed', 'Under Licensed', 'High-Risk', 'Commercial', 'Prohibited', 'Non-commercial'],
      series: [{ name: 'Count', values: [50, 200, 470, 320, 130, 80], colors: ['blue', 'green', 'orange', 'purple', 'red', 'yellow'] }],
    };
  }

  get dexChart() { return { value: 60, label: 'out of 100' }; }

  get sensitiveChart() {
    return { categories: ['PII', 'Health', 'HIPAA'], series: [{ name: 'Total Data', values: [94, 4, 2], colors: ['blue', 'yellow', 'red'] }] };
  }

  get dexLegend() {
    return [
      { label: 'Security - 5', swatch: 'chart-red-primary' },
      { label: 'Application - 3', swatch: 'chart-orange-tertiary' },
      { label: 'Hardware - 2', swatch: 'chart-blue-primary' },
    ];
  }

  // ── Recent Activity — icon tile + title + meta (tag · user · time). ──
  get activity() {
    return [
      { icon: 'shield', tile: 'error', title: 'Security patch installation failed', tag: 'Security', status: 'critical', when: '3 mins ago' },
      { icon: 'info-circle', tile: 'info', title: 'System scan completed', tag: 'Policy', status: 'info', user: 'john', when: '8 hours ago' },
      { icon: 'exclamation-circle', tile: 'warning', title: 'High CPU Usage', tag: 'Error', status: 'warning', when: '18 mins ago' },
      { icon: 'exclamation-circle', tile: 'alert', title: 'Network security scan initiated', tag: 'Expiry', status: 'alert', when: '1 day ago' },
      { icon: 'circle-tick', tile: 'success', title: 'MacBook-Pro-Dev-09 enrolled via ABM', tag: 'MDM', status: 'success', when: '2 days ago' },
    ];
  }

  // ── Description-list facets (ds-description-list items). ──
  get sysinfoItems() {
    return [
      { term: 'Manufacturer', description: 'Dell Inc.' },
      { term: 'Device Model', description: 'OptiPlex 7090' },
      { term: 'Device Type', description: 'System' },
      { term: 'Memory', description: '16 GB of RAM' },
      { term: 'Memory Type', description: 'DDR4' },
      { term: 'Processor', description: '12th Gen Intel® Core™ i7' },
      { term: 'Storage Type', description: 'SSD' },
      { term: 'Processor Architecture', description: 'x64-based PC' },
      { term: 'Battery Health', type: 'link', description: 'MDM Profile Required', href: '#' },
      { term: 'UDID', type: 'link', description: 'MDM Profile Required', href: '#' },
      { term: 'EAS Device Identifier', type: 'link', description: 'MDM Profile Required', href: '#' },
    ];
  }

  get osItems() {
    return [
      { term: 'OS Name', description: 'Windows 11 Professional' },
      { term: 'OS Status', type: 'status', status: 'success', description: 'Licensed' },
      { term: 'Version', description: '10.0.19045' },
      { term: 'Build Number', description: '19045.4049' },
      { term: 'Registered to', description: 'Sysadmin' },
      { term: 'System Drive', description: 'C:' },
      { term: 'License Type', description: 'OEM:DM' },
      { term: 'Service Tag / Serial Number', description: '5QDWXJ2' },
      { term: 'OS Key', description: '74x-xxxx-xxxx-xxxx-xxXC' },
      { term: 'Product ID', description: '00330-53528-02747-AAOEM' },
      { term: 'OS Service Pack', description: 'Windows 11 Version 22H2 (x64)' },
    ];
  }

  get agentItems() {
    return [
      { term: 'Agent Version', description: '11.2.2340.1.W' },
      { term: 'Remote Office', description: 'Chennai' },
      { term: 'Current Logged User', description: 'Will Smith' },
      { term: 'Last Logon User', description: 'John Doe' },
      { term: 'Agent Installed Time', description: 'Jan 14, 2026 05:30 PM' },
      { term: 'Last Successful Scan', description: 'May 17, 2025 03:24 AM' },
      { term: 'Last Contact Time', description: 'Jun 22, 2026 09:12 AM' },
      { term: 'Last Boot Time', description: 'May 28, 2025 08:11 PM' },
    ];
  }

  get additionalItems() {
    return [
      { term: 'Device Host Name', description: 'DESKTOP-G9STR9D' },
      { term: 'Device Display Name', description: 'Jane Smith Windows' },
      { term: 'Domain', description: 'jionetwork.com' },
      { term: 'MDM Status', type: 'status', status: 'warning', description: 'Not Installed' },
      { term: 'Enrolled Via', description: 'Network Scan' },
      { term: 'Public Address', description: '172.0.0.0' },
      { term: 'MAC Address', description: '00:1B:44:11:3A:B7' },
      { term: 'Active Directory Status', description: 'Joined' },
      { term: 'Service Tag', description: 'C03728A8DFJ903' },
      { term: 'Timezone', description: 'GMT+5:30 — India, Tamil Nadu, Chennai' },
    ];
  }

  get customItems() {
    return [
      { term: 'Computer Location', description: 'Krisp IT Park, Chennai-603201, India' },
      { term: 'Search Tag', description: 'DEV-TEAM-WS' },
      { term: 'Product Number', description: '--' },
      { term: 'Owner Name', description: 'Jane Smith' },
      { term: 'Owner Email ID', type: 'link', description: 'john.smith@company.com', href: 'mailto:john.smith@company.com' },
      { term: 'Notes', description: '--' },
      { term: 'Shipping | Expiry Date', description: 'Dec 13, 2018 | Dec 12, 2026' },
    ];
  }

  @action onTabChange(tab) { this.facet = (tab && tab.id) || 'summary'; }

  @action onBreadcrumbClick(event) {
    const a = event.target.closest?.('a[href]');
    if (a) event.preventDefault();
  }
}
