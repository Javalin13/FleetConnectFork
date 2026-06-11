# FleetConnect Phase A.4.3 Email Forensics Report

Date: 2026-06-11
Repository: Javalin13/FleetConnectFork
Branch: phase-a4.3-email-forensics-account-flow

## Scope

This report covers email forensics before remediation for:

- BOOKING_CONFIRMATION
- BOOKING_ACCEPTED
- DRIVER_ASSIGNMENT_REQUEST
- DRIVER_ASSIGNED
- Account request notifications

No Stripe, SEO rollout, B2B Portal, TaxisBrussels split, dispatch redesign, or broad UI redesign work was performed.

## Executive Finding

Root cause classification: **E. Resend rejects request**

The communication triggers fire and browser requests reach the Supabase `send-email` Edge Function. The Edge Function then calls Resend, and Resend rejects the request with HTTP 403 because the Resend account is still in testing/sandbox mode and can only send to the Resend owner email address.

Exact Resend SDK message observed in live Supabase function logs:

```text
You can only send testing emails to your own email address (ryzenoutsourcing@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.
```

This is not a booking, dashboard, driver, template, payload, CORS, or JWT root cause. The production email lifecycle cannot be certified until the Resend domain/sender is verified or an approved verified sender is configured.

## Live Supabase Evidence

Live project: `rreqjjrmvytnwnsidmqi`

`send-email` function metadata:

| Item | Live value |
| --- | --- |
| Function exists | Yes |
| Function status | ACTIVE |
| Version observed | 6 |
| JWT verification | Enabled |
| `RESEND_API_KEY` secret name present | Yes |

Live function-body signals:

| Signal | Result |
| --- | --- |
| References `RESEND_API_KEY` | Yes |
| Contains unauthorized-origin rejection | Yes |
| Contains repository `bookings@fleetconnect.be` sender | No |
| Contains `onboarding@resend.dev` sender | Yes |
| Contains literal `fleetconnectfork.vercel.app` origin | No |

Interpretation:

- The live deployed function is not fully aligned with the current repository `send-email` body.
- Even with the old `onboarding@resend.dev` sender, Resend rejects non-owner recipients because the account is still restricted.
- Deploying a branded sender alone will not succeed unless the FleetConnect sending domain is verified in Resend.

## Edge Function Requests

Recent live Edge Function gateway logs show repeated `send-email` executions:

| Request | Status | Classification |
| --- | --- | --- |
| `POST /functions/v1/send-email` | 400 | Function received request, Resend rejected request |
| `OPTIONS /functions/v1/send-email` | 200 | Preflight handled |

Representative execution IDs observed:

- `ba3dc1e4-400b-4092-89f5-12095c5f50eb`
- `b54d7dc8-041a-466f-8db4-da054d88ddd5`
- `070e8ce0-304f-4f93-8c88-c73a86a0cb5a`

## Function Console Evidence

Function logs show the following triggers were attempted:

- `BOOKING_CONFIRMATION`
- `BOOKING_CONFIRMATION_OPERATIONS`
- `BOOKING_CONFIRMATION_TECHNICAL_ESCALATION`
- `BOOKING_ACCEPTED`
- `BOOKING_ACCEPTED_OPERATIONS`
- `BOOKING_ACCEPTED_TECHNICAL_ESCALATION`
- `DRIVER_ASSIGNMENT_REQUEST`
- `DRIVER_ASSIGNMENT_REQUEST_OPERATIONS`
- `DRIVER_ASSIGNMENT_REQUEST_TECHNICAL_ESCALATION`

Examples from live logs:

```text
[Email Dispatch] Trigger: BOOKING_CONFIRMATION | To: sensei.directory@gmail.com
[Email Dispatch] Trigger: BOOKING_ACCEPTED | To: jan.blommaert23@gmail.com
[Email Dispatch] Trigger: DRIVER_ASSIGNMENT_REQUEST | To: Ryzenoutsourcing@gmail.com
```

Each failed path was followed by the same Resend 403 validation error.

## Browser / Network Inference

Direct browser console output was not attached to this task, but live Supabase evidence confirms:

- Trigger calls reached `send-email`.
- Requests were not blocked before the Edge Function.
- JWT was accepted enough for the function to execute.
- The function returned HTTP 400 after Resend rejection.

Repository remediation now improves browser diagnostics so the next live retest will expose the exact response in console logs.

## Communication Layer Verification

Repository inspection confirms:

| Trigger | Fired from | Recipient path |
| --- | --- | --- |
| `BOOKING_CONFIRMATION` | NL/FR/EN public booking pages after `create_public_booking` | Customer email from submitted snapshot |
| `BOOKING_ACCEPTED` | `Paneel/onderaannemerA.html` after operator acceptance | Customer email after booking rehydration |
| `DRIVER_ASSIGNMENT_REQUEST` | `Paneel/onderaannemerA.html` after assignment | Driver email from driver snapshot/row |
| `DRIVER_ASSIGNED` | `driver-accept.html` after driver accept RPC | Customer email after booking rehydration |

