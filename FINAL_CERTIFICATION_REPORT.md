# FleetConnect Final Certification Report

Date: 2026-06-11
Canonical development repository: Javalin13/FleetConnectFork
Canonical branch for this work: codex-phase2-certification-2026-06
Scope: Phase A only

## Final Verdict

NOT CERTIFIED

The repository now contains the minimal Phase A fixes required before live validation, but production certification cannot be granted until the updated branch and send-email function are deployed and the booking/email/dashboard/driver lifecycle is validated in browser and inbox.

## Phase A Work Completed

1. Full routing inventory and route decision table completed.
2. Minimal Vercel static routing fixes applied.
3. Sender migration completed in repository code.
4. CTA and email URL audit completed.
5. Booking lifecycle repository validation completed.
6. Missing public booking confirmation trigger fixed.
7. Manual/operator booking gap identified.
8. Current production status and open risk register produced.

## Files Changed

| File | Reason |
| --- | --- |
| vercel.json | Added minimal rewrites for current production entry points, city aliases, and connected subdomain roots. |
| src/modules/communication/core/config.js | Migrated communication base URL and mailboxes to FleetConnect branded production addresses. |
| supabase/functions/send-email/index.ts | Migrated forced sender/reply-to and allowed connected FleetConnect subdomain origins. |
| PV/PV.html | Trigger BOOKING_CONFIRMATION after successful create_public_booking and show truthful email result. |
| PV.html | Kept root duplicate compatible with the same booking confirmation behavior. |
| Paneel/partner-login.html | Updated production fallback base URL from old Vercel preview to fleetconnect.be. |
| translations.js | Replaced old Gmail support references with support@fleetconnect.be. |
| translations_append.js | Replaced old Gmail support references with support@fleetconnect.be. |
| translations_append_en.js | Replaced old Gmail support references with support@fleetconnect.be. |
| translations_append_fr.js | Replaced old Gmail support references with support@fleetconnect.be. |
| update_translations_v2.py | Replaced old Gmail support references in translation source data. |
| CURRENT_PRODUCTION_STATUS.md | Created current Phase A production status. |
| OPEN_RISKS_REGISTER.md | Created current open risk register. |
| FINAL_CERTIFICATION_REPORT.md | Created current Phase A final certification report. |

## Routing Decision Table

| Route/domain | Decision |
| --- | --- |
| fleetconnect.be / | Serve PV public booking page. |
| /nl, /fr, /en | Serve existing PV language pages. |
| /booking | Serve PV public booking page. |
| /dashboard and /operator | Serve existing operator login. |
| /login | Serve existing customer login. |
| /register | Serve existing customer registration. |
| /customer and /client | Serve existing PV customer portal. |
| /partner-login | Serve existing partner login. |
| /driver-login | Serve existing driver login. |
| city aliases | Serve existing city static pages. |
| portal.fleetconnect.be / | Serve existing customer login. |
| client.fleetconnect.be / | Serve existing customer portal. |
| partners.fleetconnect.be / | Serve existing partner login. |
| /hotels, /b2b, separate portals, SEO page set | Not implemented in Phase A; documented as deferred scope. |

## Email/CTA Findings

- RouteBuilder already builds active CTAs from window.location.origin when running in-browser.
- Repository fallback domain is now https://fleetconnect.be.
- BOOKING_CONFIRMATION, BOOKING_ACCEPTED, DRIVER_ASSIGNED, and BOOKING_CANCELLED customer CTAs resolve to existing FleetConnect routes.
- DRIVER_ASSIGNMENT_REQUEST accept/decline CTAs resolve to existing root driver token pages.
- Review CTA remains dependent on ReviewConfig and is not certified in Phase A.

## Booking Lifecycle Validation

Repository evidence supports the existing lifecycle:

1. PV/PV.html calls create_public_booking.
2. PV/PV.html now triggers BOOKING_CONFIRMATION only after a successful insert.
3. Paneel/onderaannemerA.html accepts pending bookings by setting status accepted and triggering BOOKING_ACCEPTED.
4. Paneel/onderaannemerA.html assigns a driver by setting assigned status, driver id, assignment token, assignment sent timestamp, and assigned_driver snapshot.
5. driver-accept.html calls driver_accept_assignment and triggers DRIVER_ASSIGNED.
6. driver-decline.html calls driver_decline_assignment and triggers DRIVER_DECLINED as operations-only.
7. Paneel/onderaannemerA.html cancellation sets status cancelled and triggers BOOKING_CANCELLED.

Static validation passed. Live validation is still required.

## Manual/Operator Booking Gap

No production-ready manual operator booking workflow was found in the current repository. Specifically, the audit did not find a narrow create_operator_booking RPC or a clear operator dashboard Add New Ride/Create Booking action that inserts an operator-originated ride into the same lifecycle.

