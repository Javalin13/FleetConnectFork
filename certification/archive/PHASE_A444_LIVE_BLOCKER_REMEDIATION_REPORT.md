# Phase A.4.4.4 Live Blocker Remediation Report

Date: 2026-06-12
Branch: `phase-a4.4.4-live-auth-email-dashboard-remediation`
Repository: `Javalin13/FleetConnectFork`

## Scope

This remediation is limited to live blockers in the existing FleetConnect PV/customer/operator lifecycle. It does not add Stripe, B2B, OpenHuman, Hermes, SEO rollout, TaxisBrussels split, or redesigned dashboards.

## Implemented Fixes

| Blocker | Status | Evidence |
| --- | --- | --- |
| Customer portal multilingual persistence | RESOLVED IN REPOSITORY | `PV/klantenportaalpv.html` now has NL/FR/EN language switching for the active portal navigation/profile labels and persists language in `localStorage`. |
| Registration address/password validation | RESOLVED IN REPOSITORY | `PV/register.html` adds Google Places address autocomplete, repeat-password validation, loading state, and explicit password mismatch messaging. |
| Registration email CTA wording | RESOLVED IN REPOSITORY | Registration templates now use `confirmRegistration` labels and route to customer login instead of booking-view CTAs. |
| New account login clarity | PARTIALLY RESOLVED | `PV/index.html` checks account request status after failed login and gives pending/approved/rejected guidance. Supabase Auth activation still requires the existing verification/invite path. |
| Account request operator notification | RESOLVED IN REPOSITORY | `Paneel/admin-index.html` account request notification includes a dashboard review CTA and explicit manual approval text. |
| Customer portal CTA clickability | RESOLVED IN REPOSITORY | `EmailComponents.cta()` now emits robust absolute anchor links with visible fallback URLs. |
| Customer portal direct booking insert | RESOLVED IN REPOSITORY | `PV/klantenportaalpv.html` now submits customer portal ride creation through `create_public_booking` with place IDs, route distance, duration, and amount. |
| Dashboard accepted fiche continuity | RESOLVED IN REPOSITORY | After accepting a ride, `Paneel/onderaannemerA.html` keeps the booking fiche open from the active Orders state. |
| Assignment sent state | RESOLVED IN REPOSITORY | Operator assignment writes `status = assignment_sent`; dashboard labels it as waiting for driver response until driver accepts. |
| Reassignment button after assignment | RESOLVED IN REPOSITORY | Reassign controls are hidden for `assigned` rides and shown only for accepted/reassignment-needed states. |
| Dashboard auto-refresh | RESOLVED IN REPOSITORY | Dashboard refreshes silently every 30 seconds when the booking fiche modal is not open. |
| Driver archive active-ride protection | RESOLVED IN REPOSITORY | Dashboard blocks archive when active rides are assigned and lists those rides for reassignment. |
| Operator-created booking | RESOLVED IN REPOSITORY | Added authenticated operator-only `create_operator_booking(payload jsonb)` RPC and dashboard action. |
| Ride completion/review workflow | RESOLVED IN REPOSITORY | Added `operator_complete_booking(text)`, `ride_reviews`, `submit_ride_review`, `/review`, and `review.html`. Completed rides trigger `RIDE_COMPLETED_REVIEW_REQUEST`. |
| Account request to customer conversion | RESOLVED IN REPOSITORY, REQUIRES LIVE VALIDATION | Added `account_requests.customer_id`, `account_requests.user_id`, `approve_account_request`, `link_customer_after_registration`, and `get_account_request_status`. Approval creates/updates a `customers` row and links an existing `auth.users` row when present. |

## Account Request -> Customer Conversion Lifecycle

Implemented repository lifecycle:

1. `account_requests` stores pending request through `submit_account_request`.
2. Operator approval calls `approve_account_request`.
3. Approval creates or updates a `customers` row.
4. Approval links `account_requests.customer_id` to `customers.id`.
5. Approval links `account_requests.user_id` when a matching `auth.users.email` already exists.
6. Customer registration/login calls `link_customer_after_registration` to attach the authenticated user to the existing customer/request record.

Important boundary:

- The frontend does not create Supabase Auth users with service-role privileges. If no matching `auth.users` row exists at approval time, the customer profile is created but Auth activation still requires the safe Supabase verification/invite path.

Live validation required before certification:

```sql
select id, email, status, customer_id, user_id
from public.account_requests
where lower(email) = lower('<TEST_EMAIL>')
order by created_at desc
limit 5;

select id, email, user_id
from public.customers
where lower(email) = lower('<TEST_EMAIL>');

select id, email, email_confirmed_at
from auth.users
where lower(email) = lower('<TEST_EMAIL>');
```

## Validation Performed

Static validation passed:

- `src/modules/communication/templates/renderer.js` parses with `node --check`.
- `src/modules/communication/templates/components/base.js` parses with `node --check`.
- `src/modules/communication/l10n/translations.js` parses with `node --check`.
- `src/modules/communication/core/routes.js` parses with `node --check`.
- Inline scripts parse in:
  - `PV/register.html`
  - `PV/index.html`
  - `PV/klantenportaalpv.html`
  - `Paneel/admin-index.html`
  - `Paneel/onderaannemerA.html`
  - `review.html`
  - `driver-accept.html`
  - `driver-decline.html`
- `vercel.json` is valid JSON.
- Targeted scan found no active touched-path `bookings.insert`, `manual_route_required`, placeholder Supabase key, `onboarding@resend.dev`, or broken `getElement...` CTA pattern.

