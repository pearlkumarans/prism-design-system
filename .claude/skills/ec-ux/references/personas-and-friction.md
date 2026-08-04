# Personas, JTBD & recurring UX friction

> Ground the brief's "users" and "friction" sections in these. They recur across Endpoint Central
> modules. Each module's KB file also has its own persona list and "UX research hooks" — prefer those
> for module-specific nuance; use this file for the cross-product picture.

## Personas & jobs-to-be-done

- **IT / Systems Administrator** — deploy patches at scale, install software reliably, keep inventory,
  configure systems, troubleshoot remotely, stay compliant. Manages hundreds–thousands of mixed-OS
  endpoints. Cares about time-to-deploy and MTTR. Friction: time-to-first-managed-endpoint, wizard
  complexity, remote-office (DS/SGS) setup.
- **Patch Administrator / Operations Engineer** — manage patch schedules, test, approve/decline, track
  status, report to management. Often regulated orgs. Friction: approval bottlenecks, manual-vs-auto
  trade-offs, audit reporting.
- **Security / Compliance Officer** — reduce attack surface, enforce policy, audit compliance, detect &
  remediate threats. Owns vulnerability, EDR, DLP, privilege, browser security. Friction: alert
  fatigue, slow triage, manual remediation, multi-tool integration.
- **Help-desk / Support Technician** — resolve user issues fast; scoped (role-limited) permissions;
  uses console + mobile app. Workflows: remote control, system tools, SSP fulfillment. Friction:
  scope limits, multi-monitor control, opaque "Deploy Immediately" waits.
- **IT Manager / Leadership / CISO** — monitor fleet health, track ROI, decide strategy, report to
  C-suite. Consumes dashboards and scheduled reports. Friction: no single health KPI, slow reports,
  limited prediction.
- **End User (indirect)** — get work done without IT friction; self-serve via SSP; cooperate with
  remote support; let Zia auto-fix. Friction: SSP shows the "wrong" action (name/version mismatch),
  disruptive patch reboots, invisible tray icon, intrusive consent prompts.
- **MSP Operator** — manage many customer tenants from one console, isolate data, bill per client.
  Friction: per-tenant isolation complexity, multi-tenant performance.
- **Infrastructure / Platform Engineer (on-prem)** — keep the EC server healthy, scale, HA/failover,
  agent/DS rollout. Friction: large-fleet scaling guidance, failover, agent-push failures.
- **Automation Engineer / no-code builder** — build self-healing remediation, reduce manual work,
  extend with scripts/workflows/Zia agents. Friction: script docs gaps, limited dry-run, approval
  governance.

## Recurring friction patterns (design against these)

1. **Edition & feature-gating confusion** — what's included where isn't intuitive. → in-context
   feature-comparison, "upgrade to unlock" at point of use, clear lock messaging.
2. **Dual-onboarding of modern laptops** (agent + enrollment) — concept confuses. → auto-detect and
   guide both in one flow; explain "why two".
3. **Roaming / WAN setup complexity** (Distribution Server, Secure Gateway) — admins drop off. →
   step-by-step remote-office wizard, live connectivity test, clear error remediation.
4. **Repository choice** (Network Share vs HTTP) — easy to mis-route, fails late. → recommend per
   target, warn on mismatch, surface copy-to-client.
5. **Wizard cognitive load** — powerful multi-step wizards stack many decisions. → sensible defaults,
   progressive disclosure (basic/advanced), inline help, review screen, a quick-start path.
6. **Discoverability of power features** — Test & Approve, Decline, SSP, closed-network patching,
   no-code remediation, custom groups, DEX are hidden. → contextual "did you know", guided tours,
   better search/help.
7. **Alert fatigue** — static thresholds (System Health Policy, DEX baselines) and the "Attention
   Required" view flood or under-warn. → recommended baselines, adaptive thresholds, smart filtering
   (hide expected states like post-deploy pending reboot), severity scoring, actionable next steps.
8. **Deploy vs Self-Service-Portal decision** — the trade-off for high-uptime servers is a real
   hesitation point. → clarify the choice at the decision node; recommend by target type.
9. **Scan-expectation mismatch** — users expect to schedule/restrict patch scans, but scanning is
   event-driven. → set expectations in the UI.
10. **Targeting friction / scoping errors** — selecting from large OU trees is error-prone. → saved
    target sets, bulk edit, "N devices match" preview, undo.
11. **RBAC setup confusion** — under/over-scoping technicians. → role templates, scope-preview,
    permission-mismatch audit.
12. **SSP action mismatch** — Install/Upgrade/Downgrade hinge on Application Name/Version matching
    Control Panel. → auto-populate and validate at package creation; explain mismatches in SSP.
13. **Replication opacity** — "Deploy Immediately" waits on DS replication with no visibility. →
    real-time replication progress, pre-emptive warning, manual sync.
14. **Mobile parity** — Zia voice is Android-only. → iOS parity (Shortcuts/Siri) or non-voice
    alternatives.

## How to use in the brief
- Pick the 1–3 personas that actually touch the screen; don't list all.
- Name the specific friction points that apply at specific nodes of the flow, and say how the design
  mitigates each. This is what turns a description into a design rationale.
