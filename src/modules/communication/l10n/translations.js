/**
 * FleetConnect Email Translations
 * Supports NL, FR, EN for core transactional templates.
 */
export const EmailTranslations = {
    nl: {
        subjects: {
            BOOKING_CONFIRMATION: 'Uw FleetConnect boeking is ontvangen',
            BOOKING_ACCEPTED: 'Goed nieuws! Uw boeking is geaccepteerd',
            DRIVER_ASSIGNED: 'Uw chauffeur is onderweg',
            BOOKING_CANCELLED: 'Bevestiging van annulering',
            BOOKING_COMPLETED: 'Bedankt voor het reizen met FleetConnect',
            RIDE_COMPLETED: 'Bedankt voor het reizen met FleetConnect',
            ACCOUNT_WELCOME: 'Welkom bij FleetConnect',
            ACCOUNT_ONBOARDING: 'Welkom bij FleetConnect'
        },
        labels: {
            bookingReference: 'Boekingsnummer',
            dateTime: 'Datum & Tijd',
            pickup: 'Ophaallocatie',
            destination: 'Bestemming',
            vehicle: 'Voertuig',
            driver: 'Uw Chauffeur',
            plate: 'Nummerplaat',
            name: 'Naam',
            phone: 'Telefoon',
            price: 'Totaalprijs',
            payment: 'Betaalmethode',
            distance: 'Afstand',
            support: 'Klantenservice',
            viewBooking: 'Bekijk Boeking',
            bookNew: 'Nieuwe Rit Boeken',
            writeReview: 'Schrijf een review',
            setupAccount: 'Account Instellen',
            summary: 'Rit Overzicht',
            pickupInfo: 'Ophaal Informatie',
            greeting: (name) => `Beste ${name},`,
            confirmationBody: 'we hebben uw boeking goed ontvangen. Ons team verwerkt uw aanvraag momenteel.',
            acceptedBody: 'uw boeking is bevestigd door onze dispatching. We kijken ernaar uit u te mogen vervoeren.',
            assignedBody: 'uw persoonlijke chauffeur is toegewezen voor uw rit. Hieronder vindt u de details van uw chauffeur.',
            cancelledBody: (ref) => `uw boeking met referentie <strong>${ref}</strong> is geannuleerd. Indien u reeds heeft betaald, wordt het bedrag teruggestort.`,
            completedBody: 'we hopen dat u een prettige rit heeft gehad. Bedankt voor uw vertrouwen in FleetConnect.',
            welcomeBody: 'welkom bij FleetConnect. We hebben een account voor u klaargezet waarmee u ritten sneller kunt boeken en uw historie kunt inzien.'
        }
    },
    fr: {
        subjects: {
            BOOKING_CONFIRMATION: 'Votre réservation FleetConnect est reçue',
            BOOKING_ACCEPTED: 'Bonne nouvelle ! Votre réservation est acceptée',
            DRIVER_ASSIGNED: 'Votre chauffeur est en route',
            BOOKING_CANCELLED: 'Confirmation d\'annulation',
            BOOKING_COMPLETED: 'Merci d\'avoir voyagé avec FleetConnect',
            RIDE_COMPLETED: 'Merci d\'avoir voyagé avec FleetConnect',
            ACCOUNT_WELCOME: 'Bienvenue chez FleetConnect',
            ACCOUNT_ONBOARDING: 'Bienvenue chez FleetConnect'
        },
        labels: {
            bookingReference: 'Référence de réservation',
            dateTime: 'Date et heure',
            pickup: 'Point de départ',
            destination: 'Destination',
            vehicle: 'Véhicule',
            driver: 'Votre Chauffeur',
            plate: 'Plaque d\'immatriculation',
            name: 'Nom',
            phone: 'Téléphone',
            price: 'Prix total',
            payment: 'Mode de paiement',
            distance: 'Distance',
            support: 'Service client',
            viewBooking: 'Voir la réservation',
            bookNew: 'Réserver une nouvelle course',
            writeReview: 'Laissez un avis',
            setupAccount: 'Configurer le compte',
            summary: 'Résumé du trajet',
            pickupInfo: 'Informations de prise en charge',
            greeting: (name) => `Cher/Chère ${name},`,
            confirmationBody: 'nous avons bien reçu votre réservation. Notre équipe traite actuellement votre demande.',
            acceptedBody: 'votre réservation a été confirmée par notre dispatching. Nous nous réjouissons de vous transporter.',
            assignedBody: 'votre chauffeur personnel a été assigné pour votre trajet. Voici les détails de votre chauffeur.',
            cancelledBody: (ref) => `votre réservation avec la référence <strong>${ref}</strong> a été annulée. Si vous avez déjà payé, le montant vous sera remboursé.`,
            completedBody: 'nous espérons que vous avez passé un agréable trajet. Merci de votre confiance en FleetConnect.',
            welcomeBody: 'bienvenue chez FleetConnect. Nous avons préparé un compte pour vous permettre de réserver vos trajets plus rapidement.'
        }
    },
    en: {
        subjects: {
            BOOKING_CONFIRMATION: 'Your FleetConnect booking is received',
            BOOKING_ACCEPTED: 'Good news! Your booking is accepted',
            DRIVER_ASSIGNED: 'Your driver is on the way',
            BOOKING_CANCELLED: 'Cancellation confirmation',
            BOOKING_COMPLETED: 'Thank you for traveling with FleetConnect',
            RIDE_COMPLETED: 'Thank you for traveling with FleetConnect',
            ACCOUNT_WELCOME: 'Welcome to FleetConnect',
            ACCOUNT_ONBOARDING: 'Welcome to FleetConnect'
        },
        labels: {
            bookingReference: 'Booking Reference',
            dateTime: 'Date & Time',
            pickup: 'Pickup Location',
            destination: 'Destination',
            vehicle: 'Vehicle',
            driver: 'Your Driver',
            plate: 'License Plate',
            name: 'Name',
            phone: 'Phone',
            price: 'Total Price',
            payment: 'Payment Method',
            distance: 'Distance',
            support: 'Customer Support',
            viewBooking: 'View Booking',
            bookNew: 'Book New Ride',
            writeReview: 'Write a review',
            setupAccount: 'Setup Account',
            summary: 'Ride Summary',
            pickupInfo: 'Pickup Information',
            greeting: (name) => `Dear ${name},`,
            confirmationBody: 'we have received your booking. Our team is currently processing your request.',
            acceptedBody: 'your booking has been confirmed by our dispatching. We look forward to transporting you.',
            assignedBody: 'your personal chauffeur has been assigned for your ride. Below are the details of your driver.',
            cancelledBody: (ref) => `your booking with reference <strong>${ref}</strong> has been cancelled. If you have already paid, the amount will be refunded.`,
            completedBody: 'we hope you had a pleasant ride. Thank you for your trust in FleetConnect.',
            welcomeBody: 'welcome to FleetConnect. We have set up an account for you to book rides faster and view your history.'
        }
    }
};
