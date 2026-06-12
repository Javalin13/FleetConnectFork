# Phase A.4.4.3 Live Validation Findings Report

Date: 2026-06-12
Repository: Javalin13/FleetConnectFork
Branch: phase-a4.4.3-customer-portal-auth-routing

## Scope

This phase fixes customer portal authentication/routing blockers and the related operator workflow gaps found during live validation. It does not redesign UI, introduce Stripe work, split portals, or create new public products.

## Changes Applied

| Area | Result | Evidence |
| --- | --- | --- |
| Customer portal root routing | `portal.fleetconnect.be`, `client.fleetconnect.be`, `/customer`, and `/client` now enter `/PV/index.html` instead of bypassing auth into the portal dashboard. | `vercel.json` |
| Customer login route aliases | `/login`, `/login.html`, `/register`, and `/register.html` route to the existing customer auth pages. | `vercel.json` |
| Registration blank page | Removed the duplicate/orphaned second HTML document tail from `PV/register.html`. | `PV/register.html` |
| Customer portal auth guard | Removed demo user fallback; portal now requires Supabase Auth session and redirects unauthenticated users to login with booking ID preserved. | `PV/klantenportaalpv.html` |
| Post-login first screen | Authenticated customers land on `Mijn Profiel`; booking ID links prefill the attach field and then show dashboard/history. | `PV/klantenportaalpv.html` |
| Booking attachment security | `attach_booking_to_customer` now requires logged-in user, matching email, and rejects bookings already attached to another user/customer. | `supabase/migrations/20260612000000_phase_a443_customer_auth_routing_workflows.sql` |
| Account request approval | Added operator-only approval/rejection RPCs and dashboard review surface. Approval updates the request and client customer profile where applicable. | Migration + `Paneel/onderaannemerA.html` |
| Account decision email | Dashboard sends approval/rejection email through the existing send-email provider path; failure is logged as a warning. | `Paneel/onderaannemerA.html` |
| Expired new orders | Expired pending bookings no longer appear in active New Orders and are included in history/needs-review context. | `Paneel/onderaannemerA.html` |
| Operator reject/cancel | Added operator-only RPCs for pending rejection and accepted/assigned cancellation with optional reason metadata. | Migration + dashboard |
| Booking rejection email | Added `BOOKING_REJECTED` customer email template and translations. | `src/modules/communication/*` |
| Archived drivers | Active driver list excludes archived drivers; archived drivers appear in a separate section and are not assignable. Reactivation uses an operator-only RPC. | Migration + dashboard |

## Security Notes

- No broad RLS weakening was added.
- New write operations use `SECURITY DEFINER` RPCs with `public.is_operator()` checks where operator access is required.
- Customer booking attachment remains authenticated-only and validates booking email against the logged-in user's email.
- The dashboard still uses the existing operator login/session handoff from `Paneel/admin-index.html`; this phase did not redesign the operator auth architecture.
- Browser-side code cannot safely create Supabase Auth users with admin privileges. Account approval persists the decision and client profile, but the actual Auth invite/activation remains a service-role/admin operation unless a dedicated Edge Function is approved.

## Validation Performed

| Check | Result |
| --- | --- |
| `src/modules/communication/index.js` syntax | PASS |
| `src/modules/communication/templates/renderer.js` syntax | PASS |
| `src/modules/communication/templates/registry.js` syntax | PASS |
| `src/modules/communication/l10n/translations.js` syntax | PASS |
| Edited HTML inline module syntax | PASS with browser-global/import mock |
| `vercel.json` parse | PASS |
| Public booking RPC references | PASS: active NL/FR/EN public pages still call `create_public_booking` |
| Customer portal demo fallback scan | PASS: no `initDemoUser`, demo customer email, or `loggedIn` customer auth remains |

## Pending Live Validation

1. Deploy this branch and apply migration `20260612000000_phase_a443_customer_auth_routing_workflows.sql`.
2. Open `/customer`, `/client`, `portal.fleetconnect.be`, and `client.fleetconnect.be`; confirm each shows customer login/register first.
3. Register a customer, confirm Supabase Auth session, and confirm first screen is `Mijn Profiel`.
4. Attach a booking by booking number with matching email; verify wrong email and already-attached-to-another-user cases are rejected.
5. In operator dashboard, approve and reject account requests; verify status persists and decision emails are delivered.
6. Confirm expired pending bookings do not remain in active New Orders.
7. Reject a pending booking from fiche; verify status `declined`, customer rejection email, and active list removal.
8. Cancel an accepted/unassigned booking with reason; verify status `cancelled`, email, and audit metadata.
9. Archive and reactivate a driver; verify archived drivers are not assignable.
10. Re-run driver decline/reassignment live test to confirm reassignment alert and assignment dropdown behavior remain intact.

## Certification Status

Repository remediation: COMPLETE for A.4.4.3 scope.

Production certification: NOT CERTIFIED until migration deployment and live browser/inbox validation are complete.
