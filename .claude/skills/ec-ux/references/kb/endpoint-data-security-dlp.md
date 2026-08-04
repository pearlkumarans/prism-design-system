# Endpoint Data Security (Overview)

> Umbrella module for protecting data on endpoints — discovery/classification, leak prevention, device/peripheral control, and disk encryption. Edition: primarily **Security Edition** (encryption also in UEM). **DLP is On-Premises only.**

> **This module is split into dedicated files — open the child file for full depth. This page is a navigation overview only (kept short to avoid duplication).**

## Sub-modules

| Sub-module | File | Covers |
|---|---|---|
| Endpoint DLP | [endpoint-dlp.md](endpoint-dlp.md) | Sensitive-data discovery & classification; data-in-use / in-motion / at-rest controls; clipboard, email, upload, print, screen-capture rules; file tracing/mirroring; containerization tagging |
| Device Control | [device-control.md](device-control.md) | USB & all peripheral device-class control; allow/block/read-only/trusted; temporary access; USB encrypt-on-write; file shadowing; **legacy USB device management** |
| BitLocker / FileVault | [bitlocker-management.md](bitlocker-management.md) | Disk encryption — BitLocker (TPM, recovery-key escrow, automation) + macOS FileVault counterpart |

## How the pieces fit
Data security spans three control points: **find it** (DLP discovery & classification), **stop it leaving** (DLP channel controls + Device Control for physical egress), and **protect it at rest** (BitLocker/FileVault encryption). USB encrypt-on-write bridges Device Control and BitLocker (uses BitLocker-to-Go and shares the recovery-key store). All are enforced by the single Endpoint Central agent and managed from the Security/console policies.

## Cross-references
- Standalone equivalents: [point-products.md](point-products.md) (Endpoint DLP Plus, Device Control Plus)
- Related: [browser-security.md](browser-security.md) (browser DLP), [secure-private-access.md](secure-private-access.md), [application-control-privilege-mgmt.md](application-control-privilege-mgmt.md)

## Sources
- See full Sources lists in the child files: [endpoint-dlp.md](endpoint-dlp.md), [device-control.md](device-control.md), [bitlocker-management.md](bitlocker-management.md).
