# FleetConnect Phase A - Deployment Discovery Report

Date: 2026-06-08
Repository: https://github.com/Javalin13/FleetConnect
Branch: fixes
Scope: Repository-only deployment and entry-point discovery. No application logic was changed.

## Summary

The repository currently identifies one active Vercel deployment for FleetConnect validation:

- https://rpk-mu.vercel.app

The Vercel routing file rewrites the deployment root to the PV booking page:

- `/` -> `/PV/PV.html`

No repository-configured Vercel project ID, `.vercel` metadata, preview deployment URL, or Vercel domain alias file was found. Preview deployments may exist in Vercel, but they are not discoverable from committed repository files.

## Evidence Reviewed

- `vercel.json`
- `src/modules/communication/core/config.js`
- `src/modules/communication/core/routes.js`
- `supabase/functions/send-email/index.ts`
- `FINAL_VALIDATION_CHECKLIST.md`
- `LIVE_SMOKE_TEST_DEBUG_REPORT.md`
- `LIVE_BOOKING_INSERT_DEBUG_REPORT.md`
- `LIVE_BOOKING_EMAIL_REHYDRATION_REPORT.md`
- `LIVE_CTA_AND_PARTNER_RLS_FIX_REPORT.md`
- `README.md`
- `PV/*`
- `NH/*`
- `Paneel/*`
- root driver accept/decline pages

## Vercel Configuration

`vercel.json` contains a single root rewrite:

```json
{
  "rewrites": [
    {
      "source": "/",
      "destination": "/PV/PV.html"
    }
  ]
}
```

Implication:

- `https://rpk-mu.vercel.app/` should serve the PV booking page.
- Direct static routes should still be tested by full path.

## Configured Domains And URL Evidence

### Active validation deployment

- `https://rpk-mu.vercel.app`

Evidence:

- `src/modules/communication/core/config.js` uses `https://rpk-mu.vercel.app` as the production fallback base URL.
- `LIVE_SMOKE_TEST_DEBUG_REPORT.md` lists `https://rpk-mu.vercel.app/` as the production URL.
- `FINAL_VALIDATION_CHECKLIST.md` uses `https://rpk-mu.vercel.app` for dashboard, PV booking, and customer CTA validation.
- `supabase/functions/send-email/index.ts` includes `https://rpk-mu.vercel.app` in `ALLOWED_ORIGINS`.

### FleetConnect domain candidates

- `https://fleetconnect.be`
- `https://www.fleetconnect.be`

Evidence:

- `supabase/functions/send-email/index.ts` includes both in `ALLOWED_ORIGINS`.
- Historical certification reports identify `fleetconnect.be` as previously configured but unavailable for active CTA testing.
- `LIVE_CTA_AND_PARTNER_RLS_FIX_REPORT.md` records that active CTA generation was moved away from `fleetconnect.be` for deployed testing.

Status:

- Do not use `fleetconnect.be` for Phase A live validation unless DNS/deployment ownership is separately confirmed.

### NH/KMS7 domain candidates

- `https://www.kms7.be/nl/`

Evidence:

- `NH/KMS7_nl.html` contains canonical and OpenGraph URL metadata pointing to `https://www.kms7.be/nl/`.

Status:

- Repository evidence shows a KMS7 canonical URL, but no deployment binding or Vercel domain mapping for `www.kms7.be` is committed.
- For repo/Vercel validation, use the active Vercel host with `/NH/...` paths unless an external DNS/deployment check confirms `www.kms7.be` is live.

## 1. FleetConnect Live URL(s)

Use for Phase A validation:

- `https://rpk-mu.vercel.app/`

Direct FleetConnect/PV booking path:

- `https://rpk-mu.vercel.app/PV/PV.html`

Notes:

- Root `/` rewrites to `/PV/PV.html`.
- `src/modules/communication/core/routes.js` builds production CTA links from `window.location.origin`, falling back to `https://rpk-mu.vercel.app`.

## 2. PV Live URL(s)

Primary PV booking entry points:

