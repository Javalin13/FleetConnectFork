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

## Phase A.4.4.1 Required Live Checks

Date added: 2026-06-11

1. Deploy `phase-a4.4.1-live-validation-hotfixes` to Vercel.
2. Deploy `supabase/functions/send-email/index.ts` manually if the live function version still lacks the requested-sender logging marker.
3. Submit a controlled booking below EUR 15 and confirm the confirm button immediately shows processing text and disables.
4. Confirm the UI, Supabase booking amount, and confirmation email all show EUR 15 when minimum fare applies.
5. Confirm booking confirmation email CTA opens the customer login/register route with booking ID preserved.
6. Register/login as customer, use `Rit toevoegen met boekingsnummer`, and confirm pickup, dropoff, date/time, price, status, and driver info load.
7. Accept booking in dashboard and confirm BOOKING_ACCEPTED CTA no longer contains any JavaScript/DOM fragment.
8. Assign a driver, decline from the driver CTA, and confirm dispatch receives exactly one operations notification.
9. Confirm the orders table no longer shows the declined driver and the reassignment alert is visible.
10. Reassign to another driver, accept from driver CTA, and confirm the reassignment alert clears.
11. Register a new customer and confirm CUSTOMER_REGISTRATION_CONFIRMATION arrives separately from booking confirmation.

## Phase A.4.4.3 Required Live Checks

Date added: 2026-06-12

1. Deploy `phase-a4.4.3-customer-portal-auth-routing`.
2. Apply migration `supabase/migrations/20260612000000_phase_a443_customer_auth_routing_workflows.sql`.
3. Open `/customer`, `/client`, `portal.fleetconnect.be`, and `client.fleetconnect.be`; confirm each shows the customer login/register entry, not an unauthenticated portal dashboard.
4. Confirm `/login.html` and `/register.html` resolve correctly.
5. Register a new customer; confirm the page does not go blank and the user lands in the customer login/portal flow.
6. Log in with Supabase Auth; confirm first screen is `Mijn Profiel`.
7. Attach a booking by booking number where booking email matches logged-in customer email; confirm it appears after refresh.
8. Try wrong-email and already-linked-to-another-user booking attachment; confirm both are rejected.
9. In the operator dashboard, review pending account requests; approve and reject one controlled request and verify Supabase status and decision email.
10. Reject a pending booking from the fiche; confirm status `declined`, customer rejection email, and removal from active New Orders.
11. Cancel an accepted/unassigned booking with reason; confirm status `cancelled`, cancellation email, and metadata reason.
12. Confirm expired pending bookings do not remain in active New Orders.
13. Archive a driver; confirm the driver is not in assignment dropdowns and appears only in the archived driver section.
14. Reactivate that driver; confirm it returns to the active driver list and assignment dropdown.
15. Re-run driver decline/reassignment: dispatch email, reassignment alert, cleared visible driver, reassignment to another driver, and alert cleared after acceptance.

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

## Phase A.4.4.4 Live Blocker Remediation Retest Addendum

1. Apply migrations `20260612010000_phase_a444_account_customer_conversion.sql`, `20260612020000_phase_a444_dashboard_lifecycle.sql`, and `20260612030000_phase_a444_review_workflow.sql`.
2. Redeploy branch `phase-a4.4.4-live-auth-email-dashboard-remediation`.
3. Submit an account request and verify support receives a dashboard-review CTA.
4. Approve the request and verify `account_requests.customer_id`, `account_requests.user_id` where an Auth user exists, and a matching `customers` row.
5. Register or verify the customer account and confirm `link_customer_after_registration` links the authenticated user.
6. Open `/PV/index.html`, log in, and verify the portal stays authenticated without redirect loops.
7. In the customer portal, create one booking through selected Google suggestions and confirm Network uses `create_public_booking`.
8. Accept the booking in the dashboard and confirm the fiche remains open under Orders.
9. Assign a driver and confirm dashboard status is waiting for driver response until driver accepts.
10. Driver accepts and dashboard no longer shows reassignment action/alert.
11. Complete the ride and confirm the review email CTA opens `/review` or `/review.html`.
12. Submit one review and verify `ride_reviews` persists in Supabase.

## Phase A.4.4.4 Live Failure Retest Addendum

