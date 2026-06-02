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
