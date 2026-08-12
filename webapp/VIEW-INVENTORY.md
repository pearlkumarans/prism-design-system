# View inventory & conversion order (Phase E)

The migration scope is the **41 routable views** registered in the single source of truth
(`Layout/shell-catalog.js`). This is the real count — the earlier "~100" was a rough estimate.

**Status:** 2 native ✅ · 39 remaining · (30 of 41 view *files* exist in this checkout; the
other 11 live in the full app but not this subset — marked `file: —`).

**Size key:** **S** ≈ 0.5–1 day · **M** ≈ 1–2 days · **L** ≈ 3+ days. Estimates are post-playbook
(patterns established); each also includes wiring real data + an acceptance test.

## By module

### Configurations (`configs`) — pattern forms
| Slug | Archetype | Size | Status | File |
|---|---|---|---|---|
| `sectioned-form` | form | M | ✅ native | y |
| `tabbed-form` | form (tabbed) | S | legacy | y |

### Inventory (`inv`)
| Slug | Archetype | Size | Status | File |
|---|---|---|---|---|
| `list-view` | list + filter | M | legacy | y |
| `list-detail` | list → detail | M | legacy | y |
| `acme-inventory-overview` | dashboard | M | legacy | — |
| `custom-groups-create-group` | create form | M | legacy | y |

### Threats & Patches (`tp`)
| Slug | Archetype | Size | Status | File |
|---|---|---|---|---|
| `module-dashboard` | dashboard | M | legacy | y |
| `missing-patches` | list + filter | M | legacy | — |
| `acme-patch-approvals` | list | M | legacy | — |
| `acme-patch-detail` | detail | S | legacy | — |
| `patch-management-deployment-schedule` | schedule form | M | legacy | — |
| `threats-patches-highly-vulnerable-systems` | list | M | legacy | — |
| `threats-patches-linux-repository-settings` | list + filter + modal | M | legacy | y |
| `threats-patches-n1-patch-settings` | tabbed table | M | legacy | y |

### BitLocker (`bitlocker`)
| Slug | Archetype | Size | Status | File |
|---|---|---|---|---|
| `bitlocker-dashboard` | dashboard | M | ✅ native | y |
| `bitlocker-managed-systems` | list + filter | M | legacy | y |
| `bitlocker-policy-creation` | create form | M | legacy | y |
| `bitlocker-device-detail` | detail (drill-down) | S | legacy | — |
| `bitlocker-activity-report` | report | M | legacy | — |

### Software Deployment (`sd`) — demo project
| Slug | Archetype | Size | Status | File |
|---|---|---|---|---|
| `demo-deployments` | list | M | legacy | — |
| `demo-create-deployment` | create form | M | legacy | — |
| `demo-deployment-detail` | detail | M | legacy | — |

### Deployments (`deployments`) — largest, fully present
| Slug | Archetype | Size | Status | File |
|---|---|---|---|---|
| `deployments-summary` | dashboard | M | legacy | y |
| `deployments-devices` | list | M | legacy | y |
| `deployments-list` | list | M | legacy | y |
| `deployments-policy-list` | list | M | legacy | y |
| `deployments-workflow` | list | M | legacy | y |
| `deployments-schedule` | list | M | legacy | y |
| `deployments-create` | create form | M | legacy | y |
| `deployments-schedule-form` | form | S | legacy | y |
| `deployments-policy` | config detail | M | legacy | y |
| `deployments-policy-detail` | detail | M | legacy | y |
| `deployments-detail` | detail | M | legacy | y |
| `deployments-schedule-detail` | detail | S | legacy | y |
| `deployments-device-execution` | detail | M | legacy | y |
| `deployments-reports` | report | M | legacy | y |
| `deployments-policy-install-uninstall-software` | config form | M | legacy | y |
| `deployments-policy-file-folder-operation` | config form | M | legacy | y |
| `deployments-policy-install-uninstall-patches` | config form | M | legacy | y |
| `deployments-policy-custom-script` | config form | M | legacy | y |
| `deployments-workflow-builder` | builder (drag/drop) | L | legacy | y |

## Size roll-up (39 remaining)

| Size | Count | Notes |
|---|---|---|
| **S** | 4 | simple forms/details — `tabbed-form`, `acme-patch-detail`, `bitlocker-device-detail`, `deployments-schedule-form`, `deployments-schedule-detail` |
| **M** | ~34 | the bulk — lists, dashboards, forms, config panels, reports |
| **L** | 1 | `deployments-workflow-builder` (drag/drop canvas) |

Rough order-of-magnitude for the tail: **~50–70 engineer-days** post-playbook, highly
parallelizable — i.e. weeks with a small team, not months with one person.

## Recommended conversion order

1. **Finish BitLocker** (4 left) — a module already half-native; small, mostly present. Proves
   "a whole module goes native" and gives a clean demo area.
2. **Threats & Patches** (8) — high-traffic; mixes list/detail/form/tabbed archetypes, so it
   exercises the playbook broadly.
3. **Deployments** (19) — the largest and fully present; convert as a block, parallelized across
   the team. Save `deployments-workflow-builder` (the lone **L**) for last in the module.
4. **Inventory + Configurations pattern views** (6) — reusable archetypes; converting these
   yields templates others copy.
5. **Demo / Acme project views** (6) — lowest priority; several files aren't in this checkout, so
   they'll need the full app present first.

**Sequencing note:** within each module do list → detail → form → dashboard → builder, so the
simplest archetypes land first and establish the module's data + component patterns.
