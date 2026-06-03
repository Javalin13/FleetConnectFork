# FleetConnect Launch Risk Matrix

Generated: 2026-06-02

## Risk Matrix

| Item | Severity | Probability | Impact | Recommendation | Estimated effort |
| --- | --- | --- | --- | --- | --- |
| Completed ride email trigger missing | Critical | High | Customers may not receive thank-you/review communication after ride completion. | Identify existing completion action and wire `RIDE_COMPLETED` without changing workflow semantics. | 0.5 day |
| Registration browser/inbox validation pending | Medium | High | Registration welcome path is wired in repository but not browser/inbox tested. | Validate with approved test account and inbox. | 0.5 day |
| Google review URL not configured | Medium | High | Review CTA no longer fake, but does not route to a verified review destination. | Set `FLEETCONNECT_REVIEW_URL` or `CommunicationConfig.brand.reviewUrl` to a verified Google review link. | 0.25 day |
| Frontend repairs not deployed/browser-tested | High | High | Repository repairs may not be active in production until deployed and validated. | Deploy repaired frontend and run full browser lifecycle. | 1 day |
| Inbox delivery validation pending | High | High | Email wiring is static until real inbox delivery is confirmed. | Run approved customer, driver, operations, and escalation inbox tests. | 0.5 day |
| Stripe credentials unavailable | Critical | Certain | Payment checkout/webhook/refund cannot be certified. | Configure Stripe secrets and validate payment functions after credential availability. | 1-2 days after credentials |
| Historical `user_id` backfill unresolved | High | Medium | Existing customer portal history may be incomplete or inaccessible. | Build manual mapping and approve controlled backfill. | 0.5-1 day |
| Live browser lifecycle testing pending | High | High | Regression risk remains across public booking, operator assignment, driver token links, and email. | Execute end-to-end browser tests with real mapped accounts/test inboxes. | 1 day |
| Standalone partner/driver portal auth unresolved | Medium | Medium | Demo portals may be unsafe if exposed in production scope. | Keep out of MVP scope or implement Supabase auth separately. | 1-3 days |
| FleetConnect-owned sender domain absent | Low | Medium | Brand/deliverability limitations. | Configure Resend custom domain when DNS access is available. | 0.5 day plus DNS propagation |

## Launch Recommendation

NO.

Rationale: core dispatch and RLS risk has been reduced, but required customer and operations communication flows are incomplete and payment remains externally blocked.

## Phase 5.5 Additional Launch Risks

| Risk | Severity | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| Extracted tree has no Git checkpoint | Medium | High | Branch/tag provenance is not available from this workspace. | Apply repaired files to real Git checkout, then create requested checkpoint branch and annotated tag. | Release manager |
| Legacy root email helper remains | Medium | Medium | A non-PV legacy booking path could bypass the repaired communication module. | Confirm root `fleetconnect.html` is out of launch scope or reconcile it before expanding launch scope. | Engineering |
| Hardcoded anon keys remain | Low | High | Public anon keys are token-like and reduce maintainability/audit clarity. | Centralize public client config in a future hardening pass without changing behavior. | Engineering |

## Phase 5.7 Smoke-Test Risks

| Risk | Severity | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| Operator account not mapped to hoofd partner | High | Medium | Login may succeed but dashboard data/actions may not reflect production dispatch scope. | Map Supabase Auth user to `partners.user_id` for `is_hoofd = true`. | Release manager |
| Vercel branch not redeployed after login config fix | Medium | Medium | Dashboard login continues failing with stale admin-index file. | Redeploy latest checkpoint branch commit. | Release manager |
| Email delivery still blocked after origin fix | Medium | Low | Booking confirmation may still fail due recipient spam/filter or Resend domain state. | Check Network response and Resend logs after new booking. | Release manager |

## Phase 5.8 Booking Insert Risks

| Risk | Severity | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| Vercel not redeployed after booking ID fix | High | Medium | Live site may continue sending duplicate client IDs. | Redeploy latest checkpoint branch commit. | Release manager |
| Operator uses unmapped auth account | High | Medium | Dashboard login succeeds but booking data remains hidden by RLS. | Use mapped hoofd-partner account or map intended user. | Release manager |
| Confirmation email not retested after insert fix | Medium | Medium | Email chain remains unproven after successful insert. | Re-test booking and inspect Network/inbox. | Release manager |

## Phase 5.9 Booking Email Rehydration Risks

| Risk | Severity | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| Vercel not redeployed after snapshot handoff fix | High | Medium | Live booking confirmation continues failing with `Failed to rehydrate snapshot`. | Redeploy latest checkpoint branch commit before next booking test. | Release manager |
| Customer inbox delivery still unverified | High | Medium | Booking may save but customer may not receive confirmation due provider/inbox issue. | Submit one controlled booking and verify Network, Resend logs, inbox, and spam. | Release manager |
| Operator session not mapped to hoofd partner | High | Medium | Dashboard login works but live bookings appear absent to the tester. | Use the mapped hoofd-operator Supabase Auth account or map the intended operator user. | Release manager |
| Public bookings moved to wrong partner as visibility workaround | High | Low | Driver assignment could break because current drivers exist under `partner_id = 1`. | Do not move public bookings to `partner_id = 13`; validate operator mapping and RLS instead. | Engineering |

## Phase 5.10 CTA And Partner/Driver Risks

| Risk | Severity | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| Vercel not redeployed after CTA fix | High | Medium | Accepted-booking CTA may continue pointing to stale/unavailable domain. | Redeploy latest checkpoint branch commit. | Release manager |
| Customer portal booking lookup blocked by RLS | Medium | Medium | Customer may reach portal but not see booking if email/user ownership does not match. | Test with same email used on the booking; approve ownership backfill separately if needed. | Release manager |
| Partner/driver RPCs not exercised by live dashboard | Medium | Medium | Repository and live RPCs are ready but browser flow remains unproven. | Create one real test partner and driver after redeploy. | Release manager |
| Driver assignment email not inbox-tested after driver creation | High | Medium | Assignment workflow may create driver but email delivery remains unverified. | Assign test driver with real inbox and verify driver receives request. | Release manager |

## Phase 5.11 Operator Mapping And UX Risks

| Risk | Severity | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| Vercel not redeployed after latency/modal fixes | Medium | Medium | Live UI continues waiting on email and modal X remains less usable. | Redeploy latest checkpoint branch commit. | Release manager |
| Browser session uses an unmapped operator account | High | Low | RPCs again fail with `Operator access required`. | Use `admin@ryzen.be` or map the intended auth user to a hoofd partner. | Release manager |
| Background email failure missed by operator/customer | Medium | Medium | Booking is saved/accepted but email may fail after UI has moved on. | Watch secondary alerts/toasts and verify inbox/technical escalation. | Release manager |
| Partner/driver creation not tested after live mapping | Medium | Medium | Mapping is rollback-validated but actual dashboard prompts remain unproven. | Create one real test partner and driver after redeploy. | Release manager |
