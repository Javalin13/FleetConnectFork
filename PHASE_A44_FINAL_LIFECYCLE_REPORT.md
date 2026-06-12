# Phase A.4.4 Final Lifecycle Blockers Report

Date: 2026-06-11
Repository: Javalin13/FleetConnectFork
Branch: phase-a4.4-final-lifecycle-blockers

## Forensics Summary

The live lifecycle was traced through repository code and live Supabase state before repairs:

| Flow | Repository evidence | Live state before repair | Result |
| --- | --- | --- | --- |
| Public booking creation | NL/FR/EN active/root PV pages call `create_public_booking` | RPC existed but did not require Google place IDs, route duration, route distance, or positive price | Repaired |
| Booking confirmation email | PV pages triggered `BOOKING_CONFIRMATION` after insert | Snapshot path existed but confirmation template could render missing distance as placeholder | Repaired |
| Operator acceptance email | `Paneel/onderaannemerA.html` triggers `BOOKING_ACCEPTED` | Reported live working | Preserved |
| Driver assignment email | `Paneel/onderaannemerA.html` triggers `DRIVER_ASSIGNMENT_REQUEST` | Reported live working | Preserved |
| Driver accepted email | `driver-accept.html` calls `driver_accept_assignment` then triggers `DRIVER_ASSIGNED` | Reported live working, but customer email used dispatch phone fallback | Repaired |
| Account request flow | `Paneel/admin-index.html` calls `submit_account_request` | Live schema did not contain `account_requests` or `submit_account_request(payload)` | Repaired and validated |

## Phase A.4.4.2 Customer Email Lifecycle Refinement

The customer lifecycle was refined after live review:

- `BOOKING_ACCEPTED` is no longer customer-facing. Operator acceptance remains an internal dispatch state transition.
- `DRIVER_ASSIGNED` is now the customer-facing ride confirmation sent only after the driver accepts.
- `DRIVER_REASSIGNED` is sent only when a replacement driver accepts after a prior accepted driver was changed.
- `DRIVER_DECLINED` remains internal/operations-only and does not notify the customer.
- `CUSTOMER_REGISTRATION_CONFIRMATION` confirms customer account creation separately from booking confirmation.
- `RIDE_COMPLETED_REVIEW_REQUEST` / `RIDE_COMPLETED` is reserved for completed ride review follow-up.

Persistence is handled by Supabase migration `20260611030000_customer_email_lifecycle_refinement.sql`, which stores reassignment state, declined driver snapshots, customer notification intent, and customer notification sent timestamps/history in booking metadata.

## Repairs Completed

### 1. Strict Public Booking Address/Route Enforcement

Changed active/root NL, FR, and EN public booking pages plus the shared Google Maps module.

- Google selected pickup and dropoff places are now tracked with place IDs.
- Editing an address clears the selected place ID and current route state.
- Public booking submission now requires:
  - selected pickup place ID
  - selected dropoff place ID
  - calculated distance
  - calculated duration
  - positive calculated price
- Typed-only partial addresses are blocked client-side.
- `create_public_booking` now enforces the same requirements server-side.

Live rollback validation:

| Test | Result |
| --- | --- |
| Missing place IDs | Rejected with `Google-selected pickup and destination addresses are required` |
| Valid payload with place IDs, distance, duration, positive amount | Accepted and rolled back with generated `FC-...` booking ID |

### 2. Booking Confirmation Email Repair

Changed the confirmation snapshot and email renderer.

- `BOOKING_CONFIRMATION` receives an explicit booking snapshot after insert.
- Confirmation template now reads `route_distance_km` and `route_duration_min`.
- Confirmation template throws a clear error if distance is missing instead of rendering `... km`.
- Confirmation popup now reports exact email failure detail when available.

### 3. Driver Assigned Customer Email Phone Repair

Changed `src/modules/communication/templates/renderer.js` and dashboard assignment snapshot.

- `DRIVER_ASSIGNED` now displays the assigned driver phone when available.
- Dispatch phone remains a fallback only when driver phone is missing.
- Dashboard assignment stores driver email, phone, vehicle, color, and plate in `assigned_driver` snapshot.

### 4. Account Request RPC Deployment

The live missing RPC/table was deployed through `20260611010000_phase_a44_lifecycle_hardening.sql`.

Live verification:

- `account_requests` table exists.
- `submit_account_request(payload jsonb)` exists.
- Rollback RPC probe returned `status: pending`.

### 5. Driver Archive/Edit Management

Changed dashboard driver management and added operator-only RPCs.

- Hard driver delete was replaced with archive/deactivate.
- Driver rows are preserved for historical bookings.
- Dashboard now exposes edit and archive controls.
- Assignment dropdown excludes archived drivers.
- Live schema now has `drivers.is_active`, `drivers.archived_at`, `drivers.updated_at`.
- Live RPCs now exist:
  - `update_operator_driver(payload jsonb)`
  - `archive_operator_driver(p_driver_id uuid)`

## Live Supabase Changes Applied

Migration applied in ordered chunks because the Supabase Management API rejected the full migration body as too large.

Applied:

- `account_requests` table and policies
- `submit_account_request(payload jsonb)`
- booking route/place columns
- strict `create_public_booking(payload jsonb)`
- `booking_reassignment_events` table and policies
- emergency-capable `driver_decline_assignment(text)`
- driver archive/edit columns
- `update_operator_driver(payload jsonb)`
- `archive_operator_driver(uuid)`
- PostgREST schema reload notification

## Validation Completed

Static validation:

- `node --check src/modules/maps/booking-maps.js`: PASS
- `node --check src/modules/communication/templates/renderer.js`: PASS
- `node --check src/modules/communication/core/normalizer.js`: PASS
- Active/root NL/FR/EN inline scripts parsed: PASS
- `Paneel/onderaannemerA.html` inline script parsed: PASS
- `driver-accept.html` and `driver-decline.html` inline scripts parsed: PASS
- `git diff --check`: PASS, line-ending warnings only

Live rollback validation:

- `submit_account_request`: PASS, rolled back
- strict booking rejection without place IDs: PASS
- strict valid booking payload: PASS, rolled back
- live schema/RPC verification: PASS

## Remaining Production Gaps

| Item | Status | Reason |
| --- | --- | --- |
| Live browser booking confirmation email | Pending live test | Code and server validation are repaired; requires deployed branch and inbox verification |
| Full lifecycle inbox certification | Pending live test | Acceptance/assignment/driver accepted reportedly work, but final certification still needs evidence after this branch deploys |
| Manual/operator-created booking | Open gap | No `create_operator_booking` RPC or clear dashboard manual ride creation flow exists |
| Review page and per-landing-page reviews | Open gap | Review URL is configurable, but no production review page/per-city review system is implemented |
| Completed ride review CTA | Open gap | `RIDE_COMPLETED` template exists, but no production completion action is wired |
| Stripe/payment execution | Out of scope | Not touched in this phase |

## A.4.4 Verdict

Phase A.4.4 repository and live Supabase remediation is complete for the identified lifecycle blockers that could be safely repaired without redesigning workflows.

FleetConnect is not fully certified until the branch is deployed and the live browser/inbox lifecycle tests pass.
