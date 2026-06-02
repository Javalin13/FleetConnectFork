# FleetConnect Final Certification Gap Report

Generated: 2026-06-02

Scope: Phase 5.1 remaining certification blockers that can be handled without Stripe credentials.

## Final Verdict

Can FleetConnect be conditionally certified without Stripe?

NOT CERTIFIED.

Reason: database/RLS security and dispatch RPC behavior now validate, but the live `send-email` Edge Function still does not match the hardened repository implementation and retains wildcard CORS behavior. Stripe/payment execution is excluded as an external blocker, but email hardening remains a live deployment blocker.

## Evidence Files

- `outputs/phase5_1_live_security_validation_sanitized.json`
- `outputs/phase5_1_dispatch_rollback_summary_sanitized.json`
- `outputs/phase5_1_send_email_compare_sanitized.json`
- `outputs/phase5_1_send_email_compare_after_deploy_sanitized.json`
- `outputs/phase5_1_dispatch_rollback_validation_sanitized.json`

## Gap Classification

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Live RLS enabled on inspected tables | RESOLVED | RLS enabled for `bookings`, `customers`, `drivers`, `partners`, `payments`, `refunds`, `invoices`, `settlements`, `transaction_ledger`. | Continue monitoring after future migrations. |
| Anonymous REST exposure | RESOLVED | Anon visible row count is 0 for all inspected operational and payment tables. | Keep RLS enabled; do not restore broad anon policies. |
| Required dispatch schema fields | RESOLVED | All required `bookings` assignment, ownership, status, payment, `form_data`, and `metadata` fields exist. | None for non-Stripe scope. |
| Public booking RPC | RESOLVED | Rollback validation reports `public_booking_rpc_ok = true`. | Browser-test public booking form before final production launch. |
| Operator assignment lifecycle | RESOLVED | Rollback validation reports `operator_assignment_ok = true`; repo assignment writes token timestamps and reset fields. | Requires real mapped operator browser test before final certification. |
| Driver accept RPC | RESOLVED | Rollback validation reports `driver_accept_ok = true`; driver page calls `driver_accept_assignment`. | Browser-test token link. |
| Driver decline RPC | RESOLVED | Rollback validation reports `driver_decline_ok = true`; driver page calls `driver_decline_assignment`. | Browser-test token link. |
| Reassignment/reset lifecycle | RESOLVED | Rollback validation reports `reset_ok = true`; repo assignment clears prior accept/decline timestamps. | Browser-test reassignment from operator panel. |
| Operator policy model | RESOLVED | One hoofd-partner user mapping exists; policies route operator access through `is_operator()`. | Maintain partner `user_id` mapping for every production operator. |
| Historical customer/bookings `user_id` backfill | BLOCKED PENDING MANUAL APPROVAL | 2/2 customers and 78/78 bookings lack `user_id`; deterministic email mapping count is 0. | Manual identity mapping/backfill plan required; do not broad-update production rows automatically. |
| Hardened repository `send-email` code | RESOLVED | Local code has unauthorized-origin rejection, explicit 403 signal, no wildcard CORS signal, no service-role key signal. | Keep repository implementation as source of truth. |
| Live `send-email` deployment | PRODUCTION BLOCKER | Live body does not match local hash, lacks unauthorized-origin rejection, and retains wildcard CORS signal. Management API update timed out and read-back showed unchanged live function. | Deploy hardened repository `send-email` through a reliable Supabase deploy/update path, then re-run sanitized body comparison and CORS tests. |
| `send-email` JWT setting | RESOLVED | Live metadata reports `verify_jwt = true`. | Preserve JWT requirement unless an explicitly reviewed public email endpoint is designed. |
| `RESEND_API_KEY` presence signal | RESOLVED | Live body references `RESEND_API_KEY`; secret value was not exposed. | Confirm secret remains configured after redeploy. |
| Payment Edge Functions deployment | BLOCKED PENDING STRIPE CREDENTIALS | `create-checkout-session`, `process-refund`, and `stripe-webhook` are not deployed. | Prepare for later deployment only after Stripe secrets and approved public exposure controls exist. |
| Stripe checkout execution | BLOCKED PENDING STRIPE CREDENTIALS | Stripe credentials unavailable by constraint. | External prerequisite; not a FleetConnect code failure. |
| Stripe webhook validation | BLOCKED PENDING STRIPE CREDENTIALS | Stripe credentials unavailable by constraint. | External prerequisite; validate after Stripe setup. |
| Payment tables and payment RLS shell | RESOLVED | Required payment tables exist and anonymous exposure is blocked. | Populate/validate only with Stripe-enabled function testing later. |
| Partner standalone portal auth | OUT OF PRODUCTION SCOPE FOR MVP | `Paneel/partner-login.html` and `partnerspaneel.html` still use session/demo behavior. | If partner portal is in production scope, implement Supabase auth separately before certification. |
| Driver standalone portal auth | OUT OF PRODUCTION SCOPE FOR MVP | `Paneel/driver-login.html` uses session/demo behavior. | MVP should use token-based driver accept/decline links only; standalone driver portal should remain out of scope. |
| Full live browser lifecycle | BLOCKED PENDING LIVE BROWSER TESTING | Transaction rollback tests passed, but real UI flows with real mapped accounts were not executed. | Test public booking, operator assignment, driver accept/decline, email trigger after live email redeploy. |

