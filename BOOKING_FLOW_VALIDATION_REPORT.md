# Booking Flow Validation Report

Date: 2026-06-08

## Current Flow Evidence

Active PV booking flow requires:

- pickup coordinate selected
- dropoff coordinate selected
- outbound date/time
- route calculation before vehicle/customer/payment steps
- vehicle selection before customer details
- customer contact details before final confirmation

`PV/PV.html` calls `create_public_booking` and then triggers `BOOKING_CONFIRMATION` with a snapshot.

## Pricing Evidence

- Base distance price uses `distanceKm * 1.5`.
- Round trip doubles distance/time before price calculation.
- Vehicle surcharges visible in PV page:
  - Standard: 0
  - Break: +5
  - Exclusive: +15
  - Mini Van: +10
- Visible extras are stored in `extras`; no separate surcharge is currently applied for water, WiFi, Meet & Greet, or Kiss & Ride.

## Fixes Applied

- Active branding and language-state hardening only.
- No pricing model change was made because that would be a business-rule change.

## Remaining Gaps

- If water bottle or child seat must be charged, the price table must be explicitly approved before implementation.
- Dashboard and booking page price parity needs live test evidence.
- Previous-button styling requires browser visual validation.

## Status

Requires manual browser validation. No booking architecture redesign performed.
