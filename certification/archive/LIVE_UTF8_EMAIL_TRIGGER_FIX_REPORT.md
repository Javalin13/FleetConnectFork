# FleetConnect Phase A.4.2 UTF-8 + Email Trigger Fix Report

Date: 2026-06-11
Repository: Javalin13/FleetConnectFork
Branch: phase-a4.2-utf8-email-trigger-fix

## Scope

Live validation after the Google Maps modernization confirmed that route suggestions, distance, duration, positive pricing, and booking persistence were working. Two blockers remained:

- Visible UTF-8/mojibake corruption on active public booking pages.
- Successful bookings still showed that the automatic confirmation email could not be sent.

No Stripe, dashboard workflow, Supabase RLS, database schema, dispatch lifecycle, B2B portal, Client Portal, Partner Portal, or SEO rollout changes were made.

## Files Repaired

- PV/PV.html
- PV/PV_fr.html
- PV/PV_en.html
- PV.html
- PV_fr.html
- PV_en.html

## UTF-8 / Mojibake Repair

The active/root NL, FR, and EN public booking pages already declared UTF-8. The visible problem was corrupted text content inside the HTML. The repair replaced corrupted production UI strings with valid UTF-8 text or stable FontAwesome/plain-text equivalents.

Examples repaired:

- Broken Belgium/French accent text.
- Broken step labels and ride summary separators.
- Broken vehicle emoji/symbol placeholders.
- Broken payment and price display text.
- Broken button arrows/check symbols.
- Remaining French contact alert mojibake.

Validation result:

- Scoped mojibake scan found no remaining matches for `Ã`, `Â`, `â`, `ðŸ`, replacement characters, `Petit problème`, or `Une erreur s'est produite` in the active/root booking pages and scoped dashboard files.
- All six active/root public booking page inline scripts parsed successfully.

## Booking Confirmation Email Trigger Repair

Root cause:

After `create_public_booking` succeeded, the browser triggered `BOOKING_CONFIRMATION` using only the generated booking ID. The communication service then attempted to rehydrate the booking snapshot through the anonymous browser Supabase client. Under production RLS this can fail even though the booking insert is valid, causing a false email failure after a successful booking.

Minimal fix:

- Keep `create_public_booking`.
- Keep the JWT-protected `send-email` architecture.
- Keep RLS unchanged.
- Pass the booking snapshot already validated and submitted by the page into `BOOKING_CONFIRMATION`.
- Log exact delivery failure details to the browser console when the Edge Function/provider returns an error.
- Continue showing the customer a truthful message: email success only when the email trigger reports success.

Validation result:

- All six active/root public booking pages still call `create_public_booking`.
- All six active/root public booking pages now call `BOOKING_CONFIRMATION` with `{ snapshot: emailSnapshot }`.
- All six active/root public booking pages log `BOOKING_CONFIRMATION delivery failed` with booking ID and provider error when delivery fails.

## Static Validation

Completed:

- Mojibake/error-text scan for scoped files.
- NL/FR/EN active/root inline script parsing.
- Google Maps module syntax check.
- Communication service syntax check.
- Resend provider syntax check.
- Public booking pages still use `create_public_booking`.
- No direct public `bookings.insert` path found in scoped public booking pages.

## Live Retest Required

After Vercel redeploy:

1. Open `/nl`, `/fr`, and `/en`.
2. Confirm public booking pages render without visible mojibake or broken emoji/symbol text.
3. Submit one controlled booking with Google-selected pickup/dropoff addresses.
4. Confirm route distance/time and positive price still calculate before checkout.
5. Confirm the booking saves through `create_public_booking`.
6. Confirm `functions/v1/send-email` returns success in browser Network.
7. Confirm the customer receives `BOOKING_CONFIRMATION`.
8. Confirm no technical escalation is sent for a successful confirmation.
9. If email still fails, capture the browser console line beginning `BOOKING_CONFIRMATION delivery failed` and the Network response body.

## Status

Repository hotfix completed. Production certification still requires live browser and inbox validation after deployment.