- `https://rpk-mu.vercel.app/`
- `https://rpk-mu.vercel.app/#booking`
- `https://rpk-mu.vercel.app/PV/PV.html`
- `https://rpk-mu.vercel.app/PV/PV.html#booking`

PV language variants:

- `https://rpk-mu.vercel.app/PV/PV.html` - NL
- `https://rpk-mu.vercel.app/PV/PV_fr.html` - FR
- `https://rpk-mu.vercel.app/PV/PV_en.html` - EN

PV service pages linked from PV navigation:

- `https://rpk-mu.vercel.app/PV/PV_Exclusieve_Service.html`
- `https://rpk-mu.vercel.app/PV/PV-vaste-prijzen.html`
- `https://rpk-mu.vercel.app/PV/PV-premium-vloot.html`
- `https://rpk-mu.vercel.app/PV/PV_Luchthavenvervoer.html`
- `https://rpk-mu.vercel.app/PV/PV_Zakelijk_Vervoer.html`
- `https://rpk-mu.vercel.app/PV/PV_Events_Gala.html`
- `https://rpk-mu.vercel.app/PV/PV_Koeriersdienst.html`

## 3. NH/KMS7 Live URL(s)

Repository paths on the active Vercel deployment:

- `https://rpk-mu.vercel.app/NH/KMS7.html` - FR public booking page
- `https://rpk-mu.vercel.app/NH/KMS7_nl.html` - NL public booking page
- `https://rpk-mu.vercel.app/NH/KMS7_en.html` - EN public booking page
- `https://rpk-mu.vercel.app/NH/LoginKMS7.html` - KMS7 customer login
- `https://rpk-mu.vercel.app/NH/ClientKMS7.html` - FR customer portal
- `https://rpk-mu.vercel.app/NH/ClientKMS7_nl.html` - NL customer portal
- `https://rpk-mu.vercel.app/NH/ClientKMS7_en.html` - EN customer portal
- `https://rpk-mu.vercel.app/NH/VerificatieKMS7.html` - KMS7 verification page

External canonical candidate found in metadata:

- `https://www.kms7.be/nl/`

Status:

- Treat `www.kms7.be` as unverified for Phase A unless DNS/deployment is manually confirmed.
- The committed Vercel config does not map `/NH` as root; use explicit `/NH/...` paths on `rpk-mu.vercel.app` for repository-based tests.

## 4. Dashboard URL(s)

Primary operator dashboard login:

- `https://rpk-mu.vercel.app/Paneel/admin-index.html`

Operator panel after login / Taxi-Onderaannemer selection:

- `https://rpk-mu.vercel.app/Paneel/onderaannemerA.html`

Other dashboard/login pages present but not primary operator validation targets:

- `https://rpk-mu.vercel.app/Paneel/partner-login.html`
- `https://rpk-mu.vercel.app/Paneel/partnerspaneel.html`
- `https://rpk-mu.vercel.app/Paneel/driver-login.html`
- `https://rpk-mu.vercel.app/Paneel/driverpaneel.html`

Caution:

- `Paneel/partnerspaneel.html` is labeled in the source title as demo-oriented.
- Current smoke-test documentation identifies `Paneel/admin-index.html` as the correct production dashboard login.

## 5. Customer Portal URL(s)

PV customer portal:

- `https://rpk-mu.vercel.app/PV/klantenportaalpv.html`
- `https://rpk-mu.vercel.app/PV/klantenportaalpv.html?id=<BOOKING_ID>`
- `https://rpk-mu.vercel.app/PV/klantenportaalpv_fr.html`
- `https://rpk-mu.vercel.app/PV/klantenportaalpv_en.html`

PV account/register flow:

- `https://rpk-mu.vercel.app/PV/register.html`
- `https://rpk-mu.vercel.app/PV/register.html?booking=<BOOKING_ID>`

KMS7 customer portals:

- `https://rpk-mu.vercel.app/NH/ClientKMS7.html`
- `https://rpk-mu.vercel.app/NH/ClientKMS7_nl.html`
- `https://rpk-mu.vercel.app/NH/ClientKMS7_en.html`