## Ownership Backfill Plan

Current live counts:

- Customers total: 2
- Customers missing `user_id`: 2
- Bookings total: 78
- Bookings missing `user_id`: 78
- Bookings deterministically mappable by email: 0
- Customers deterministically mappable by email: 0

Plan:

1. Export candidate auth users, customers, and bookings by email without exposing credentials.
2. Build a manual mapping table for each customer identity.
3. Review duplicates, aliases, and historical guest bookings.
4. Apply backfill only after explicit approval because it modifies existing production rows.

## Partner And Driver Auth Scope

Token-based driver assignment links are sufficient for MVP dispatch accept/decline because they use `driver_accept_assignment` and `driver_decline_assignment` RPCs instead of direct anonymous table updates.

Standalone partner and driver portals are not production-ready authentication surfaces. They should remain outside MVP production scope unless separate Supabase auth integration is approved.

## Required Next Steps Before Conditional Certification Without Stripe

1. Deploy hardened repository `send-email` live with JWT enabled.
2. Re-run sanitized function body comparison and CORS/origin rejection validation.
3. Perform live browser tests for public booking, mapped operator assignment, and driver accept/decline links.
4. Decide whether historical ownership backfill is required for launch and approve any production row updates separately.
5. Keep Stripe/payment processing explicitly excluded until Stripe credentials are available.

## Phase 5.2 Gap Update

Canonical Phase 5.2 report:

- `outputs/EMAIL_WORKFLOW_REPORT.md`

Resolved since Phase 5.1:

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Live `send-email` deployment | RESOLVED | Multipart deploy returned HTTP 201; live function is active, version 5, JWT enabled, unauthorized-origin rejection signal present, exact wildcard CORS header patterns absent, service-role key signal absent. | Continue preserving hardened repository function. |
| Fake Google review placeholder | RESOLVED AS PLACEHOLDER REMOVAL | `CPLACEHOLDER` removed; review URL is now configurable through `window.FLEETCONNECT_REVIEW_URL` or `CommunicationConfig.brand.reviewUrl`. | Configure verified Google review URL before certifying review CTA. |
| Broken email CTA paths | RESOLVED | Email routes now target existing Main PV files instead of missing root PV/setup-account paths. | Browser-test deployed routes. |

Remaining email-specific blockers:

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Booking accepted email trigger | PRODUCTION BLOCKER | `BOOKING_ACCEPTED` template exists, but `Paneel/onderaannemerA.html` `confirmBooking()` only updates status. | Add surgical trigger call and validate. |
| Booking cancelled email trigger | PRODUCTION BLOCKER | `BOOKING_CANCELLED` template exists, but `cancelBooking()` only updates status. | Add surgical trigger call and validate. |
| Ride completed email trigger | PRODUCTION BLOCKER | `RIDE_COMPLETED` template exists, but no production trigger call-site found. | Identify completion action and wire trigger. |
| Internal operations notifications | PRODUCTION BLOCKER | No notification recipient routing found for `fleetconnect.os@gmail.com` or `ryzenoutsourcing@gmail.com`; primary appears only as brand/reply-to. | Add reviewed internal notification routing. |
| Customer registration communication email | PRODUCTION BLOCKER | Supabase auth email exists, but repository-controlled welcome/thank-you trigger is not wired. | Validate Supabase auth email template or wire communication onboarding trigger. |
| Google review target | BLOCKED PENDING MANUAL CONFIGURATION | Review URL is configurable but no verified Google review URL is configured. | Provide/confirm real Google review URL. |

