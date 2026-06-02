# FleetConnect Live Smoke Test Debug Report

Phase: 5.7 - Live Deployment Smoke Test Debug
Date: 2026-06-02
Branch: `checkpoint/production-baseline-phase-5-4`
Production URL: `https://rpk-mu.vercel.app/`

## Summary

Two live smoke-test issues were investigated:

1. Dashboard/operator login failed.
2. PV booking confirmation email was not received after a live PV booking submission.

No UI redesign, RLS weakening, Stripe work, dispatch workflow change, or demo credential restoration was performed.

## Live Route Checks

Vercel returned HTTP 200 for:

- `/`
- `/PV/PV.html`
- `/PV/klantenportaalpv.html`
- `/PV/register.html`
- `/driver-accept.html`
- `/driver-decline.html`
- `/Paneel/admin-index.html`
- `/Paneel/onderaannemerA.html`
- `/PV/index.html`

Root routing is therefore no longer the active blocker.

## Dashboard Login Diagnosis

Correct production dashboard login URL:

`https://rpk-mu.vercel.app/Paneel/admin-index.html`

Expected login method:

- Supabase Auth email/password through `supabase.auth.signInWithPassword()`.
- After successful login, the user chooses the Taxi/Onderaannemer panel, which routes to `/Paneel/onderaannemerA.html`.

Findings:

- `Paneel/admin-index.html` had a malformed Supabase anon key, missing the normal JWT `typ`/issuer segment used by the rest of the FleetConnect Supabase client code.
- This can cause Supabase login to fail before the operator dashboard can be reached.
- `PV/index.html` is not the production operator dashboard. It is a demo/session-style customer portal login and should not be used for operator verification.

Minimal fix applied:

- Replaced only the malformed `Paneel/admin-index.html` anon key with the same public Supabase anon key already used by the repaired PV and driver flows.

Operator mapping requirement:

- The dashboard is Supabase-authenticated.
- Live sanitized mapping count shows:
  - hoofd partners: 3
  - mapped hoofd partners: 1
  - unmapped hoofd partners: 2
- If login succeeds but bookings are not visible/operable, the logged-in Supabase auth user must be mapped to `partners.user_id` for a row with `is_hoofd = true`.

Manual mapping check:

```sql
select id, name, is_hoofd, user_id
from public.partners
where is_hoofd = true;
```

## PV Booking Insert Diagnosis

Live read-only booking count:

- bookings last 24h: 11
- bookings last 2h: 1
- latest booking status: `pending`

Conclusion:

- PV booking submission is reaching Supabase.
- `create_public_booking` is compatible enough to create live bookings.
- The inaccessible dashboard caused uncertainty about whether the booking arrived, but live read-only evidence confirms recent booking insertion.

## Booking Confirmation Email Diagnosis

Findings:

- PV booking flow calls `BOOKING_CONFIRMATION` after `create_public_booking`.
- `ResendProvider` invokes the Supabase Edge Function with anon JWT headers.
- Live `send-email` keeps JWT enabled.
- The live Vercel origin `https://rpk-mu.vercel.app` was not present in `send-email` `ALLOWED_ORIGINS`.
- That means the email call from Vercel could be rejected by the hardened origin check even though the booking insert succeeded.

Minimal fix applied:

- Added `https://rpk-mu.vercel.app` to `send-email` `ALLOWED_ORIGINS`.
- Redeployed only the `send-email` Edge Function.

Live send-email validation after redeploy:

- status: ACTIVE
- version: 6
- JWT enabled: true
- Vercel origin present: true
- unauthorized-origin rejection retained: true
- exact wildcard CORS absent: true
- service-role key signal absent: true

Preflight check:

- OPTIONS from `https://rpk-mu.vercel.app` returned HTTP 200.
- `Access-Control-Allow-Origin` returned `https://rpk-mu.vercel.app`.

## Next Live Test Steps

1. Open `https://rpk-mu.vercel.app/Paneel/admin-index.html`.
2. Login with a real Supabase Auth operator account.
3. Click the Taxi/Onderaannemer panel.
4. If the dashboard opens but data is missing, confirm the auth user is mapped to `partners.user_id` for `is_hoofd = true`.
5. Submit a new PV booking from `https://rpk-mu.vercel.app/PV/PV.html`.
6. Watch browser DevTools Network for:
   - `create_public_booking` success.
   - `functions/v1/send-email` HTTP 200.
7. Watch browser console for:
   - `Fout bij boeking`
   - `ResendProvider error`
   - `Unauthorized origin`
   - `JWT`
   - `Missing recipient`
8. Check inbox spam/junk if Network shows `send-email` HTTP 200.
9. Check Supabase `bookings` latest row if Network is unclear.

## Current Verdict

Dashboard login failure root cause: malformed public anon key in `Paneel/admin-index.html`, with possible additional account mapping requirement after login.

Booking insert: live evidence indicates booking insertion works.

Confirmation email failure root cause: live `send-email` origin allowlist did not include Vercel production origin.

Status after fixes: ready for another live browser/inbox smoke test.

