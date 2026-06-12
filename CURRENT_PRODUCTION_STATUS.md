# FleetConnect Current Production Status

Date: 2026-06-11
Canonical development repository: Javalin13/FleetConnectFork
Canonical branch for this work: codex-phase2-certification-2026-06
Base commit audited: e035acffb002345590a222bb5b08d51f4df9f373

## Certification Verdict

Status: NOT CERTIFIED

## Phase A.4.4.3 Customer Portal Auth/Routing Status

Status: REPOSITORY HOTFIX COMPLETE, MIGRATION AND LIVE VALIDATION PENDING.

The customer portal entry points now route through the Supabase customer login/register page instead of directly rendering the protected portal. The customer portal no longer creates a demo user when no Supabase session exists; unauthenticated customers are redirected to `/PV/index.html` with the booking ID preserved where present.

Account request approval/rejection, secure booking attachment, operator rejection/cancellation, and driver reactivation are backed by migration `supabase/migrations/20260612000000_phase_a443_customer_auth_routing_workflows.sql`. Browser-side approval does not create Supabase Auth users directly because that requires service-role/admin privileges; approval persists the decision and customer profile state and must be paired with an approved Auth invite/admin activation flow.

Phase A repository remediation is complete for routing, branded sender configuration, CTA URL generation, and the missing public booking confirmation trigger. Full production certification still requires a redeploy and live browser/inbox validation on the connected FleetConnect domains.

## Phase A.4.4.2 Customer Email Lifecycle Status

Status: REPOSITORY POLICY UPDATED, LIVE VALIDATION PENDING.

The customer-facing lifecycle is now simplified:

- customer registration -> `CUSTOMER_REGISTRATION_CONFIRMATION`
- public booking -> `BOOKING_CONFIRMATION`
- driver accepts -> `DRIVER_ASSIGNED` / ride confirmed
- replacement driver accepts -> `DRIVER_REASSIGNED`
- completed ride -> `RIDE_COMPLETED_REVIEW_REQUEST` / `RIDE_COMPLETED`

Internal workflow events no longer send customer emails. `BOOKING_ACCEPTED` and `DRIVER_DECLINED` are enforced as internal-only by `CommunicationService`; driver decline still notifies operations and persists reassignment state in Supabase.

## Current Production Entry Points

