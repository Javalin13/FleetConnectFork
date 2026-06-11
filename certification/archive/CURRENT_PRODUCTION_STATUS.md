# FleetConnect Current Production Status

Date: 2026-06-11
Canonical development repository: Javalin13/FleetConnectFork
Canonical branch for this work: codex-phase2-certification-2026-06
Base commit audited: e035acffb002345590a222bb5b08d51f4df9f373

## Certification Verdict

Status: NOT CERTIFIED

Phase A repository remediation is complete for routing, branded sender configuration, CTA URL generation, and the missing public booking confirmation trigger. Full production certification still requires a redeploy and live browser/inbox validation on the connected FleetConnect domains.

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
| Customer portal | /customer, /client | Rewrites to /PV/klantenportaalpv.html | vercel.json |
| Partner login | /partner-login | Rewrites to /Paneel/partner-login.html | vercel.json |
| Driver login | /driver-login | Rewrites to /Paneel/driver-login.html | vercel.json |
| City pages | /taxi-brussels, /taxi-zaventem, /taxi-antwerpen, /taxi-gent, /taxi-brugge, /taxi-leuven, /taxi-mechelen, /taxi-waterloo | Rewrites to existing /cities/*.html files | vercel.json and cities/ |
| portal.fleetconnect.be root | / | Rewrites to /PV/index.html | host-specific vercel.json rewrite |
| client.fleetconnect.be root | / | Rewrites to /PV/klantenportaalpv.html | host-specific vercel.json rewrite |
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

Validation still required after deployment:

1. Submit one booking from /PV/PV.html or /nl.
2. Submit one booking from /PV/PV_fr.html or /fr.
3. Submit one booking from /PV/PV_en.html or /en.
4. Confirm mobile booking pages have no horizontal overflow on a real mobile viewport.
5. Confirm city footer links resolve to /taxi-brussels, /taxi-antwerpen, /taxi-gent, /taxi-zaventem, /taxi-leuven, /taxi-mechelen, /taxi-waterloo, and /taxi-brugge.
6. Confirm footer links do not take public users to admin/dashboard routes.
