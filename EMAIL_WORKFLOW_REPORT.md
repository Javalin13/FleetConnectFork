# Email Workflow Report

Date: 2026-06-08

## Email Workflows Audited

- BOOKING_CONFIRMATION
- BOOKING_ACCEPTED
- DRIVER_ASSIGNMENT_REQUEST
- DRIVER_ASSIGNED
- DRIVER_DECLINED
- BOOKING_CANCELLED

## Current Evidence

- `src/modules/communication/core/routes.js` builds View Booking CTAs as `/PV/klantenportaalpv.html?id=<BOOKING_ID>`.
- `RouteBuilder` uses `window.location.origin` and falls back to `https://rpk-mu.vercel.app`.
- Booking confirmation renderer includes distance from `distance_km`, `form_data.distance_km`, `metadata.distance_km`, or `distance`.
- `PV/PV.html` and `PV/klantenportaalpv.html` trigger `BOOKING_CONFIRMATION` after public booking creation.
- Operator accept/cancel and driver accept/decline triggers are present in active code.
- Duplicate technical escalation suppression exists in `CommunicationService`.

## Fixes Applied In This Pass

- No email architecture changes.
- Active brand normalization only.

## Remaining Validation

- Live inbox validation for all six lifecycle emails.
- Confirm View Booking CTA opens deployed Vercel customer portal with booking ID.
- Confirm no technical escalation email is generated for successful lifecycle sends.

## Status

Repository wiring appears present. Live inbox validation pending.