Final Phase 5.2 email verdict:

- EMAIL CHAIN NOT CERTIFIED.

## Phase 5.3 Gap Update

Resolved since Phase 5.2:

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| PV public booking RPC/email wiring | RESOLVED IN REPOSITORY | `PV/PV.html` and `PV/klantenportaalpv.html` now call `create_public_booking` and trigger `BOOKING_CONFIRMATION`. | Deploy and browser-test. |
| Booking accepted email trigger | RESOLVED IN REPOSITORY | Operator `confirmBooking()` now triggers `BOOKING_ACCEPTED`. | Deploy and browser-test. |
| Booking cancelled email trigger | RESOLVED IN REPOSITORY | Operator `cancelBooking()` now triggers `BOOKING_CANCELLED`. | Deploy and browser-test. |
| Driver declined operations notification | RESOLVED IN REPOSITORY | Driver decline page now calls `DRIVER_DECLINED` operations-only after the safe RPC returns a booking id. | Deploy and browser-test. |
| Internal operations routing for communication triggers | RESOLVED IN REPOSITORY | `CommunicationService` now sends operations copies to both operations inboxes. | Validate real delivery with approved test inboxes. |
| Live send-email revalidation | RESOLVED | `phase5_3_send_email_live_revalidation_sanitized.json` verdict PASS. | Continue monitoring after deploys. |

Remaining blockers:

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Registration communication chain | PRODUCTION BLOCKER | Registration page remains structurally messy and no safe repository-controlled welcome/ops trigger was wired. | Select/clean canonical registration path and wire/test welcome + operations notification. |
| Ride completed workflow | PRODUCTION BLOCKER | No production completion action/trigger call-site found. | Identify completion action and wire `RIDE_COMPLETED`. |
| Verified Google review URL | BLOCKED PENDING MANUAL CONFIGURATION | Placeholder removed, but no verified review URL configured. | Provide verified Google review URL. |
| Live browser validation | PRODUCTION BLOCKER | Repository changes are validated statically, not through deployed production UI. | Deploy frontend and run full lifecycle. |
| Real email delivery validation | PRODUCTION BLOCKER | No real test inbox delivery was executed. | Approve test inbox sends and validate delivery. |

Final Phase 5.3 certification answer:

- Can FleetConnect be conditionally certified without Stripe? NO.
- Is FleetConnect launch-ready for real customers? NO.
- Final status: NOT CERTIFIED.

## Phase 5.4 Gap Update

Resolved since Phase 5.3:

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Operations vs technical escalation model | RESOLVED IN REPOSITORY | Primary operations email and technical escalation email are separate config fields; routine notifications go to FleetConnect Operations, failure/escalation path goes to Ryzen. | Validate delivery with inbox testing. |
| Registration welcome/onboarding email | RESOLVED IN REPOSITORY | `sendAccountWelcome()` uses existing `ACCOUNT_ONBOARDING` template; PV registration calls it after customer creation. | Browser and inbox test. |
| Ride completed template completeness | RESOLVED IN TEMPLATE | Existing `RIDE_COMPLETED` template now includes booking reference, date/time, pickup, destination, driver, vehicle, and review CTA. | Wire only when a real production completion action exists. |
| Email infrastructure validation | RESOLVED STATICALLY | Template/render validation passed for all lifecycle templates; live send-email revalidation passed. | Browser and inbox test. |

Remaining blockers:

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Production ride-completion trigger | PRODUCTION BLOCKER | Search found only demo/local completion in `Paneel/driverpaneel.html`, not a production Supabase completion action. | Identify or implement production completion action, then wire `RIDE_COMPLETED`. |
| Browser validation | BLOCKED PENDING LIVE BROWSER TESTING | Explicitly out of scope for Phase 5.4. | User/manual test with real accounts. |
| Inbox validation | BLOCKED PENDING INBOX TESTING | Explicitly out of scope for Phase 5.4. | User/manual test with real inboxes. |
| Verified review URL | BLOCKED PENDING MANUAL CONFIGURATION | Central config exists, but no verified Google review URL value is configured. | Set `FLEETCONNECT_REVIEW_URL` or `CommunicationConfig.brand.reviewUrl`. |

