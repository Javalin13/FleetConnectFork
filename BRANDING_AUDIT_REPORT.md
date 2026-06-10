# Branding Audit Report

Date: 2026-06-08

## Canonical Brand

- Product: FleetConnect
- Footer/support line: Powered by Ryzen

## Fixed In Active FleetConnect Path

- Active PV booking pages were normalized from NH toward FleetConnect.
- Active PV login/customer portal labels were normalized toward FleetConnect.
- Active operator and driver page titles/labels were normalized where this could be done without changing flow or auth logic.
- Email module already uses FleetConnect as brand name.

## Remaining Branding Occurrences

Known residual categories:

- `NH/*` contains the separate KMS7/NH implementation used for website consolidation audit.
- Legacy/root pages (`Horizon.html`, `bravo.html`, `autodealerpaneel.html`, legacy customer pages) retain old product identities.
- The admin hub still contains cross-module navigation remnants because deleting them would change dashboard flow.

## Risk Classification

- Active PV/operator branding: partially remediated, requires browser confirmation.
- Legacy multi-product branding: requires product-scope decision before public launch.

## Recommendation

Adopt FleetConnect as the single public production brand. Keep alternate implementations as archived/reference surfaces until the website consolidation decision is approved.
