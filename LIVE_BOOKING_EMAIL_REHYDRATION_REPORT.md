# FleetConnect Live Booking Email Rehydration Report

Phase: 5.9 - Live booking email rehydration and dashboard visibility fix
Date: 2026-06-03
Branch: checkpoint/production-baseline-phase-5-4

## Scope

This phase addressed the live smoke-test result after commit `493282f5a16f2833a6d60190022dfa1729728672`:

- Guest booking insert succeeds and returns an `FC-...` booking ID.
- Customer did not receive the booking confirmation email.
- Ryzen received duplicate technical escalation emails for `BOOKING_CONFIRMATION`.
- The saved booking was not visible to the tester under dashboard `Nieuwe Orders`.

No Stripe, RLS, schema, migration, UI layout, workflow redesign, or Supabase policy changes were made.

## Root Cause - Snapshot Rehydration

`CommunicationService.trigger('BOOKING_CONFIRMATION', savedBookingId, supabase)` attempted to rehydrate the booking with:

```js
DataNormalizer.rehydrateBookingSnapshot(bookingId, supabaseClient)
```

That rehydration path performs a browser-side `bookings.select('*').eq('id', bookingId).single()`.

For public PV bookings, the Supabase client is anonymous. Live RLS correctly blocks anonymous reads from `bookings`, so the booking was saved but the confirmation flow failed before rendering/sending the customer email.

This was not caused by the generated `FC-...` ID format. The live rows exist with `FC-...` IDs and `pending` status.

## Minimal Fix Applied

Files changed:

- `src/modules/communication/index.js`
- `PV/PV.html`
- `PV/klantenportaalpv.html`

Changes:

- `CommunicationService.trigger()` now accepts `options.snapshot`.
- PV booking pages pass a trusted snapshot built from the submitted payload plus the server-generated `FC-...` ID.
- If no snapshot is supplied, existing rehydration behavior is preserved for authenticated/operator flows.
- Booking success popups now distinguish:
  - booking saved and confirmation email sent
  - booking saved but confirmation email failed and requires manual follow-up
- Submit handlers now guard against duplicate in-flight booking submissions.
- Technical escalation now deduplicates the same trigger/entity/error in the current page session.

## Duplicate Technical Escalation

Live evidence showed two recent `FC-...` rows for the same email within roughly two seconds:

- `FC-20260602211540000-2db77323`, `pending`, `partner_id = 1`
- `FC-20260602211538279-60092022`, `pending`, `partner_id = 1`

This is consistent with duplicate submit/trigger behavior during the failed email path. The in-flight guard prevents a second browser submission while the first save/email flow is running. The communication service also suppresses duplicate technical escalation for the same trigger/entity/error in one page session.

## Dashboard Visibility Evidence

Live read-only Supabase evidence:

- Latest PV bookings exist in `public.bookings`.
- Latest PV bookings have `status = pending`.
- Latest PV bookings have `partner_id = 1`.
- Pending count by partner:
  - `partner_id = 1`: 8 pending bookings
  - `partner_id = 13`: 7 pending bookings
- Hoofd partner mapping:
  - `id = 1`: `user_id = null`
  - `id = 3`: `user_id = null`
  - `id = 13`: mapped to one Supabase Auth user
- Drivers exist only for `partner_id = 1`.

Repository dashboard evidence:

- `/Paneel/onderaannemerA.html` reads from `bookings`, not legacy `boekingen`.
- `Nieuwe Orders` is populated from `status === 'pending'`.
- Driver assignment options are scoped to `booking.partner_id`.

Conclusion:

- The booking is not missing from Supabase.
- The dashboard implementation should include `pending` rows when the logged-in auth user passes `is_operator()`.
- Do not move public bookings to `partner_id = 13`, because current driver assignment data lives under `partner_id = 1`.
- If the booking remains invisible after redeploy, verify the tester is logged in as the mapped hoofd-operator auth user and is viewing `Nieuwe Orders`.

## Validation Performed

Static checks:

- `BOOKING_CONFIRMATION` still appears once in each PV booking page.
- `bookingSubmitInProgress` guard exists in both PV booking pages.
- Snapshot handoff exists in both PV booking pages.
- `options.snapshot` fallback exists in `CommunicationService.trigger()`.
- `send-email` still allowlists `https://rpk-mu.vercel.app`.
- `send-email` still contains explicit unauthorized-origin rejection.

Live read-only checks:

- Latest bookings confirmed in `bookings`.
- Latest bookings confirmed as `pending`.
- Latest bookings confirmed as `partner_id = 1`.
- Hoofd partner/user mapping confirmed.
- Driver partner distribution confirmed.

No live email send was performed by Codex in this phase.

## Required Retest After Deployment

1. Redeploy the checkpoint branch after this commit.
2. Open `https://rpk-mu.vercel.app/#booking` or `/PV/PV.html`.
3. Submit one guest booking with a controlled test inbox.
4. Confirm browser Network:
   - `create_public_booking` succeeds.
   - `functions/v1/send-email` succeeds.
5. Confirm the popup says the confirmation email was sent only if the email call succeeded.
6. Confirm the customer inbox/spam receives the booking confirmation.
7. Confirm Ryzen does not receive a technical escalation for a successful confirmation.
8. Open `https://rpk-mu.vercel.app/Paneel/admin-index.html`.
9. Login with the mapped hoofd-operator Supabase Auth account.
10. Choose Taxi/Onderaannemer and open `Nieuwe Orders`.
11. Confirm the new `FC-...` booking appears.

## Status

Code status: RESOLVED IN REPOSITORY

Live deployment status: BLOCKED PENDING VERCEL REDEPLOY

Inbox status: BLOCKED PENDING LIVE INBOX TESTING

Certification status: NOT CERTIFIED
