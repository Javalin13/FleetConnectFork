# FleetConnect Customer Email Lifecycle Policy

Date: 2026-06-11
Branch: phase-a4.4.1-customer-email-lifecycle-refinement

## Customer-Facing Emails

FleetConnect customer emails are limited to events that matter directly to the customer.

| Event | Trigger | Customer meaning | Template trigger |
| --- | --- | --- | --- |
| Account created | Customer registers/creates account | Customer can access the portal and add rides by booking number | `CUSTOMER_REGISTRATION_CONFIRMATION` |
| Booking received | Customer submits booking | Request received and being processed | `BOOKING_CONFIRMATION` |
| Ride confirmed | Assigned driver accepts ride | Ride is truly confirmed with driver details | `DRIVER_ASSIGNED` |
| Driver updated | A previously accepted driver is replaced and the new driver accepts | Customer receives updated driver details | `DRIVER_REASSIGNED` |
| Ride completed/review | Ride is marked completed | Customer receives completion note and review CTA | `RIDE_COMPLETED_REVIEW_REQUEST` / `RIDE_COMPLETED` |

## Internal-Only Events

These events must not send customer emails:

- operator accepts/reviews booking
- driver assignment request
- driver decline
- `reassignment_needed` waiting state
- internal dispatch status updates

`BOOKING_ACCEPTED` and `DRIVER_DECLINED` are enforced as internal-only in `CommunicationService`. They may generate operations copies, but not customer emails.

## Reassignment Rules

1. Driver decline stores a `booking_reassignment_events` audit event.
2. Driver decline clears `assigned_driver_id`, clears `assigned_driver`, marks the booking `reassignment_needed`, and stores the declined driver in booking metadata.
3. Customer receives no email while the ride waits for reassignment.
4. When a replacement driver accepts, `driver_accept_assignment` returns `DRIVER_REASSIGNED`.
5. Only after the replacement driver accepts does FleetConnect send the customer updated driver details.

## Persisted State

Lifecycle state is stored in Supabase:

- `bookings.status`
- `bookings.assigned_driver_id`
- `bookings.assigned_driver`
- `bookings.assignment_*` timestamps/token fields
- `bookings.metadata.requires_reassignment`
- `bookings.metadata.declined_driver`
- `bookings.metadata.customer_notification_history`
- `bookings.metadata.customer_ride_confirmed_email_sent_at`
- `bookings.metadata.customer_driver_update_email_sent_at`
- `bookings.metadata.customer_review_request_email_sent_at`
- `booking_reassignment_events`

The `record_customer_lifecycle_email` RPC records customer lifecycle email success only after the frontend communication call succeeds.

## Validation Status

Static validation completed:

- Communication modules parse with `node --check`.
- Touched inline scripts parse.
- `BOOKING_ACCEPTED` customer email is suppressed by service policy and dashboard no longer calls it for customer notification.
- Driver accept uses the Supabase-returned trigger: `DRIVER_ASSIGNED` or `DRIVER_REASSIGNED`.
- Driver decline uses `operationsOnly` and passes the declined-driver snapshot.

Pending live validation:

1. Customer registration confirmation email.
2. Booking confirmation email after booking creation.
3. No customer email on operator acceptance.
4. Customer ride-confirmed email after driver acceptance.
5. No customer email on driver decline.
6. Dispatch notification on driver decline.
7. Updated-driver email only after replacement driver accepts.
8. Completed ride review request after a real completion action is certified.