## Live Validation Required

1. Apply new migrations to live Supabase.
2. Redeploy the branch.
3. Submit account request, approve it, and verify `account_requests`, `customers`, and `auth.users` linkage.
4. Register/login as customer and verify portal access.
5. Create customer portal booking and confirm it uses `create_public_booking`.
6. Accept ride, assign driver, driver accepts, then mark completed.
7. Confirm review email CTA opens `/review` or `/review.html`.
8. Submit one review and verify `ride_reviews` row persists.

## Certification Status

NOT CERTIFIED.

Repository blockers covered by this phase are repaired, but live migration, browser, inbox, and Supabase Auth linkage evidence are still required before conditional certification.

## Live Blocker Remediation Pass - 2026-06-12

Status: LIVE DB PATCH APPLIED - BROWSER VALIDATION STILL FAILED/PENDING RETEST

Applied to live Supabase:

- `account_requests.customer_id`
- `account_requests.user_id`
- `approve_account_request`
- `link_customer_after_registration`
- `get_account_request_status`
- `create_customer_registration_profile`
- `create_operator_booking`
- `operator_complete_booking`
- `ride_reviews`
- `submit_ride_review`
- `operator_assign_driver`
- `operator_unassign_driver`
- hardened `driver_accept_assignment`
- hardened `create_public_booking` manual-route exception

Live verification result:

- `account_requests.customer_id`: exists.
- `account_requests.user_id`: exists.
- `ride_reviews`: exists.
- `submit_ride_review`: exists.
- `create_operator_booking`: exists.
- `operator_assign_driver`: exists.
- `operator_unassign_driver`: exists.
- `driver_accept_assignment` contains server-side duplicate-assignment rejection.
- `approve_account_request` references `auth.users` and links `customer_id`.
- `create_public_booking` supports marked manual-route fallback with minimum EUR 15.

Repository hotfixes:

- Customer login no longer redirects to the portal solely because a Supabase session exists; it first verifies customer/profile linkage.
- Register flow redirects to the login entry after signup/verification instead of directly into the portal.
- Portal signs out and returns to login with a deterministic reason when no linked customer profile exists.
- Homepage/dropdown login links now use `/PV/index.html` instead of relative `index.html`.
- Homepage booking form now has a non-blocking account CTA.
- Public NL/FR/EN booking forms enforce one-hour minimum scheduling unless ASAP is selected.
- ASAP bookings carry persisted `asap_requested` metadata and confirmation email wording.
- Google referrer/auth failure no longer writes an error into address inputs; when Google is unavailable, manual route fallback is marked and stored with minimum EUR 15 for FleetConnect follow-up.
- Dashboard assignment now calls `operator_assign_driver` instead of direct `bookings.update`.
- Assigned driver is shown clearly in the booking fiche.
- Reassignment now requires operator recall through `operator_unassign_driver`.

Still not certified:

- Customer portal redirect/login/register must be retested in browser.
- Google referrer configuration should still be corrected in Google Cloud for the production domain.
- Manual route fallback must be live-tested with the current domain restriction state.
- Driver double-assignment prevention must be live-tested with two assignment tokens.
- Review page route `/review` and `/review.html?booking=<BOOKING_ID>` must be deployed and opened.
- Multi-row selectors and full table sorting/filtering remain requested enhancements; not certified in this blocker pass.

## Live Validation Failure Follow-Up - 2026-06-12 19:39

Status: REMEDIATION UPDATED - NOT CERTIFIED UNTIL LIVE RETEST PASSES

Live blockers confirmed after the prior deployment:

- Homepage/dropdown login links still produced Page Not Found in at least one deployed entry path.
- Google Maps returned `RefererNotAllowedMapError`; address autocomplete then blocked registration/profile address entry and guest booking.
- Registration could fail without a useful visible page error.
- Guest booking still depended on Google suggestion selection in some active/root page copies.
- The driver login page still presented `admin@ryzen.be` as a fake live credential.

Repository hotfixes added in this pass:

- Active NL/FR/EN public pages and root duplicate booking pages now route customer portal links to `/PV/index.html`; stale `/customer`, `/client`, `/login`, and relative `index.html` homepage login/menu routes were removed from the active public entry pages.
- Public guest booking pages now permit manual pickup/dropoff text when Google Places is unavailable or no Google suggestion was selected.
- Manual fallback bookings keep the EUR 15 minimum fare and persist `manual_route_required: true` plus `google_places_unavailable: true` in booking payload metadata/form data.
- Customer portal booking form no longer requires Google `place_id` values; manual typed pickup/dropoff addresses of at least 3 characters can proceed and persist through `create_public_booking`.
- Registration default pickup address remains a manual text field if Google Places fails; the form now uses explicit visible validation instead of silent native browser blocking.
- `Paneel/driver-login.html` no longer pre-fills, documents, or accepts `admin@ryzen.be` as a live credential. Invalid login now shows a clean invalid-account message only.

Live retest required:

1. Deploy this branch again.
2. Open `/nl`, `/fr`, `/en`, `PV.html`, `PV_fr.html`, and `PV_en.html` routes where applicable and verify login/customer links open `/PV/index.html`.
3. With the current `RefererNotAllowedMapError`, type manual pickup/dropoff addresses and confirm guest booking persists through `create_public_booking`.
4. Register with a manually typed default pickup address and confirm visible validation/errors.
5. Confirm the dashboard receives the fallback booking and that confirmation email behavior remains visible in browser console/network.
6. Confirm `admin@ryzen.be` is no longer shown or accepted as a live driver/operator credential.