Recommendation: implement this only in a later approved phase as a narrow operator-only workflow that reuses the existing booking lifecycle and does not bypass RLS.

## Certification Status

FleetConnect is not certified at the end of Phase A because live deployment, live browser testing, inbox validation, live send-email deployment verification, manual booking gap resolution, ride completion certification, Stripe/payment certification, and live Supabase drift validation remain open.

The repository is ready for redeployment and controlled live Phase A smoke testing.

## Phase A.4.3 Email Forensics Update

Live email forensics identified the exact remaining email failure:

- Browser lifecycle triggers reach the Supabase `send-email` Edge Function.
- `send-email` is active and JWT verification is enabled.
- `RESEND_API_KEY` is present.
- Resend rejects outbound mail with HTTP 403 `validation_error`.
- The Resend account is restricted to testing emails to `ryzenoutsourcing@gmail.com` until a sending domain is verified.

Root cause classification: **E. Resend rejects request**.

Repository remediation added:

- `EMAIL_FORENSICS_REPORT.md`
- improved browser/provider error logging
- more explicit `send-email` Resend error responses
- configurable `FLEETCONNECT_EMAIL_FROM`
- in-app account request submission without `mailto:`
- `account_requests` table and `submit_account_request` RPC migration

Production email lifecycle remains **NOT CERTIFIED** until the Resend sending domain is verified, `send-email` is redeployed with a verified sender, and booking/account lifecycle emails pass inbox validation.

## Phase A.4.3 Sender Deployment Follow-Up

Resend dashboard evidence confirmed `fleetconnect.be` is verified, but Resend logs still showed `FleetConnect <onboarding@resend.dev>`. Live Supabase body inspection confirmed production was running stale `send-email` code.

Corrective action completed:

- `send-email` was redeployed to live Supabase version 9.
- JWT verification remained enabled.
- Live body now contains `FLEETCONNECT_EMAIL_FROM` and `FleetConnect <bookings@fleetconnect.be>`.
- Live body no longer contains `onboarding@resend.dev`.
- Runtime logs confirm `FLEETCONNECT_EMAIL_FROM exists: yes`, fallback `no`, and sender `FleetConnect <bookings@fleetconnect.be>`.
- Controlled live sender verification returned HTTP 200 with Resend ID `1b038b5b-d2af-46ae-9ebc-97c4f997b7b5`.

Updated certification status:

The stale sender deployment blocker is resolved at the Edge Function layer. FleetConnect is still not fully email-certified until booking confirmation, booking accepted, driver assignment, driver accepted/assigned, and account request emails are validated through the live UI and recipient inboxes.

## Phase A.4.4 Final Lifecycle Blockers Update

Phase A.4.4 completed targeted repairs for the remaining lifecycle blockers without redesigning the public booking flow, dashboard workflow, Stripe, or unrelated portals.

Repairs completed:

- Public booking route strictness: client and live RPC now require Google-selected pickup/dropoff place IDs, calculated distance, calculated duration, and positive amount.
- Booking confirmation email: public pages pass a complete snapshot and the template now renders route distance/duration from the repaired fields instead of placeholder distance.
- Driver assigned customer email: customer-facing driver-assigned email now displays assigned driver phone when available.
- Account request RPC: `account_requests` and `submit_account_request(payload jsonb)` were deployed live and rollback-tested.
- Driver management: dashboard driver hard delete was replaced with operator-only edit/archive RPCs to preserve historical booking references.
- Emergency decline support: `driver_decline_assignment(text)` now supports reassignment audit events and post-acceptance emergency decline outside the 40-minute pickup window.

Validation evidence:

- Live rollback `submit_account_request` probe returned `status: pending`.
- Live rollback strict booking probe rejected missing place IDs.
- Live rollback valid booking probe returned generated `FC-...`, pending status, positive amount, route distance, and route duration.
- Live schema now includes booking place/route columns, account request objects, reassignment events, and driver edit/archive RPCs.
- Static JavaScript validation passed for the shared maps module, communication renderer, normalizer, active/root NL/FR/EN booking pages, dashboard, and driver accept/decline pages.

Remaining before certification:

1. Deploy `phase-a4.4-final-lifecycle-blockers` to Vercel.
2. Browser-test typed-only address rejection and full Google-selected booking success.
3. Inbox-test booking confirmation, operator accepted, driver assignment, driver accepted/assigned, and account request notifications.
4. Implement manual/operator-created ride flow in a separately approved phase.
5. Implement/certify review page, per-landing-page review surfacing, and completed-ride review CTA in a separately approved phase.

Certification verdict remains: **NOT CERTIFIED** until the live deployment and inbox validation evidence is collected.
