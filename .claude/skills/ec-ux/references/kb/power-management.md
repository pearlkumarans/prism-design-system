# Power Management

> Optimizing endpoint power consumption through power schemes, scheduled shutdown of inactive computers, screen-saver control, Wake-on-LAN, and energy-savings reporting — to cut costs and carbon footprint. Parent module: [IT Asset Management](it-asset-management.md). Available across Endpoint Central paid editions; a Free edition exists with reduced endpoint limits (edition gating inferred — verify against the official edition-comparison matrix).

## 1. What it is — Feature detail

Desktop power management efficiently manages and optimizes the power consumption of computer hardware — laptops, desktops, printers, and peripherals — by switching off power when devices are unused or enabling low-power mode when inactive. The goal is "green computing": reduce costs and minimize the organization's digital carbon footprint. Endpoint Central lets administrators apply power schemes, turn off screen savers, shut down inactive computers, and report on the results.

### Key capabilities
- **Apply Power Schemes** — define and apply appropriate power schemes (per branch/department/role) to reduce power consumption during system idle (e.g., turn off display/disk, sleep/hibernate after N minutes idle).
- **Turn off Screen Savers** — screen savers consume up to **25% more power** than a normal screen; disabling them saves energy (also helps on older monitors).
- **Shutdown Inactive Computers** — schedule shutdown after off-hours; this alone can save **up to 76%** of energy cost. Idle computers can be shut down, hibernated, or put on standby.
- **Wake-on-LAN (WoL)** — power on machines remotely (e.g., to apply patches/configurations outside hours, or to wake a fleet before the workday). Available as a tool in Endpoint Central.
- **Power Management Reports** — system up-time report to keep a check on the go-green initiative.
- **Power Calculator** — estimate the savings achievable by turning off computers after office hours.

### Capability summary
| Capability | What it does | Headline benefit |
|---|---|---|
| Power schemes | Idle-based display/disk/sleep policies, scoped by branch/dept/role | Lower idle draw |
| Turn off screen savers | Disable energy-wasting screen savers | ~25% less power vs. screen saver |
| Shutdown inactive computers | Scheduled off-hours shutdown/hibernate/standby | Up to 76% energy-cost savings |
| Wake-on-LAN | Remote power-on of endpoints | Enables off-hours maintenance |
| Reports + Power Calculator | System up-time report; savings estimate | Quantify the green initiative |

## 2. UX lens

### Console navigation path
- Apply power schemes: a Windows configuration (Configurations > Windows > Power Management / Power Scheme — exact label inferred).
- Wake-on-LAN: `Tools > Wake on LAN`.
- Remote Shutdown: `Tools > Remote Shutdown`.
- Reports: `Reports > Power Management Reports` (System Up-time report).
- Power Calculator: linked resource on the power management page.

### Step-by-step: apply a power scheme
1. Open the Power Scheme configuration under Windows configurations.
2. Name and describe the configuration.
3. Define idle thresholds — turn off display/hard disk, sleep/hibernate after N minutes; choose to also turn off the screen saver.
4. Optionally include shutdown/hibernate/standby of idle computers.
5. Target the configuration to branches/departments/roles (via custom groups) and deploy.

### Step-by-step: schedule shutdown of inactive computers
1. Configure a shutdown action (off-hours schedule) targeting the relevant machines.
2. Choose the action (shutdown / hibernate / standby) and the inactivity/time trigger.
3. Optionally pair with **Wake-on-LAN** so machines wake for morning use or off-hours maintenance.
4. Deploy; review savings in the System Up-time report and the Power Calculator.

### Step-by-step: Wake-on-LAN
1. `Tools > Wake on LAN`.
2. Select the target computers (must support WoL in BIOS/NIC and be reachable on the LAN/subnet).
3. Send the wake (magic packet) to power them on.

### Worked example (off-hours maintenance window)
A 1,000-PC office wants patches applied without leaving machines on all night. The admin schedules **shutdown at 19:00** with a 10-minute user warning, then a **Wake-on-LAN** at 02:00 to power the fleet on for an automated patch/deployment window, followed by another shutdown at 04:00. Idle daytime draw is cut by a power scheme (display off after 10 min, sleep after 30). The System Up-time report and Power Calculator quantify the resulting savings for the ESG report.

### UX research hooks / friction points
- **Savings are abstract** until quantified — the Power Calculator and up-time report help, but a live "estimated savings to date" dashboard would reinforce adoption.
- **WoL prerequisites** (BIOS/NIC settings, subnet/broadcast reachability) are a common stumbling block; an in-console readiness check would help.
- **User disruption risk** — scheduled shutdown can close unsaved work; clear warning/grace-period messaging is essential.
- **Scheme scoping** by branch/department/role relies on custom groups; a guided scope picker reduces misconfiguration.
- **No measured per-device energy** — savings are estimates, not metered kWh; sustainability owners increasingly want actuals.

