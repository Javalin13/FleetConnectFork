# FleetConnect Open Risks Register

Date: 2026-06-11
Canonical development repository: Javalin13/FleetConnectFork
Canonical branch for this work: codex-phase2-certification-2026-06

| ID | Risk | Classification | Evidence | Recommendation | Status |
| --- | --- | --- | --- | --- | --- |
| R-001 | Live deployment not yet validated after routing changes | Production blocker until tested | vercel.json changed in repository only | Redeploy branch and run route smoke test on fleetconnect.be and subdomains | OPEN |
| R-002 | Booking confirmation email not yet inbox-validated after sender migration | Production blocker until tested | Sender changed to bookings@fleetconnect.be; PV now triggers BOOKING_CONFIRMATION | Submit one controlled booking after deploy and verify customer/dispatch/tech inbox behavior | OPEN |
| R-003 | send-email Edge Function code changed but live deployed version may differ | Production blocker until deployed/verified | Repository function now uses branded sender and subdomain origins | Deploy function with existing JWT/security posture and verify deployed body/config | OPEN |
| R-004 | Manual/operator-created booking workflow is missing or not discoverable | Functional gap | Search found no create_operator_booking RPC and no clear Add New Ride/Create Booking operator workflow | Design a minimal operator-only booking creation path in a later approved phase; do not bolt it onto Phase A without business approval | OPEN |
| R-005 | Ride completion is not production-certified | Functional gap | Driver accept/decline paths exist; completion path remains unvalidated/static in driver panel areas | Certify or implement a narrow completion action in a later phase | OPEN |
| R-006 | Legacy duplicate pages may diverge | Medium risk | Root PV.html and PV/PV.html both exist; Vercel uses /PV/PV.html | Keep /PV as source of truth; avoid editing root duplicates except compatibility fixes | OPEN |
| R-007 | Historical README and archived certification reports contain stale production URLs/status | Documentation risk | README still describes broader Ryzen ecosystem and legacy status badges | Replace README with a current FleetConnect-focused overview in a separately approved documentation cleanup | OPEN |
| R-008 | B2B, separate Client Portal, Partner Portal, TaxisBrussels split, and SEO pages are not built | Out of Phase A scope | User explicitly excluded these features from Phase A | Keep out of production certification scope until Phase A is complete | DEFERRED |
| R-009 | Stripe/payment execution remains outside this pass | External blocker for full payment certification | Phase A excluded Stripe; no credentials used | Certify non-Stripe lifecycle separately; certify Stripe only after credentials and live payment tests are available | OPEN |
| R-010 | Live Supabase state may drift from repository migrations | Security/compatibility risk | Phase A did not alter RLS/schema | Re-run live schema/RLS/RPC read-only validation before final production signoff | OPEN |
| R-011 | Existing city pages contain some legacy relative links and placeholder footer links | Medium routing risk | Static route inventory found inconsistent city navigation patterns | Address only if live route smoke test shows user-facing failures; otherwise schedule link hygiene pass | OPEN |