1. Redeploy the latest remediation branch.
2. Open `/PV/index.html` logged out and confirm it stays on login.
3. Open `/PV/klantenportaalpv.html` logged out and confirm it redirects once to login with no loop.
4. Register a new account and confirm it returns to `/PV/index.html` with a clear verification/login message.
5. Approve account request and verify `account_requests.customer_id`, `customers.id`, and `auth.users.email`.
6. Log in after verification and confirm the portal opens.
7. Open `/nl`, `/fr`, `/en` and click menu login links; all should route to `/PV/index.html`.
8. Attempt scheduled booking within 1 hour without ASAP; it must be blocked.
9. Select ASAP and submit; booking must persist with `metadata.asap_requested = true`.
10. If Google returns `RefererNotAllowedMapError`, type manual addresses and confirm booking persists with `metadata.manual_route_required = true` and amount at least EUR 15.
11. Assign a driver, let driver accept, then attempt another driver accept/reassignment without recall; server must reject it.
12. Recall assigned driver, assign a new driver, and confirm the new token works.
13. Open `/review` and `/review.html?booking=<BOOKING_ID>` after deploy; page should load safely.

## Phase A.4.4.4 19:39 Live Hotfix Retest Addendum

1. Redeploy `phase-a4.4.4-live-auth-email-dashboard-remediation` after the 19:39 hotfix commit.
2. Scan/open NL/FR/EN homepage menus and footer customer links; each customer/login entry must route to `/PV/index.html`.
3. Confirm no active public entry page contains stale `/customer`, `/client`, `/login`, or relative `index.html` customer login routes.
4. With Google Places blocked by `RefererNotAllowedMapError`, type manual pickup and destination addresses of at least 3 characters and submit a guest booking.
5. Verify the created booking has amount `>= 15`, `metadata.manual_route_required = true`, and `metadata.google_places_unavailable = true`.
6. Register a customer with a manually typed default pickup address; visible errors must appear for incomplete data and Google autocomplete must not block submission.
7. Open the customer portal new-ride form and create a manual fallback booking using typed addresses.
8. Confirm `Paneel/driver-login.html` does not show or accept `admin@ryzen.be`.

## Phase A.4.4.4 Final Certification Blocker Checklist

1. Apply `20260612050000_phase_a444_final_certification_blockers.sql` to live Supabase.
2. Submit registration and confirm visible text: `Account successfully created. Please verify your email address. If account approval is required, you will receive access once approved.`
3. Click the verification email and confirm visible text: `Email successfully verified. You can now log in if your account has been approved.`
4. Before approval, confirm login shows: `Your account is awaiting approval.`
5. Approve the account request and verify `account_requests.customer_id`, `account_requests.user_id`, matching `customers`, and matching `auth.users`.
6. Log in and confirm the customer portal opens without redirect loop.
7. Complete one ride, open `/review.html?booking=<BOOKING_ID>`, submit a review, and confirm `Thank you for your review.`
8. Verify the review row exists in `ride_reviews`.
9. Open `/nl`, `/fr`, and `/en`; confirm five-star comment reviews appear under `Highlighted Testimonials` newest-first and other comment reviews under `See All Testimonials`.
10. Confirm the Google Reviews CTA is visible and points to the configured verified Google review URL when `window.FLEETCONNECT_REVIEW_URL` is set.
11. Open the dashboard Account Requests tab and switch NL/FR/EN; verify headers, buttons, statuses, prompts, actions, and messages are translated.

## Phase A.4.4.4 Final Live Retest Checklist

1. Apply `20260612060000_phase_a444_live_retest_blockers.sql` to live Supabase.
2. Redeploy `phase-a4.4.4-live-auth-email-dashboard-remediation`.
3. With Google Maps unavailable (`ApiNotActivatedMapError` or `RefererNotAllowedMapError`), register using a manually typed pickup address of at least 3 characters.
4. Confirm customer registration sends the customer confirmation email and support/operator customer-account request notification.
5. Click the Supabase verification link and confirm `/PV/index.html` completes the verification callback without saying the customer profile is not linked.
6. Before dashboard approval, confirm login shows account awaiting approval, not another verification prompt.
7. In the dashboard, open Customer Account Requests, approve the customer request, and verify `account_requests.customer_id`, `account_requests.user_id` when available, and matching `customers`.
8. Log in as the approved customer and confirm `/PV/klantenportaalpv.html` opens without an index/portal redirect loop.
9. Create a scheduled guest booking more than 1 hour ahead and confirm it appears in New Orders after dashboard refresh.
10. Attempt scheduled booking inside 1 hour without ASAP; confirm the exact one-hour/ASAP message appears instead of an incomplete-address error.
11. Select ASAP, submit a guest booking, and confirm metadata includes `asap_requested = true`.
12. Confirm fallback/manual bookings keep amount `>= 15`, use `create_public_booking`, and appear in dashboard New Orders even when status is `pending_payment`.
13. Confirm booking confirmation emails still arrive and no new silent failures appear in browser console/network.
