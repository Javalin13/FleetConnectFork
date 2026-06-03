# FleetConnect Live Operator Mapping And UX Fix Report

Phase: 5.11 - Operator mapping fix, UX latency, and fiche modal close button
Date: 2026-06-03
Branch: checkpoint/production-baseline-phase-5-4

## Scope

This phase addressed live findings after Phase 5.10:

- Partner creation reached the new RPC but failed with `Operator access required`.
- PV booking confirmation popup appeared too slowly.
- Dashboard booking acceptance felt too slow.
- Booking fiche modal needed a visible top-right close button that remains accessible without scrolling.

No UI redesign, broad RLS policy change, anonymous write access, Stripe change, or workflow redesign was performed.

## Operator Mapping Diagnosis

Live evidence:

- Most recent Supabase Auth sign-in:
  - email: `admin@ryzen.be`
  - uid: `7208ebda-dfec-42bc-8684-996e7d110cf2`
  - last sign-in: `2026-06-03T07:02:09.246844+00:00`
- Existing hoofd partner mappings before fix:
  - partner `1` / `Eigen onderneming`: `user_id = null`
  - partner `3` / `FleetConnect Main`: `user_id = null`
  - partner `13` / `Iliass`: `user_id = b1b29742-62ab-49a2-a63e-8a4eb47559ba`
- Public bookings and existing drivers are under `partner_id = 1`.

Root cause:

- The active dashboard user was `admin@ryzen.be`, but that auth user was not mapped to any `partners.user_id` row with `is_hoofd = true`.
- The new RPC correctly reached Supabase and correctly enforced `is_operator()`.
- The failure was therefore not an RLS regression and not an RPC grant issue; it was an operator mapping issue.

## Live Mapping Fix

Live data change performed:

```sql
update public.partners
set user_id = '7208ebda-dfec-42bc-8684-996e7d110cf2'
where id = 1
  and user_id is null
  and coalesce(is_hoofd, false) = true;
```

Result:

- partner `1` is now mapped to `admin@ryzen.be`.
- partner `13` remains mapped to `iliass.el.krichi@gmail.com`.
- partner `3` remains unmapped.
- No policies were broadened.
- No unrelated user mappings were modified.

## Operator RPC Validation

Rollback-only validation under simulated active admin UID:

- `create_operator_partner(payload jsonb)` succeeded.
- `create_operator_driver(payload jsonb)` succeeded for `partner_id = 1`.
- Transaction rolled back.
- Post-rollback persisted test rows:
  - partners: `0`
  - drivers: `0`

Conclusion:

- Partner creation should now work for the active dashboard login `admin@ryzen.be`.
- Driver creation should now work for the active dashboard login `admin@ryzen.be`.
- Dashboard remains protected by `is_operator()`.

## PV Booking Confirmation Latency Fix

Files changed:

- `PV/PV.html`
- `PV/klantenportaalpv.html`

Before:

- Browser waited for `BOOKING_CONFIRMATION` email send before showing the booking confirmation popup.

After:

- Booking insert still completes first.
- The popup appears immediately after a successful database save and server-generated booking ID.
- `BOOKING_CONFIRMATION` still runs, but it runs in the background.
- If email fails, the page shows a secondary honest failure message.
- Double-click guard remains active.

Customer-facing behavior:

- The initial message says the booking was saved and the confirmation email is being sent.
- It no longer claims the email was already delivered before the email result is known.

## Dashboard Accept Latency Fix

File changed:

- `Paneel/onderaannemerA.html`

Before:

- Accept action waited for:
  - database status update
  - `BOOKING_ACCEPTED` email trigger
  - full dashboard refresh
  - modal close

After:

- Database status update must still succeed first.
- Local dashboard state updates immediately from `pending` to `accepted`.
- Modal closes immediately.
- Toast shows accepted status immediately.
- `BOOKING_ACCEPTED` still runs in the background.
- If email fails, dashboard shows an error toast.

The booking is never marked accepted unless the database update succeeds.

## Booking Fiche Modal Close Button

File changed:

- `Paneel/onderaannemerA.html`

Fix:

- Existing top header close button was kept.
- Header is now sticky inside the scrollable modal.
- Close button now has:
  - visible circular hit target
  - hover state
  - `type="button"`
  - `aria-label="Sluit fiche"`
  - `title="Sluit fiche"`

The bottom `Sluiten` button remains.

## Validation

Static validation:

- `PV/PV.html` no longer awaits `BOOKING_CONFIRMATION`.
- `PV/klantenportaalpv.html` no longer awaits `BOOKING_CONFIRMATION`.
- `Paneel/onderaannemerA.html` no longer awaits `BOOKING_ACCEPTED`.
- `BOOKING_ACCEPTED` still triggers.
- `BOOKING_CONFIRMATION` still triggers.
- Partner and driver creation still call `create_operator_partner` and `create_operator_driver`.
- Modal X exists and is sticky/accessible.

Live validation:

- partner `1` mapped to active admin UID.
- partner `13` mapping preserved.
- rollback-only partner creation passed.
- rollback-only driver creation passed.
- rollback test rows persisted: `0`.

## Remaining Live Browser Tests

1. Redeploy latest checkpoint branch.
2. Login as `admin@ryzen.be`.
3. Create a partner from dashboard.
4. Create a driver from dashboard.
5. Submit a PV booking and confirm popup appears immediately after save.
6. Confirm customer email still sends.
7. Accept a booking and confirm dashboard updates immediately.
8. Confirm `BOOKING_ACCEPTED` email still sends.
9. Open `Bekijk Fiche`, scroll modal body, and confirm top-right X remains usable.

## Status

Operator mapping: RESOLVED LIVE

Partner creation: ROLLBACK-VALIDATED LIVE, PENDING BROWSER RETEST

Driver creation: ROLLBACK-VALIDATED LIVE, PENDING BROWSER RETEST

PV popup latency: RESOLVED IN REPOSITORY

Dashboard accept latency: RESOLVED IN REPOSITORY

Fiche close button: RESOLVED IN REPOSITORY

Certification status: NOT CERTIFIED
