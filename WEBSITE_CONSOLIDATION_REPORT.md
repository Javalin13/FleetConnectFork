# Website Consolidation Report

Date: 2026-06-08

## Implementations Audited

- FleetConnect legacy/root taxi pages.
- PV pages under `/PV`.
- NH/KMS7 pages under `/NH`.

## Findings

- `/PV/PV.html` is the current best production candidate because it has the repaired public booking RPC and communication trigger path.
- `/PV` has NL/FR/EN public booking pages and customer portal pages.
- `/NH` has a visually complete KMS7 implementation but uses direct booking inserts and separate login/client portal assumptions.
- Legacy/root FleetConnect pages contain older patterns and should not be the Phase A production entry point.

## Recommendation

Canonical public website for Phase A should be `/PV/PV.html` on the active Vercel deployment.

Do not delete alternate implementations yet. Keep them as reference until a formal consolidation migration is approved.
