# UX writing & microcopy — security & endpoint-management products

> Endpoint Central is a **security + management** product: the reader is an IT admin or security operator,
> the actions are **high-stakes and often fleet-scale** (patch 1,200 devices, quarantine an endpoint, wipe a
> lost laptop), and the copy is frequently **evidence in an audit**. Words here carry consequence. Write like
> a senior UX writer for this domain: **precise, calm, trustworthy, consequence-first** — never hype, never
> vague, never alarmist. Admins scan; every word must earn its place and be unambiguous.
>
> Provide *exact* copy in a brief — buttons, labels, helper text, error, empty state, confirmation — not
> "add a helpful message."

## 1. Voice for this domain

- **Precise over friendly.** A security admin trusts clarity, not personality. State facts and consequences
  plainly. Warmth lives in being helpful (a clear fix), not in exclamation marks.
- **Calm under alarm.** Threat/failure copy must lower the reader's stress, not raise it. State the fact, the
  scope, and the next action. No fear-mongering, no "⚠️ DANGER!!!", no marketing hype ("military-grade").
- **Consequence-first for anything destructive or fleet-scale.** Lead with what will happen and to how many,
  before the confirm. The admin should never be surprised by the blast radius.
- **Accurate risk — don't over- or under-state.** "No scan has run yet" is not "You're secure." "3 devices
  failed" is not "Deployment failed." Precision protects trust.
- **Neutral, non-blaming.** Errors describe the situation, not fault: "The agent hasn't checked in" — not
  "You didn't install the agent."

## 2. Terminology discipline (the biggest lever in this domain)

- **Use the product's exact terms, every time.** Scope of Management, Deployment Policy, Test & Approve, APD,
  Distribution Server, Secure Gateway, Self-Service Portal, Missing / Installed / Declined patches, System
  Health (Healthy / Vulnerable / Highly Vulnerable). Match `references/kb/glossary.md`; never invent a synonym
  or rename a shipped concept. Inconsistent terms across screens are the #1 admin-confusion source.
- **Respect security vocabulary — don't dumb it down, but expand on first use.** CVE, CVSS, zero-day, patch
  vs update vs hotfix, quarantine vs isolate, remediation, compliance baseline (CIS/STIG), allowlist/blocklist
  (not whitelist/blacklist), least privilege, JIT elevation, EDR/IoA/IoC. Admins know these; using them
  correctly builds trust. Spell out an acronym once where the persona (e.g., an approver) may not know it.
- **One concept, one word.** Don't alternate "device / endpoint / machine / computer / asset" randomly in one
  flow — pick the product's term for that surface and hold it.
- **Distinguish look-alikes.** "Decline" ≠ "Uninstall" ≠ "Delete"; "Approve" (patch) ≠ "Deploy"; "Scan" ≠
  "Sync"; "Wipe" (full) ≠ "Corporate wipe" (container only). Name the exact operation.

## 3. Buttons & action labels

- **Verb first, 1–3 words, sentence case:** "Deploy patch", "Approve patch", "Quarantine device", "Wipe
  device", "Add schedule", "Run scan". Never "OK", "Submit", "Yes", "Proceed", "Click here".
- **Name the operation precisely** so the button alone tells the admin what fires: "Approve for 1,284 devices"
  beats "Approve"; "Wipe 3 devices" beats "Confirm".
- **The confirm button restates the verb + scope**, never "OK/Yes". Cancel is the safe default.
- **Destructive action styling** = `danger`; it is never the quiet default-looking primary.
- **No terminal punctuation** on buttons, labels, headings. Helper text and body copy get periods.

## 4. High-stakes & destructive actions (the domain's core)

For Delete, Move to Trash, **Wipe / Corporate wipe**, **Quarantine / Isolate**, Uninstall, **Decline patch**,
Suspend, and **any deploy to many endpoints**, the copy must carry the weight:

- **State the consequence + the exact count.** "Wipe 42 devices? This erases all corporate data on them." /
  "Approve KB5039212 for 1,284 devices?"
- **Say if it's irreversible.** "This can't be undone." Prefer reversible (Move to Trash + Restore, Undo
  snackbar 5–8s) and say so: "You can restore this from Trash for 30 days."
- **Typed confirmation for irreversible or fleet-scale.** Ask the admin to type the count or the action word
  ("type WIPE to confirm") when data loss or many endpoints are involved.
- **Name what's affected, not just how many** where useful: "3 domain controllers are in this selection."
- **Never bury the scope.** If the action targets a group/All Computers, restate that at the button and in the
  dialog. Scope-restatement at every layer is how you prevent the catastrophe misclick.

**Confirmation dialog copy pattern:**
```
Title:  <Verb> <count/target>?            e.g. "Quarantine 5 devices?"
Body:   <what happens> · <what's affected> · <reversibility>
        e.g. "They'll be blocked from the network until released. Corporate access stops immediately. You can release them anytime."
Confirm: <Verb> (danger)   Cancel (default, focused)
```

## 5. Error messages

Errors in this product are where trust is won or lost — the admin is often mid-incident.

- **Structure: what happened → why → what to do.** One or two sentences, no "Error:" prefix, no raw exception
  or stack trace, no first person.
