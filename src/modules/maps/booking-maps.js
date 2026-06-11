const DEFAULT_CENTER = { lat: 50.8503, lng: 4.3517 };
const DEFAULT_PRICE_PER_KM = 1.5;

function asNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function setText(element, value) {
    if (element) element.innerHTML = value;
}

function normalizeLocation(location) {
    if (!location) return null;
    if (typeof location.lat === 'function' && typeof location.lng === 'function') return location;
    if (Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))) {
        return new google.maps.LatLng(Number(location.lat), Number(location.lng));
    }
    return null;
}

function getPlaceAddress(place) {
    if (!place) return '';
    if (place.formattedAddress) return place.formattedAddress;
    if (place.displayName) return String(place.displayName);
    return '';
}

function ensureAutocompleteStyle() {
    if (document.getElementById('fleetconnect-modern-maps-style')) return;
    const style = document.createElement('style');
    style.id = 'fleetconnect-modern-maps-style';
    style.textContent = `
        gmp-place-autocomplete.fleetconnect-place-autocomplete {
            display: block;
            width: 100%;
        }
        gmp-place-autocomplete.fleetconnect-place-autocomplete::part(input) {
            width: 100%;
            box-sizing: border-box;
            font: inherit;
        }
        input.fleetconnect-place-source {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }
    `;
    document.head.appendChild(style);
}

export async function createBookingMapsController(options = {}) {
    if (!window.google?.maps?.importLibrary) {
        throw new Error('Google Maps JavaScript API with importLibrary is unavailable');
    }

    const settings = {
        mapId: options.mapId || 'map',
        pickupInputId: options.pickupInputId || 'pickupInput',
        dropoffInputId: options.dropoffInputId || 'dropoffInput',
        countryCode: (options.countryCode || 'be').toLowerCase(),
        center: options.center || DEFAULT_CENTER,
        pricePerKm: asNumber(options.pricePerKm, DEFAULT_PRICE_PER_KM),
        routeColor: options.routeColor || '#d4af37',
        pickupPlaceholder: options.pickupPlaceholder || '',
        dropoffPlaceholder: options.dropoffPlaceholder || '',
        onPlaceSelected: options.onPlaceSelected || (() => {}),
        onRouteCalculated: options.onRouteCalculated || (() => {}),
        onRouteFailed: options.onRouteFailed || (() => {})
    };

    const [{ Map }, { PlaceAutocompleteElement }] = await Promise.all([
        google.maps.importLibrary('maps'),
        google.maps.importLibrary('places')
    ]);

    ensureAutocompleteStyle();

    const state = {
        map: null,
        directionsService: null,
        directionsRenderer: null,
        pickup: null,
        dropoff: null,
        pickupElement: null,
        dropoffElement: null
    };

    const mapElement = document.getElementById(settings.mapId);
    if (mapElement) {
        state.map = new Map(mapElement, {
            center: settings.center,
            zoom: 8,
            styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        });
        state.directionsRenderer = new google.maps.DirectionsRenderer({
            map: state.map,
            polylineOptions: { strokeColor: settings.routeColor, strokeWeight: 6 }
        });
    }
    state.directionsService = new google.maps.DirectionsService();

    function createAutocomplete(inputId, type, placeholder) {
        const input = document.getElementById(inputId);
        if (!input) return null;

        const autocomplete = new PlaceAutocompleteElement({
            includedRegionCodes: [settings.countryCode]
        });
        autocomplete.className = 'fleetconnect-place-autocomplete';
        if (placeholder) autocomplete.placeholder = placeholder;

        input.classList.add('fleetconnect-place-source');
        input.setAttribute('autocomplete', 'off');
        input.insertAdjacentElement('afterend', autocomplete);

        async function handleSelection(event) {
            const prediction = event.placePrediction || event.detail?.placePrediction;
            const place = prediction?.toPlace ? prediction.toPlace() : event.place || event.detail?.place;
            if (!place) return;

            await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
            const location = normalizeLocation(place.location);
            const address = getPlaceAddress(place);
            if (!location || !address) {
                settings.onRouteFailed(type);
                return;
            }

            input.value = address;
            const selected = { address, location };
            if (type === 'pickup') state.pickup = selected;
            else state.dropoff = selected;

            settings.onPlaceSelected(type, selected);
        }

        autocomplete.addEventListener('gmp-select', handleSelection);
        autocomplete.addEventListener('gmp-placeselect', handleSelection);
        return autocomplete;
    }

    state.pickupElement = createAutocomplete(settings.pickupInputId, 'pickup', settings.pickupPlaceholder);
    state.dropoffElement = createAutocomplete(settings.dropoffInputId, 'dropoff', settings.dropoffPlaceholder);

    function hasSelectedAddresses() {
        return !!(state.pickup?.location && state.dropoff?.location);
    }

    async function calculateRoute({ roundTrip = false } = {}) {
        if (!hasSelectedAddresses() || !state.directionsService) {
            settings.onRouteFailed('missing-address');
            return null;
        }

        return new Promise((resolve) => {
            state.directionsService.route({
                origin: state.pickup.location,
                destination: state.dropoff.location,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            }, (result, status) => {
                if (status !== 'OK' || !result?.routes?.[0]?.legs?.[0]) {
                    settings.onRouteFailed(status || 'route-failed');
                    resolve(null);
                    return;
                }

                if (state.directionsRenderer) state.directionsRenderer.setDirections(result);
                const leg = result.routes[0].legs[0];
                const oneWayDistanceKm = Number((leg.distance.value / 1000).toFixed(1));
                const oneWayDurationMin = Math.round(leg.duration.value / 60);
                const multiplier = roundTrip ? 2 : 1;
                const route = {
                    distanceKm: oneWayDistanceKm,
                    durationMin: oneWayDurationMin,
                    displayDistanceKm: oneWayDistanceKm * multiplier,
                    displayDurationMin: oneWayDurationMin * multiplier,
                    basePrice: oneWayDistanceKm * multiplier * settings.pricePerKm,
                    pickup: state.pickup,
                    dropoff: state.dropoff
                };

                if (state.map) {
                    const bounds = new google.maps.LatLngBounds();
                    bounds.extend(state.pickup.location);
                    bounds.extend(state.dropoff.location);
                    state.map.fitBounds(bounds);
                }

                settings.onRouteCalculated(route);
                resolve(route);
            });
        });
    }

    function clearRoute() {
        if (state.directionsRenderer) state.directionsRenderer.setDirections({ routes: [] });
    }

    function reset() {
        state.pickup = null;
        state.dropoff = null;
        clearRoute();
        const pickupInput = document.getElementById(settings.pickupInputId);
        const dropoffInput = document.getElementById(settings.dropoffInputId);
        if (pickupInput) pickupInput.value = '';
        if (dropoffInput) dropoffInput.value = '';
        if (state.pickupElement && 'value' in state.pickupElement) state.pickupElement.value = '';
        if (state.dropoffElement && 'value' in state.dropoffElement) state.dropoffElement.value = '';
    }

    return {
        state,
        hasSelectedAddresses,
        calculateRoute,
        clearRoute,
        reset,
        get map() { return state.map; },
        get pickupLocation() { return state.pickup?.location || null; },
        get dropoffLocation() { return state.dropoff?.location || null; }
    };
}
