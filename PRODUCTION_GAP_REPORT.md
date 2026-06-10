# Production Gap Report

Date: 2026-06-08

## Must Fix Before First Customer

- Deploy latest `fixes` branch and verify `/`, `/nl`, `/fr`, `/en`, `/PV/PV.html`, and `/PV/PV.html#booking`.
- Complete one real customer booking validation.
- Confirm booking confirmation email arrives without technical escalation.
- Confirm customer portal View Booking CTA works.
- Confirm operator can see and accept the booking.

## Must Fix Before Adnan

- Decide whether KMS7/NH remains separate or is migrated into FleetConnect canonical flow.
- Define partner ownership and operator visibility rules.
- Certify partner/driver creation and assignment under live RLS.

## Must Fix Before Public Launch

- Complete all manual validation tracker tests.
- Finish inbox validation for booking accepted, driver assignment, driver accepted, driver declined, and cancellation.
- Resolve or explicitly scope out standalone driver and partner portals.
- Confirm mobile behavior.
- Remove or scope legacy/deprecated public routes.

## Can Wait

- Stripe/payment execution.
- White-label implementation.
- Commissions, payouts, driver financials.
- Full partner permission matrix implementation.
- Full expanded booking lifecycle state machine.

## Certification Verdict

Not production certified. Phase A remediation is ready for manual truth validation after deployment.