Legacy/root customer portal pages present:

- `https://rpk-mu.vercel.app/klantenportaal.html`
- `https://rpk-mu.vercel.app/loginfleetconnect.html`

Caution:

- Legacy/root pages are not the preferred PV Phase A validation targets unless explicitly added to scope.

## 6. Login URL(s)

Primary operator login:

- `https://rpk-mu.vercel.app/Paneel/admin-index.html`

PV customer login:

- `https://rpk-mu.vercel.app/PV/index.html`

PV registration:

- `https://rpk-mu.vercel.app/PV/register.html`

PV verification:

- `https://rpk-mu.vercel.app/PV/verificatiepv.html`

KMS7 customer login:

- `https://rpk-mu.vercel.app/NH/LoginKMS7.html`

Partner/driver standalone pages present:

- `https://rpk-mu.vercel.app/Paneel/partner-login.html`
- `https://rpk-mu.vercel.app/Paneel/driver-login.html`

Driver assignment action links:

- `https://rpk-mu.vercel.app/driver-accept.html?token=<ASSIGNMENT_TOKEN>`
- `https://rpk-mu.vercel.app/driver-decline.html?token=<ASSIGNMENT_TOKEN>`

## 7. Deployment To Use For Test 1 And Test 2

### Test 1 - Deployment Validation

Use:

- `https://rpk-mu.vercel.app/`

Required route checks:

- `/`
- `/PV/PV.html`
- `/PV/klantenportaalpv.html`
- `/PV/register.html`
- `/PV/index.html`
- `/Paneel/admin-index.html`
- `/Paneel/onderaannemerA.html`
- `/driver-accept.html`
- `/driver-decline.html`

Optional KMS7 route checks if NH/KMS7 is in Phase A scope:

- `/NH/KMS7.html`
- `/NH/KMS7_nl.html`
- `/NH/KMS7_en.html`
- `/NH/LoginKMS7.html`
- `/NH/ClientKMS7.html`

### Test 2 - Customer Booking Flow

Use the PV production validation flow:

- `https://rpk-mu.vercel.app/PV/PV.html#booking`

Acceptable equivalent because of the root rewrite:

- `https://rpk-mu.vercel.app/#booking`

Recommended canonical manual test URL:

- `https://rpk-mu.vercel.app/PV/PV.html#booking`

Reason:

- The explicit path avoids ambiguity during manual evidence collection while still testing the same PV booking form.

## 8. Deprecated Or Old URLs That Should NOT Be Tested

Do not use these as Phase A validation targets unless separately reactivated and verified:

- `https://fleetconnect.be`
- `https://www.fleetconnect.be`
- `https://github.com/iliasselkrichi-source/RPK`
- `https://github.com/iliasselkrichi-source/RPK.git`
- `https://github.com/iliasselkrichi-source/RPK/tree/phase-5-translation-completion-12446749144153236637`
- `https://jouwdomein.be/*`
- `http://localhost:3000`
- `http://127.0.0.1:5500`

Notes:

- `fleetconnect.be` remains in the send-email origin allowlist, but prior live reports identify it as unavailable/old for active CTA testing.
- `localhost` and `127.0.0.1` are development-only.
- Old `iliasselkrichi-source/RPK` repository URLs are historical certification artifacts, not the canonical repository.
- `www.kms7.be` is present as KMS7 page metadata but is not proven by committed Vercel configuration. Do not use it as the primary Phase A URL without manual DNS/deployment confirmation.

## Deployment Discovery Verdict

Use `https://rpk-mu.vercel.app` for Phase A Test 1 and Test 2.

Primary Test 1 route:

- `https://rpk-mu.vercel.app/`

Primary Test 2 route:

- `https://rpk-mu.vercel.app/PV/PV.html#booking`

Primary dashboard route for operator validation:

- `https://rpk-mu.vercel.app/Paneel/admin-index.html`

No application logic changes were made for this discovery report.
