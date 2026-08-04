# Application Control & Privilege Management (Overview)

> Umbrella module for controlling which applications run and with what privileges — zero-trust application governance plus least-privilege enforcement. Edition: **Security Edition** (Application Control Plus / Endpoint Privilege Management).

> **This module is split into dedicated files — open the child file for full depth. This page is a navigation overview only (kept short to avoid duplication).**

## Sub-modules

| Sub-module | File | Covers |
|---|---|---|
| Application Control | [application-control.md](application-control.md) | Allowlist/blocklist, app groups (file/folder/publisher/hash/product/verified-exe/Store apps), Audit vs Strict mode, child-process control, self-updating lists, unmanaged-app handling |
| Endpoint Privilege Management (EPM) | [endpoint-privilege-management.md](endpoint-privilege-management.md) | Admin-rights removal, application-specific elevation (on-reason/on-request/auto), CLSID/Control-Panel elevation, Just-In-Time access, per-app VPN, conditional access, self-elevation |

## How the pieces fit
Application Control decides **what is allowed to run**; EPM decides **what privileges it runs with**. Together they implement zero-trust + least-privilege: block untrusted binaries, strip standing admin rights, and grant temporary, scoped elevation only when justified. Both ship inside Application Control Plus and are enforced by the Endpoint Central agent.

## Cross-references
- Standalone equivalent: [point-products.md](point-products.md) (Application Control Plus, incl. EPM)
- Related: [vulnerability-management.md](vulnerability-management.md), [endpoint-data-security-dlp.md](endpoint-data-security-dlp.md), [browser-security.md](browser-security.md)

## Sources
- See full Sources lists in the child files: [application-control.md](application-control.md), [endpoint-privilege-management.md](endpoint-privilege-management.md).
