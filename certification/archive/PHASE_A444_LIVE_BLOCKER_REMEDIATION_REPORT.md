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
