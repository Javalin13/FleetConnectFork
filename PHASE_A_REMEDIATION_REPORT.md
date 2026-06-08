# Phase A Remediation Report

Date: 2026-06-08
Branch: fixes
Scope: Production Baseline Certification hardening only.

## Remediation Applied

- Added Vercel rewrites for `/nl`, `/fr`, and `/en` to existing PV language pages.
- Normalized active PV, customer portal, operator, and driver-page branding toward FleetConnect.
- Preserved current booking, dispatch, dashboard, Supabase, email, and driver assignment logic.
- Added language-switch state preservation on active PV language pages so query/hash state such as `#booking` survives language switching.
- Expanded the existing operator driver list to show existing driver fields: name, email, phone, partner, status, vehicle, and license plate.

## Not Implemented By Rule

- Stripe/payment certification.
- Partner permissions implementation.
- White-label implementation.
- Driver financials, commission engine, payouts.
- Broad auth/database/email/booking architecture redesign.

## Remaining Blockers

- Full browser validation is still required on the deployed Vercel URL.
- Inbox validation is still required for all lifecycle emails.
- Legacy multi-product pages still exist and need scope decisions before public launch.
- Customer portal first-time registration/profile/history flow requires live RLS/session validation.
- Standalone driver/partner portal production scope remains unresolved.

## Certification Readiness

Not production certified. Ready for controlled Phase A manual validation after deployment of `fixes`.