Phase 5.4 certification answer:

- All safely remediable email implementation blockers except production ride completion are resolved in repository code.
- FleetConnect is ready for final browser and inbox validation of implemented non-Stripe workflows.
- FleetConnect remains NOT CERTIFIED until browser/inbox validation and production ride-completion wiring are complete.

## Phase 5.5 Gap Update

Status: FINAL BASELINE CHECKPOINT PREPARED - NOT CERTIFIED

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Phase 3-5.4 repairs | RESOLVED IN REPOSITORY | Static trigger/path checks confirm repaired paths remain present. | Deploy repaired frontend and browser-test. |
| Production ride completion | PRODUCTION BLOCKER | Search found only local/demo `Paneel/driverpaneel.html completeRide()` array mutation. | Add or identify real Supabase-backed completion action before wiring `RIDE_COMPLETED`. |
| Browser validation | BLOCKED PENDING LIVE BROWSER TESTING | Explicitly out of scope for Phase 5.5. | Human validation after deployment. |
| Inbox validation | BLOCKED PENDING INBOX TESTING | Explicitly out of scope for Phase 5.5. | Human inbox validation. |
| Verified review URL | BLOCKED PENDING MANUAL CONFIGURATION | Review URL is centralized but empty by default. | Configure verified Google review URL. |
| Git checkpoint branch/tag | BLOCKED BY WORKSPACE STATE | Extracted tree has no `.git` directory. | Create branch/tag in real Git checkout after applying files. |
| Hardcoded Supabase anon keys | REQUIRES VALIDATION | Strict token-like scan finds public anon keys in frontend files. | Decide whether to centralize/configure public anon keys before launch. |
| Legacy root email helper | REQUIRES VALIDATION | `fleetconnect.html` invokes `send-booking-email` outside repaired communication module. | Confirm legacy root page is out of production scope or reconcile before launch. |

Updated readiness: 84%.

## Phase 5.7 Live Smoke-Test Debug Update

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| Dashboard route | RESOLVED | Live Vercel returned HTTP 200 for `/Paneel/admin-index.html` and `/Paneel/onderaannemerA.html`. | Use `/Paneel/admin-index.html`. |
| Dashboard login config | RESOLVED IN REPOSITORY | `Paneel/admin-index.html` malformed Supabase anon key corrected. | Redeploy Vercel branch and login with real Supabase Auth account. |
| Operator mapping | REQUIRES VALIDATION | Live sanitized counts show 1 mapped hoofd partner and 2 unmapped hoofd partners. | Confirm login account is mapped to `partners.user_id` for `is_hoofd = true`. |
| PV booking insert | RESOLVED | Live read-only evidence shows recent bookings: 1 in last 2h, 11 in last 24h. | Submit next test booking and verify latest booking row. |
| Booking confirmation email origin | RESOLVED LIVE | `send-email` version 6 is active, JWT enabled, Vercel origin allowlisted, no wildcard CORS signal. | Re-test email delivery from Vercel PV booking page. |

Remaining blockers continue to include browser/inbox validation and production ride-completion wiring.

## Phase 5.8 Booking Insert Gap Update

| Item | Classification | Evidence | Required next action |
| --- | --- | --- | --- |
| PV booking duplicate primary key | RESOLVED LIVE | Frontend no longer sends `id`; live RPC ignores client `id` and generates unique `FC-...` IDs. Rollback validation passed. | Redeploy Vercel and submit a real booking. |
| Dashboard pending booking visibility | REQUIRES VALIDATION | Dashboard includes `pending` bookings in `newOrders`; RLS operator access depends on `is_operator()`. | Login with mapped hoofd-partner auth user and open `Nieuwe Orders`. |
| Operator mapping | BLOCKED PENDING MANUAL APPROVAL | Sanitized live mapping shows only hoofd partner `id = 13` has `user_id`; ids `1` and `3` are unmapped. | Map intended operator auth user to a hoofd partner if needed. |
| Booking confirmation email after insert | BLOCKED PENDING INBOX TESTING | `BOOKING_CONFIRMATION` remains wired and `send-email` version 6 is ready. | Test with real browser/inbox after redeploy. |
