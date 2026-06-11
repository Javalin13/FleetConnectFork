# Google Maps Forensics Report

Date: 2026-06-11
Branch: phase-a4-google-maps-modernization
Scope: Phase A.4.1 public booking Google Maps modernization

## Objective

Replace legacy Google Places Autocomplete usage on active/root NL/FR/EN public booking pages with a production-safe Maps JavaScript integration that supports address selection, route calculation, distance, duration, and price calculation before public booking submission.

## Official Google Guidance Reviewed

Google's current Maps JavaScript documentation describes the new Place Autocomplete widget through `PlaceAutocompleteElement`, a web component returned by the Places library. The migration guide states that the new widget improves localization, accessibility, mobile/small-screen support, performance, and returns the new `Place` class. Google examples load modern libraries with `google.maps.importLibrary('places')` and handle selection with `gmp-select`, then call `place.fetchFields()` for fields such as `formattedAddress` and `location`.

Sources:

- https://developers.google.com/maps/documentation/javascript/place-autocomplete-new
- https://developers.google.com/maps/documentation/javascript/legacy/places-migration-autocomplete
- https://developers.google.com/maps/documentation/javascript/legacy/places-migration-overview

## Repository-Wide Legacy Inventory

Search patterns:

- `google.maps.places.Autocomplete`
- `AutocompleteService`
- `SearchBox`
- `places.Autocomplete`
- `place_changed`
- `getPlace()`
- `libraries=places`
- `callback=initGoogleMaps`

Findings:

| Area | Legacy finding | Phase A.4.1 action |
| --- | --- | --- |
| `PV/PV.html` | Legacy `google.maps.places.Autocomplete`, `place_changed`, `getPlace()` | Replaced |
| `PV/PV_fr.html` | Legacy `google.maps.places.Autocomplete`, `place_changed`, `getPlace()` | Replaced |
| `PV/PV_en.html` | Legacy `google.maps.places.Autocomplete`, `place_changed`, `getPlace()` | Replaced |
| `PV.html` | Legacy `google.maps.places.Autocomplete`, `place_changed`, `getPlace()` | Replaced |
| `PV_fr.html` | Legacy `google.maps.places.Autocomplete`, `place_changed`, `getPlace()` | Replaced |
| `PV_en.html` | Legacy `google.maps.places.Autocomplete`, `place_changed`, `getPlace()` | Replaced |
| `PV/klantenportaalpv.html` and localized variants | Legacy customer-portal route widgets | Documented only; outside requested active/root booking-page scope |

No `AutocompleteService` or `SearchBox` usage was found in the repository search.

## Implementation

Added central module:

- `src/modules/maps/booking-maps.js`

The module provides:

- Modern `PlaceAutocompleteElement` creation for pickup/dropoff.
- `gmp-select` and compatibility `gmp-placeselect` handlers.
- `place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] })`.
- Selected-address storage with formatted address and Google location.
- Directions route calculation.
- Distance and duration calculation.
- Base price calculation at EUR 1.50/km.
- Map route rendering when a map container exists.

Updated active/root booking pages:

- `PV/PV.html`
- `PV/PV_fr.html`
- `PV/PV_en.html`
- `PV.html`
- `PV_fr.html`
- `PV_en.html`

## Production Booking Rules Preserved

The public booking flow still uses:

- `create_public_booking`
- NL/FR/EN page flows
- Existing booking lifecycle and email trigger path
- Positive calculated amount before submission

The public booking flow still blocks:

- Missing selected pickup/dropoff places
- Failed route calculation
- Missing distance
- Missing/invalid price
- `manual_route_required`
- deferred pricing
- null/zero amount booking submission

## Required Google Cloud APIs

The deployed key/project must have these enabled and allowed for the production domain:

- Maps JavaScript API
- Places API / Places API (New)
- Directions API, used through Maps JavaScript directions service

If suggestions still do not appear after this code change, the likely remaining cause is API-key/project configuration, referrer restrictions, billing, or disabled Places API (New).

## Validation Performed

Static repository validation:

- Active/root NL/FR/EN inline scripts parse.
- `src/modules/maps/booking-maps.js` passes `node --check`.
- Scoped pages no longer contain:
  - `google.maps.places.Autocomplete`
  - `place_changed`
  - `getPlace()`
  - `AutocompleteService`
  - `SearchBox`
- Scoped pages still call `create_public_booking`.
- Scoped pages do not contain `manual_route_required`, deferred-price text, or null amount path.

Live browser validation remains required after deployment:

1. Open `/nl`, `/fr`, and `/en`.
2. Confirm pickup/dropoff show modern Places suggestions.
3. Select a full pickup and dropoff address.
4. Confirm route distance and duration calculate.
5. Confirm price calculates before checkout.
6. Confirm booking cannot submit without valid selected places and route.
7. Submit one controlled booking and verify positive amount in Supabase.

## Status

Repository modernization is complete for the scoped active/root public booking pages.

Production certification remains blocked until live Google Cloud/API-key configuration and browser behavior are validated on the deployed domain.
