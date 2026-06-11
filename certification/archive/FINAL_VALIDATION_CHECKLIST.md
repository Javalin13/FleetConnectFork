# FleetConnect Final Human Validation Checklist

Phase: 5.5 - Launch-Validation Prep
Date: 2026-06-02

## Pre-Validation

1. Deploy repaired frontend.
2. Configure verified Google review URL through `FLEETCONNECT_REVIEW_URL` or `CommunicationConfig.brand.reviewUrl`.
3. Create test customer.
4. Create test operator.
5. Create test driver.

## Browser And Inbox Validation

1. Submit booking.
2. Verify customer booking confirmation email.
3. Accept booking.
4. Verify customer booking accepted email.
5. Assign driver.
6. Verify driver assignment email.
7. Driver accepts.
8. Verify customer assigned-driver email.
9. Driver declines test case.
10. Verify FleetConnect operations notification.
11. Cancel booking.
12. Verify cancellation email.
13. Confirm FleetConnect Operations receives routine lifecycle emails at `fleetconnect.os@gmail.com`.
14. Confirm Ryzen receives only technical escalation/failure emails at `ryzenoutsourcing@gmail.com`.
15. Update certification reports with real browser and inbox evidence.

## Do Not Certify Until

1. Repaired frontend deployment is confirmed.
2. Browser validation passes.
3. Inbox validation passes.
4. Verified Google review URL is configured.
5. A real production ride-completion action exists and `RIDE_COMPLETED` is wired to it.
6. Historical ownership backfill decision is approved or explicitly deferred.
7. Stripe/payment scope remains excluded or credentials/testing are completed.

## Phase A.4.4 Required Live Checks

Date added: 2026-06-11

1. Deploy `phase-a4.4-final-lifecycle-blockers` to Vercel.
2. Confirm typed-only partial address such as `Antwerpen` cannot submit.
3. Confirm Google-selected pickup and dropoff submit successfully.
4. Confirm created booking has `pickup_place_id`, `dropoff_place_id`, `route_distance_km`, `route_duration_min`, and positive `amount`.
5. Confirm booking confirmation email arrives and includes pickup, dropoff, distance, duration, and total price.
6. Confirm operator accepted email still arrives.
7. Confirm driver assignment email still arrives.
8. Confirm driver accepted/customer assigned-driver email shows assigned driver phone when available.
9. Confirm account request submits inside FleetConnect and both notification emails are sent.
10. Confirm archived drivers no longer appear in assignment dropdown and historical bookings remain readable.
11. Keep manual/operator ride creation and review workflow as open gaps unless separately approved.

## Current Verdict

Ready for human validation: YES, for implemented non-Stripe workflows.

Production certified: NO.

## Phase 5.6 Git Checkpoint Evidence To Confirm Before Launch

Before treating the checkpoint as preserved, confirm:

1. Branch `checkpoint/production-baseline-phase-5-4` exists on GitHub.
2. Tag `v0.5.4-production-baseline-audit` exists on GitHub.
3. The branch contains the certification archive.
4. The branch contains `supabase/migrations/20260602000000_phase5_live_remediation.sql`.
5. The branch contains the repaired communication module, PV booking, driver accept/decline, operator panel, and `send-email` files.

## Phase 5.7 Smoke-Test Checklist Addendum

1. Open `https://rpk-mu.vercel.app/Paneel/admin-index.html`.
2. Login with a real Supabase Auth operator account.
3. Choose the Taxi/Onderaannemer panel.
4. If dashboard data is missing, verify the auth user is mapped to `partners.user_id` on an `is_hoofd = true` partner.
5. Submit a fresh booking from `https://rpk-mu.vercel.app/PV/PV.html`.
6. In browser Network, confirm `create_public_booking` returns success.
7. In browser Network, confirm `functions/v1/send-email` returns success.
8. If `send-email` succeeds but no mail arrives, check spam/junk and Resend delivery status.
9. If `send-email` fails, capture status code and response body.

## Phase 5.8 Booking Insert Retest Addendum