| Entry point | Route | Decision | Evidence |
| --- | --- | --- | --- |
| Main public site | / | Rewrites to /PV/PV.html | vercel.json |
| Dutch public site | /nl | Rewrites to /PV/PV.html | vercel.json |
| French public site | /fr | Rewrites to /PV/PV_fr.html | vercel.json |
| English public site | /en | Rewrites to /PV/PV_en.html | vercel.json |
| Booking alias | /booking | Rewrites to /PV/PV.html | vercel.json |
| Booking static subtree | /booking/:path* | Rewrites to /PV/:path* | vercel.json |
| Operator dashboard | /dashboard, /operator | Rewrites to /Paneel/admin-index.html | vercel.json |
| Customer login | /login | Rewrites to /PV/index.html | vercel.json |
| Customer registration | /register | Rewrites to /PV/register.html | vercel.json |
| Customer portal entry | /customer, /client | Rewrites to /PV/index.html so unauthenticated users see login/register first | vercel.json |
| Partner login | /partner-login | Rewrites to /Paneel/partner-login.html | vercel.json |
| Driver login | /driver-login | Rewrites to /Paneel/driver-login.html | vercel.json |
| City pages | /taxi-brussels, /taxi-zaventem, /taxi-antwerpen, /taxi-gent, /taxi-brugge, /taxi-leuven, /taxi-mechelen, /taxi-waterloo | Rewrites to existing /cities/*.html files | vercel.json and cities/ |
| portal.fleetconnect.be root | / | Rewrites to /PV/index.html | host-specific vercel.json rewrite |
| client.fleetconnect.be root | / | Rewrites to /PV/index.html so auth is required before portal access | host-specific vercel.json rewrite |
| partners.fleetconnect.be root | / | Rewrites to /Paneel/partner-login.html | host-specific vercel.json rewrite |

Routes for /hotels, /b2b, a separate B2B portal, a separate Client Portal build, Partner Portal buildout, TaxisBrussels split, and SEO page generation were not created because they are explicitly outside Phase A scope.

## Sender Migration Status

Status: completed in repository, pending deployment/inbox validation.

Active code now uses:

| Purpose | Address |
| --- | --- |
| Customer/lifecycle sender | FleetConnect <bookings@fleetconnect.be> |
| Reply-to / support | support@fleetconnect.be |
| Operations copy | dispatch@fleetconnect.be |
| Technical escalation | tech@fleetconnect.be |

The old production sender references were removed from active code/static translation files checked in this pass:

- onboarding@resend.dev
- fleetconnect.os@gmail.com
- ryzenoutsourcing@gmail.com

The send-email Edge Function still allowlists https://rpk-mu.vercel.app for backward-compatible preview testing, but production CTA base URL now defaults to https://fleetconnect.be.

## Booking Lifecycle Status

| Step | Repository status | Evidence |
| --- | --- | --- |
| Public booking creation | Present | PV/PV.html calls create_public_booking |
| Booking confirmation email | Fixed in repository | PV/PV.html now triggers BOOKING_CONFIRMATION after successful RPC insert |
| Truthful email popup | Fixed in repository | Popup only claims email sent if BOOKING_CONFIRMATION succeeds |
| Operator accept | Present | Paneel/onderaannemerA.html updates status to accepted and triggers BOOKING_ACCEPTED |
| Driver assignment | Present | Paneel/onderaannemerA.html updates status to assigned, assignment token, sent timestamp, driver snapshot, then triggers DRIVER_ASSIGNMENT_REQUEST |
| Driver accept | Present | driver-accept.html calls driver_accept_assignment and triggers DRIVER_ASSIGNED |
| Driver decline | Present | driver-decline.html calls driver_decline_assignment and triggers DRIVER_DECLINED operations-only notification |
| Cancellation | Present | Paneel/onderaannemerA.html updates status to cancelled and triggers BOOKING_CANCELLED |
| Ride completion | Not Phase A certified | Standalone production completion flow remains unvalidated |
| Manual/operator-created booking | Gap identified | No create_operator_booking RPC or clear Add New Ride/Create Booking operator workflow found |

## Static Validation Completed

- vercel.json parses as valid JSON.
- All static Vercel rewrite destinations resolve to existing files.
- Communication JavaScript modules pass node --check.
- PV/PV.html and root PV.html inline scripts parse after the confirmation-trigger edit.
- Active code/static search found no remaining onboarding@resend.dev, fleetconnect.os@gmail.com, or ryzenoutsourcing@gmail.com references in the scoped production files.

## Required Live Validation Before Certification

1. Redeploy the branch to Vercel.
2. Confirm fleetconnect.be root opens /PV/PV.html.
3. Confirm /nl, /fr, /en, /booking, /dashboard, /customer, /client, /partner-login, city aliases, and subdomain roots resolve correctly.
4. Submit one controlled public booking.
5. Confirm the customer receives BOOKING_CONFIRMATION from bookings@fleetconnect.be.
6. Confirm dispatch@fleetconnect.be receives the operations copy.
7. Confirm no tech@fleetconnect.be escalation fires on successful booking confirmation.
8. Login to /dashboard and verify the booking appears under Nieuwe Orders.
9. Accept the booking and verify BOOKING_ACCEPTED CTA opens the FleetConnect production domain route.
10. Assign a driver, accept, decline/reset, and cancel one controlled lifecycle path.

## Current Status Summary

FleetConnect is repository-ready for Phase A redeployment and live smoke testing, but not production certified until the above live tests pass.

## Phase A.1 Live Validation Hotfix Status

Date: 2026-06-11
Branch: phase-a1-live-validation-hotfixes
Status: repository hotfix completed, pending redeploy and live browser validation.

Live validation blockers addressed in repository:

- Public booking address entry now supports typed-address geocoding and a manual fallback when Google Places selection is unavailable.
- NL, FR, and EN public booking pages now submit through create_public_booking instead of direct table inserts.
- NL, FR, and EN public booking pages trigger BOOKING_CONFIRMATION after successful insert and show truthful email-result messaging.
- FR and EN booking forms were moved above the service teaser grid to match the NL placement and provide immediate CTA access.
- Mobile booking layout was tightened to prevent horizontal overflow in the booking steps, grids, inputs, map, and footer.
- Visible city quick access links were added to the active public footer for Brussels, Antwerp, Ghent, Zaventem, Leuven, Mechelen, Waterloo, and Brugge.
- Public footer links were corrected away from placeholder/admin-style targets toward public booking, customer, partner, support, legal, and city routes.

## Phase A.4.4.4 Repository Status

Status: REPOSITORY REMEDIATED - LIVE VALIDATION REQUIRED

- Account request approval now creates/links a `customers` record and records `account_requests.customer_id`.
- Matching Supabase Auth users are linked through `account_requests.user_id`; missing Auth users still require the safe verification/invite path.
- Customer portal booking creation now uses the hardened `create_public_booking` RPC instead of direct `bookings` insert.
- Operator dashboard now keeps assignment in `assignment_sent` until driver acceptance.
- Operator dashboard supports controlled operator-created bookings through an authenticated RPC.
- Completed rides can trigger the review request email and store reviews through `ride_reviews`.
- Deployment, migration application, browser validation, and inbox validation are still required before certification.

Validation still required after deployment:

1. Submit one booking from /PV/PV.html or /nl.
2. Submit one booking from /PV/PV_fr.html or /fr.
3. Submit one booking from /PV/PV_en.html or /en.
4. Confirm mobile booking pages have no horizontal overflow on a real mobile viewport.
5. Confirm city footer links resolve to /taxi-brussels, /taxi-antwerpen, /taxi-gent, /taxi-zaventem, /taxi-leuven, /taxi-mechelen, /taxi-waterloo, and /taxi-brugge.
6. Confirm footer links do not take public users to admin/dashboard routes.

## Phase A.4 Production Booking + Dashboard Hardening Status

Date: 2026-06-11
Branch: phase-a4-production-booking-dashboard-hardening
Status: repository hotfix completed, pending redeploy and live browser/inbox validation.

Repository changes in this phase:

- Public NL/FR/EN booking pages no longer submit manual_route_required bookings.
- Public NL/FR/EN booking pages now require Google geocoding/directions to calculate a positive route distance and price before checkout.
- Public booking payloads no longer send null amount or deferred-price metadata.
- User-facing route failure messages now block booking submission when Google route calculation fails.
- Dashboard selector/operator visible mojibake was corrected.
- Ryzen login now exposes an approval-based account request path without automatic account creation.
- Communication config now includes the public Supabase anon key fallback required for JWT-protected send-email calls.

Live validation still required:

1. Confirm Places suggestions appear for pickup/dropoff on /nl, /fr, and /en.
2. Select full suggested pickup/dropoff addresses and confirm route distance/time calculate.
3. Confirm price is calculated before checkout.
4. Confirm booking cannot submit when route/price is unavailable.
5. Submit one controlled booking and verify create_public_booking receives a positive amount.
6. Verify BOOKING_CONFIRMATION and BOOKING_ACCEPTED emails send through the deployed send-email function.
7. Verify dashboard selector and operator navigation text displays without mojibake.

## Phase A.4.2 UTF-8 + Email Trigger Fix Status

Date: 2026-06-11
Branch: phase-a4.2-utf8-email-trigger-fix
Status: repository hotfix completed, pending redeploy and live browser/inbox validation.

Repository changes in this phase:

- Active/root NL, FR, and EN public booking pages were cleaned of visible mojibake and broken emoji/symbol text.
- Public booking pages still require Google route/distance/price validation before submission.
- Public booking pages still submit through `create_public_booking`.
- `BOOKING_CONFIRMATION` now receives the local booking snapshot after successful insert, avoiding anonymous-client RLS rehydration failure.
- Email failure handling now logs `BOOKING_CONFIRMATION delivery failed` with booking ID and provider error details before showing the truthful customer fallback message.

Static validation completed:

1. Scoped mojibake/error-text scan returned no matches.
2. NL/FR/EN active/root public page inline scripts parsed.
3. Google Maps booking module passed `node --check`.
4. Communication service and Resend provider passed `node --check`.
5. Scoped public booking pages still use `create_public_booking` and no direct public `bookings.insert` path was found.

Live validation still required:

1. Redeploy this branch.
2. Confirm `/nl`, `/fr`, and `/en` have no visible mojibake.
3. Submit one controlled booking with Google-selected addresses.
4. Confirm positive route price remains required before checkout.
5. Confirm customer `BOOKING_CONFIRMATION` email is received.
6. Confirm no technical escalation fires for a successful confirmation.

## Phase A.4.3 Email Forensics + Account Flow Status

Date: 2026-06-11
Branch: phase-a4.3-email-forensics-account-flow
Status: repository remediation completed for diagnostics and in-app account request; live email delivery remains blocked by Resend domain/sender verification.

Live forensics completed before code changes:

- `send-email` exists, is ACTIVE, and has JWT verification enabled.
- `RESEND_API_KEY` secret name exists in Supabase.
- Browser requests reach `POST /functions/v1/send-email`.
- Recent live `send-email` executions return HTTP 400 after Resend rejects the send.
- Supabase function logs show Resend HTTP 403 `validation_error`: the Resend account can only send test emails to `ryzenoutsourcing@gmail.com` until a domain is verified.

Repository changes in this phase:

- `EMAIL_FORENSICS_REPORT.md` added with root-cause evidence.
- `ResendProvider` now exposes exact Edge Function response errors in browser console logs.
- `send-email` now returns Resend `message`, `code`, and `statusCode` to callers and supports `FLEETCONNECT_EMAIL_FROM`.
- `send-email` supports `FLEETCONNECT_ALLOWED_ORIGINS` and FleetConnect/FleetConnectFork origin matching while preserving unauthorized-origin rejection.
- `Paneel/admin-index.html` no longer opens `mailto:` for account requests.
- Account requests are submitted inside FleetConnect through `submit_account_request`.
- New migration `20260611000000_account_requests.sql` adds `account_requests` and a narrow request-submission RPC.

External requirement before email certification:

1. Verify the approved FleetConnect sending domain in Resend.
2. Configure Supabase `FLEETCONNECT_EMAIL_FROM` to a verified sender.
3. Deploy the updated `send-email` function.
4. Apply the account request migration.
5. Retest booking confirmation, booking accepted, driver assignment, driver accepted, and account request emails.

Follow-up completed on 2026-06-11:

- Resend dashboard evidence confirmed `fleetconnect.be` is verified.
- Live Supabase body inspection showed production was still running stale `send-email` code with `onboarding@resend.dev`.
- `send-email` was redeployed to live version 9.
- Live version 9 contains `FLEETCONNECT_EMAIL_FROM`, `FleetConnect <bookings@fleetconnect.be>`, sender diagnostics, and no `onboarding@resend.dev`.
- Runtime logs confirm `FLEETCONNECT_EMAIL_FROM exists: yes`, `Sender fallback used: no`, and `Sender address used: FleetConnect <bookings@fleetconnect.be>`.
- A controlled live verification email returned HTTP 200 with Resend ID `1b038b5b-d2af-46ae-9ebc-97c4f997b7b5`.

Remaining before certification:

1. Run live end-to-end lifecycle inbox validation for booking confirmation.
2. Run live end-to-end lifecycle inbox validation for booking accepted.
3. Run live end-to-end lifecycle inbox validation for driver assignment.
4. Run live end-to-end lifecycle inbox validation for driver accepted/assigned.
5. Apply and validate the account request migration/flow if not already applied.

## Phase A.4.4 Final Lifecycle Blockers Status

Date: 2026-06-11
Branch: phase-a4.4-final-lifecycle-blockers
Status: repository repairs completed and live Supabase migration applied; pending Vercel redeploy plus live browser/inbox validation.

Completed:

- Public bookings now require Google-selected pickup/dropoff place IDs, calculated route distance, calculated duration, and a positive amount.
- Live `create_public_booking(payload jsonb)` now enforces the same strict route/pricing requirements server-side.
- Booking confirmation email snapshot now includes route distance/duration and the renderer refuses to send placeholder distance output.
- Driver assigned customer email now uses the assigned driver's phone where available, with dispatch phone only as fallback.
- Dashboard assignment now stores a complete assigned-driver snapshot.
- Live `account_requests` and `submit_account_request(payload jsonb)` were deployed and rollback-tested.
- Driver hard delete was replaced by operator-only edit/archive RPCs and dashboard controls.

Live validation completed:

- Missing-place public booking payload is rejected.
- Valid strict public booking payload is accepted and rolled back.
- Account request RPC accepts a valid payload and was rolled back.
- Driver edit/archive columns and RPC signatures exist live.

Still required:

1. Deploy this branch to Vercel.
2. Test typed-only `Antwerpen` does not submit.
3. Test full Google-selected pickup/dropoff submits and sends booking confirmation email.
4. Test full inbox lifecycle: booking confirmation, accepted, driver assignment, driver accepted/assigned, account request.
5. Implement manual/operator-created booking in a separately approved phase.
6. Implement/certify review page, per-landing-page reviews, and completed-ride review CTA in a separately approved phase.
