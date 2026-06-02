# FleetConnect Live Booking Insert Debug Report

Phase: 5.8 - Live Booking Insert Primary Key Fix + Dashboard Visibility Debug
Date: 2026-06-02
Branch: `checkpoint/production-baseline-phase-5-4`

## Issue

Live guest booking from:

`https://rpk-mu.vercel.app/#booking`

failed with:

`duplicate key value violates unique constraint "bookings_pkey"`

Dashboard login now works, but a recent booking was not visible in the operator dashboard.

## Primary Key Root Cause

The PV frontend generated booking IDs with a browser-local counter:

`T-PV-YYYYMMDD-001`

The counter was stored in `localStorage`, so a fresh browser, cleared browser storage, or another device could generate the same ID on the same day.

Live evidence showed an existing booking:

`T-PV-20260602-001`

The live `create_public_booking(payload jsonb)` RPC trusted `payload.id`, so the repeated frontend ID caused the primary-key collision.

This was not a sequence/default issue. The `bookings.id` column is text and has no database default.

## Fix Applied

Frontend:

- Removed frontend-supplied `id` from `PV/PV.html`.
- Removed frontend-supplied `id` from `PV/klantenportaalpv.html`.
- Both pages now display and trigger email with the server-generated `savedBookingId`.

Database/RPC:

- Added migration `supabase/migrations/20260602020000_public_booking_id_generation.sql`.
- Replaced `create_public_booking(payload jsonb)` so it never trusts public client IDs.
- The RPC now generates IDs server-side:

`FC-YYYYMMDDHHMMSSMS-randomsuffix`

Live RPC update was applied through Supabase Management API.

## Rollback-Safe Validation

Validation executed two inserts inside a transaction with the same client-supplied ID:

`T-PV-20260602-001`

Results:

- first generated ID: `FC-20260602210924827-ea441cbf`
- second generated ID: `FC-20260602210924854-c7d23803`
- first status: `pending`
- second status: `pending`
- IDs unique: `true`
- transaction rolled back
- persisted rollback rows: `0`

Validation result:

PASS.

## Dashboard Visibility Diagnosis

Correct dashboard workflow:

1. Open `https://rpk-mu.vercel.app/Paneel/admin-index.html`.
2. Login with a real Supabase Auth account.
3. Choose Taxi/Onderaannemer.
4. Dashboard opens `https://rpk-mu.vercel.app/Paneel/onderaannemerA.html`.
5. New guest bookings with `status = 'pending'` appear in the `Nieuwe Orders` tab.

Dashboard code evidence:

- `Paneel/onderaannemerA.html` reads from `bookings`.
- It does not read legacy `boekingen`.
- It classifies `status === 'pending'` into `newOrders`.
- It renders pending bookings in the New Orders table.

Live RLS/operator evidence:

`is_operator()` returns true only when the logged-in Supabase Auth user has a matching row in `partners.user_id` where `is_hoofd = true`.

Sanitized live mapping:

- hoofd partner `id = 1`: no `user_id`
- hoofd partner `id = 3`: no `user_id`
- hoofd partner `id = 13`: has `user_id`

Therefore, if the logged-in account is not mapped to the `id = 13` hoofd partner user, RLS will block booking visibility even though login succeeds.

## Email Readiness

PV booking still calls:

`BOOKING_CONFIRMATION`

`send-email` remains:

- JWT enabled
- Vercel origin allowlisted
- unauthorized-origin rejection retained
- no wildcard CORS
- no service-role key signal

After the insert fix, confirmation email should fire after a successful booking insert. No real email was sent by this validation.

## Next Test

1. Redeploy the latest checkpoint branch commit to Vercel.
2. Open `https://rpk-mu.vercel.app/PV/PV.html` or `https://rpk-mu.vercel.app/#booking`.
3. Submit a fresh guest booking.
4. Confirm no duplicate primary-key error appears.
5. Confirm the success alert shows an `FC-...` booking ID.
6. Open `https://rpk-mu.vercel.app/Paneel/admin-index.html`.
7. Login with the mapped hoofd-partner Supabase Auth account.
8. Choose Taxi/Onderaannemer.
9. Check the `Nieuwe Orders` tab.
10. Confirm `functions/v1/send-email` returns success in browser Network.
11. Check inbox/spam for the booking confirmation.