1. Redeploy the latest checkpoint branch commit to Vercel.
2. Submit a new guest booking from `/PV/PV.html` or `/#booking`.
3. Confirm no `bookings_pkey` duplicate error appears.
4. Confirm the success alert shows an `FC-...` server-generated booking ID.
5. Confirm the booking appears in the dashboard `Nieuwe Orders` tab.
6. If not visible, verify the logged-in Supabase Auth user is mapped to `partners.user_id` for an `is_hoofd = true` partner.
7. Confirm `BOOKING_CONFIRMATION` still fires after insert.
8. Confirm `functions/v1/send-email` succeeds in browser Network.

## Phase 5.9 Email Rehydration Retest Addendum

1. Redeploy the latest checkpoint branch commit.
2. Submit exactly one controlled guest booking from `https://rpk-mu.vercel.app/#booking`.
3. Confirm the booking popup says email was sent only when `functions/v1/send-email` returns success.
4. Confirm the customer receives the booking confirmation email.
5. Confirm Ryzen does not receive a technical escalation for a successful confirmation.
6. Confirm no duplicate booking rows are created from one click.
7. Login at `https://rpk-mu.vercel.app/Paneel/admin-index.html`.
8. Use the mapped hoofd-operator Supabase Auth account.
9. Choose Taxi/Onderaannemer and open `Nieuwe Orders`.
10. Confirm the latest `FC-...` pending booking is visible.

## Phase 5.10 CTA And Partner/Driver Retest Addendum

1. Redeploy the latest checkpoint branch commit.
2. Accept one pending booking from the dashboard.
3. Confirm `BOOKING_ACCEPTED` email CTA does not point to `fleetconnect.be`.
4. Confirm registered customer CTA opens `https://rpk-mu.vercel.app/PV/klantenportaalpv.html?id=<BOOKING_ID>`.
5. Confirm unregistered customer CTA opens `https://rpk-mu.vercel.app/PV/register.html?booking=<BOOKING_ID>`.
6. Register/login through the CTA and confirm booking ID remains preserved.
7. Confirm authenticated portal dashboard can show the booking where RLS allows the email/user.
8. Create a partner from the dashboard.
9. Create a driver from the dashboard with a real test email address.
10. Confirm the driver appears in the dashboard list.
11. Assign the driver to an accepted booking.
12. Confirm the driver assignment request email is sent to the driver.

## Phase 5.11 Operator Mapping And UX Retest Addendum

1. Redeploy the latest checkpoint branch commit.
2. Login to dashboard as `admin@ryzen.be`.
3. Create a partner and confirm no `Operator access required` error appears.
4. Create a driver under an available partner and confirm it appears in the driver list.
5. Submit one PV booking and confirm the saved-booking popup appears immediately after the `FC-...` ID is returned.
6. Confirm `BOOKING_CONFIRMATION` still sends in the background.
7. Accept one booking and confirm the modal closes/dashboard updates without waiting for email.
8. Confirm `BOOKING_ACCEPTED` still sends in the background.
9. Open `Bekijk Fiche`, scroll inside the modal, and confirm the top-right X remains visible and closes the modal.

## Phase A.4.2 UTF-8 And Confirmation Email Retest Addendum

1. Redeploy branch `phase-a4.2-utf8-email-trigger-fix`.
2. Open `/nl`, `/fr`, and `/en`.
3. Confirm there is no visible mojibake such as `BelgiÃ«`, `FinanciÃ«n`, `ðŸ`, `â–¶`, or broken vehicle/payment symbols.
4. Select Google-suggested pickup and destination addresses.
5. Confirm distance, duration, and positive price calculate before checkout.
6. Submit exactly one controlled booking.
7. Confirm the booking is saved through `create_public_booking`.
8. Confirm browser Network shows `functions/v1/send-email` success for `BOOKING_CONFIRMATION`.
9. Confirm the customer receives the confirmation email.
10. Confirm no technical escalation email is sent for the successful booking confirmation.
11. If email fails, capture the console entry beginning `BOOKING_CONFIRMATION delivery failed` and the Edge Function response body.