The shared failure point is downstream of template/recipient generation: Resend rejects the outbound send.

## Resend Status

Direct Resend dashboard/API access was not available in this workspace. However, the Supabase Edge Function log contains the Resend SDK response body and is sufficient to classify the failure:

- API key is present enough for the SDK to reach Resend.
- Resend account/domain is not production-enabled for arbitrary recipients.
- Required action is Resend domain verification and sender configuration.

## Repository Remediation Applied

Email diagnostics and deploy-readiness:

- `src/modules/communication/providers/resend.provider.js` now reads non-200 Edge Function response bodies and logs trigger, booking/request ID, recipients, and exact error.
- `supabase/functions/send-email/index.ts` now returns Resend error `message`, `code`, and `statusCode` to the browser caller.
- `send-email` now supports `FLEETCONNECT_EMAIL_FROM` for the verified production sender.
- `send-email` now supports `FLEETCONNECT_ALLOWED_ORIGINS` plus FleetConnect/FleetConnectFork origin matching while preserving explicit unauthorized-origin rejection.

Account request flow:

- `mailto:` account request behavior was removed from `Paneel/admin-index.html`.
- A new in-app request form saves through `submit_account_request`.
- A new `account_requests` table and narrow `submit_account_request(jsonb)` RPC were added.
- The form attempts internal and requester confirmation emails through `send-email`.
- If Resend is still blocked, the request remains saved and the UI reports that automatic email notification failed.

## Remaining External Blocker

Production email delivery remains blocked until Resend is configured:

1. Verify `fleetconnect.be` or the approved sending domain in Resend.
2. Configure DNS records required by Resend.
3. Set Supabase Edge Function secret `FLEETCONNECT_EMAIL_FROM` to a verified sender, for example `FleetConnect <bookings@fleetconnect.be>`.
4. Redeploy `send-email`.
5. Retest booking confirmation, booking accepted, driver assignment, driver accepted, and account request emails.

## Certification Status

Email lifecycle is **NOT CERTIFIED**.

The repository now contains the correct diagnostics and in-app account request flow, but live email delivery cannot pass until the Resend domain/sender restriction is resolved.

## Phase A.4.3 Follow-Up: Verified Domain Sender Deployment

Date: 2026-06-11

Follow-up live evidence from the Resend dashboard confirmed that `fleetconnect.be` is verified, but production still showed `FleetConnect <onboarding@resend.dev>` as the sender. Supabase live body inspection confirmed the deployed `send-email` body was stale and still contained `onboarding@resend.dev`.

Actions completed:

- Added runtime sender diagnostics to `send-email`:
  - `FLEETCONNECT_EMAIL_FROM exists`
  - `Sender fallback used`
  - `Sender address used`
- Removed the live stale function body by redeploying `send-email`.
- Added Resend tag sanitization so metadata punctuation cannot create avoidable `422` errors.
- Redeployed `send-email` to live Supabase version 9 with JWT verification still enabled.

Live deployment verification:

| Check | Result |
| --- | --- |
| Live function version | 9 |
| Status | ACTIVE |
| JWT verification | true |
| Live body contains `FLEETCONNECT_EMAIL_FROM` | Yes |
| Live body contains `FleetConnect <bookings@fleetconnect.be>` | Yes |
| Live body contains `onboarding@resend.dev` | No |
| Live body contains sender diagnostics | Yes |
| Live body contains Resend tag sanitizer | Yes |

Runtime verification:

| Check | Result |
| --- | --- |
| Controlled `send-email` call | HTTP 200 |
| Resend response ID | `1b038b5b-d2af-46ae-9ebc-97c4f997b7b5` |
| `FLEETCONNECT_EMAIL_FROM exists` | yes |
| `Sender fallback used` | no |
| `Sender address used` | `FleetConnect <bookings@fleetconnect.be>` |

Lifecycle trigger routing remains intact:

- `BOOKING_CONFIRMATION` uses `send-email`.
- `BOOKING_ACCEPTED` uses `send-email`.
- `DRIVER_ASSIGNMENT_REQUEST` uses `send-email`.
- `DRIVER_ASSIGNED` uses `send-email`.
- `ACCOUNT_REQUEST_INTERNAL` and `ACCOUNT_REQUEST_CONFIRMATION` use `send-email`.

Current email certification status:

The sender deployment blocker is resolved at the Edge Function layer. Full lifecycle email certification still requires live end-to-end browser/inbox validation for booking confirmation, booking accepted, driver assignment, driver accepted/assigned, and account request emails.