- **Include the vendor/error code** for support tickets and a **Read KB** link. "Patch download failed — the
  proxy can't reach the vendor URL (407). Add it to the proxy exceptions, then retry. [Read KB]"
- **Actionable + recoverable.** Every error offers the next step: Retry, a fix, or a troubleshoot link.
  Preserve entered form data on failure.
- **Never leak sensitive detail** in an error (credentials, tokens, internal hostnames, full paths). Say
  "Authentication failed" — not the credential.
- **Distinguish the failure precisely.** "3 of 120 devices failed" is not "Deployment failed." Link to the
  failed subset with per-device reasons.
- **Common EC error families to write well:** agent unreachable / not checked in; port/firewall (8383, 8027);
  proxy/whitelist; certificate/APNs expired or mismatched; subscription missing (RHEL/SUSE); patch
  download/checksum; reboot pending; insufficient permission. Each gets cause + fix + code + KB.

## 6. Status, severity & lifecycle wording

- **Never ambiguous.** "May be running or failed" is a bug — surface the real state. Every status is a clear
  word + a dot/badge + (often) a timestamp: "Failed · 2 min ago", "Highly Vulnerable", "Healthy".
- **Scan / operation lifecycle** as distinct states, each with its own copy: **Not scanned yet** / **Scanning…
  (38 of 120)** / **Failed — <reason>** / **Completed**. "Not scanned yet" must never read as "safe".
- **Severity labels are fixed and semantic:** Critical / High / Medium / Low (and Healthy / Vulnerable /
  Highly Vulnerable for system health; Compliant / Non-compliant for baselines). Same word → same color →
  same meaning everywhere (pair with `design-cases.md` Case 1).
- **Counts and scope are explicit:** "1,284 missing patches across 312 devices", "0 of 25 endpoints ready".

## 7. Empty states — precision matters more here

Security empty states can dangerously imply safety. Distinguish:
- **Cleared vs never-run:** "No vulnerabilities detected in the last scan" (evaluated, clean) vs "No scan has
  run yet — run one to assess these devices" (unknown, act now). Never show a reassuring empty state for an
  un-run check.
- **Nothing configured:** invitation + action — "No deployment schedules yet — add one to start deploying."
- **Nothing in scope:** "No devices in Scope of Management — add a domain or workgroup first."

## 8. Prerequisite, permission & gating copy

- **Prerequisite banners explain and route.** "No agents deployed — 0 of 120 endpoints ready. Deploy the agent
  to start managing them. [Deploy agent]" — never a blank dimmed form with no reason.
- **Permission (RBAC) denials explain, not just deny.** "You don't have permission to deploy patches. Ask your
  Endpoint Central administrator for Patch Management → Write." Name the role/scope needed.
- **Edition/platform locks explain + path.** "Endpoint DLP is available on the Security edition (On-Premises).
  [Compare editions]" — not a dead "Not available".

## 9. Compliance & audit copy

- **Audit-friendly, factual, attributable.** Log lines read who / what / when / to whom: "admin@acme approved
  KB5039212 for 1,284 devices · 12 Jul, 23:04". Past tense, no first person, no "successfully".
- **Reason / remarks fields** get clear prompts: "Why are you declining this patch? (shown in the audit
  trail)". These become compliance evidence — the label must set that expectation.
- **Regulatory tone is plain and precise** (HIPAA/GDPR/CIS/PCI): state the requirement and the status, don't
  editorialize.

## 10. Alerts & notifications (fight alert fatigue with words)

- **Specific and actionable, severity-led.** "3 Highly Vulnerable servers are missing Critical patches —
  review" beats "You have new alerts." Lead with what and how bad, then the action.
- **Don't cry wolf.** Reserve urgent phrasing for urgent states; a pending reboot is not a breach. Group and
  summarize routine items; escalate only the exceptional.

## 11. Quick do / don't (security & management)

| Don't | Do |
|---|---|
| "OK" / "Yes" to confirm a wipe | "Wipe 42 devices" (danger) |
| "Approve" | "Approve for 1,284 devices" |
| "Deployment failed" (3 of 120 failed) | "3 of 120 devices failed — view reasons" |
| "No data" on an un-run scan | "No scan has run yet — run one to assess" |
| "Error: connection refused" | "Couldn't reach the agent (port 8383). Check the firewall, then retry. [KB]" |
| "whitelist / blacklist" | "allowlist / blocklist" |
| "Are you sure?" | "Quarantine 5 devices? They'll be blocked from the network until released." |
| "You didn't configure credentials" | "No credentials set for this domain. Add one to continue." |
| "This action was completed successfully!" | "Patch approved · deployment scheduled" |
| "Access denied" | "You need Patch Management → Write to deploy. Ask your administrator." |

## 12. In a design brief
Give **exact copy** for: primary/secondary buttons, key labels, helper text, the empty state (distinguish
cleared vs un-run), the error (what happened + why + fix + code + Read KB), the confirmation (consequence +
count + reversibility), and any audit/reason prompt. Flag any legacy or inconsistent term against the glossary
(e.g., whitelist → allowlist) and propose the correct one.