## 3. PM lens

### Value & positioning
Power management is positioned as a cost-saving and sustainability ("Go Green") capability inside the unified console — no separate tool needed. The quantified claims (up to 76% energy-cost savings from off-hours shutdown; ~25% from disabling screen savers) make a direct CFO/ESG case.

### Personas & use cases
- **IT operations / facilities** — cut energy bills across large fleets.
- **Sustainability / ESG owner** — reduce carbon footprint; report on green initiatives.
- **IT admin** — combine WoL + off-hours shutdown to enable maintenance windows without leaving machines on 24/7.

### Edition gating & expansion opportunities
- Bundled in paid editions as a configuration/tool; Free edition limited (inferred).
- **Expansion:** per-device measured energy/cost dashboards (kWh, currency, CO2) rather than estimates; macOS/Linux power-scheme parity; policy recommendations driven by actual idle telemetry; integration of WoL with patch/deployment scheduling for fully automated off-hours maintenance; battery-health analytics for laptops.

## 4. Developer / Technical lens

### Mechanics & data collection
- Power schemes are delivered as configurations to endpoints, setting OS power-plan parameters (display/disk timeout, sleep/hibernate, screen-saver off).
- Shutdown actions are scheduled tasks executed by the agent; WoL sends a magic packet over the LAN to power on a NIC configured for wake.
- The agent reports up-time data used by the System Up-time report; the Power Calculator estimates savings from off-hours shutdown.

### Ports / protocols
- **Wake-on-LAN** uses the magic packet (UDP, typically port 7 or 9) broadcast on the target's subnet; cross-subnet WoL requires a relay/distribution server or directed broadcast (inferred).
- Agent↔server: on-prem **8020** (config/data) and **8027** (on-demand, including remote shutdown); cloud **443** to `desktopcentral.manageengine.com` / `dms.zoho.com`.

### Wake-on-LAN prerequisites (checklist)
- WoL enabled in the target's **BIOS/UEFI** and in the **NIC** power-management settings ("Allow this device to wake the computer").
- Target reachable on the LAN; for cross-subnet wake, a **distribution server** or directed-broadcast relay is required (inferred).
- Machine plugged in (WoL from full power-off may need "deep sleep"/ErP disabled in BIOS).

### Limits
- WoL requires BIOS/NIC support and subnet reachability; cross-subnet wake needs additional infrastructure (inferred).
- Power schemes documented primarily for **Windows**; broader OS parity not confirmed (inferred).
- Savings figures (76% / 25%) are headline estimates, not per-device measured values.
- No native metered energy/CO2 reporting; output is up-time + estimated savings (inferred gap).

## 5. Support / Troubleshooting lens

| Symptom | Likely cause | Fix |
|---|---|---|
| WoL doesn't wake a machine | WoL disabled in BIOS/NIC, or magic packet can't reach the subnet | Enable WoL in BIOS and NIC power settings; ensure the machine is on the same subnet or use a distribution server/relay. |
| Power scheme not applied | Configuration not targeted/deployed, or agent offline | Verify target scope; redeploy; confirm agent health. |
| Scheduled shutdown didn't run | Machine off/asleep at trigger time, or schedule misconfigured | Confirm the schedule and the machine's state; pair with WoL if needed. |
| Users losing unsaved work | No grace period/warning on shutdown | Configure a warning message/grace period before shutdown. |
| Up-time report empty | Agent not reporting or no data window yet | Confirm agent connectivity; allow data to accumulate. |

### FAQs
- *How much can I save?* Up to 76% of energy cost from off-hours shutdown; ~25% by disabling screen savers (headline estimates).
- *Can I power machines back on remotely?* Yes — Wake-on-LAN (`Tools > Wake on LAN`).
- *Where do I see results?* The System Up-time report (Power Management Reports) and the Power Calculator.
- *Can I scope schemes by department?* Yes — target configurations via custom groups (branch/department/role).
- *Does WoL work across subnets?* Not by default — it needs a relay/distribution server or directed broadcast (inferred).

## Cross-references
- [it-asset-management.md](it-asset-management.md) — parent module; power management is one of the ITAM-adjacent capabilities.
- [software-deployment.md](software-deployment.md) / patch management — pair Wake-on-LAN + off-hours shutdown to run maintenance windows.

## Sources
- https://www.manageengine.com/products/desktop-central/desktop-power-management.html
- https://www.manageengine.com/products/desktop-central/apply-power-schemes.html
- https://www.manageengine.com/products/desktop-central/shutdown-inactive-computers.html
- https://www.manageengine.com/products/desktop-central/turn-off-screensavers.html
- https://www.manageengine.com/products/desktop-central/power-management-report.html
- https://www.manageengine.com/products/desktop-central/calculate-power-savings.html
- https://www.manageengine.com/products/desktop-central/help/wake_on_lan_tool.html
- https://www.manageengine.com/products/desktop-central/it-asset-management.html
