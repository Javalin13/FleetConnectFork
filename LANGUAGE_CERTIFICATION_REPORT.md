# Language Certification Report

Date: 2026-06-08

## Fixes Applied

- Added Vercel rewrites:
  - `/nl` -> `/PV/PV.html`
  - `/fr` -> `/PV/PV_fr.html`
  - `/en` -> `/PV/PV_en.html`
- Preserved `/` -> `/PV/PV.html`.
- Added language-link state preservation on PV language pages so current query/hash state is retained.

## Existing Supported Language Pages

- NL: `/PV/PV.html`
- FR: `/PV/PV_fr.html`
- EN: `/PV/PV_en.html`
- Customer portal language files exist for NL/FR/EN.
- Dashboard translation object supports NL/FR/EN/ES in `Paneel/onderaannemerA.html`.
- Email translations support NL/FR/EN.

## Remaining Validation

- Deploy and confirm `/fr` and `/en` return HTTP 200.
- Confirm language switching from `#booking` stays in the booking section.
- Confirm customer portal language buttons do not lose required booking ID query params.

## Status

Repository remediation complete for root language routing. Live browser validation pending.
