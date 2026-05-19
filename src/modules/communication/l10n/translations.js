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
            ACCOUNT_WELCOME: 'Welkom bij FleetConnect'
        },
        labels: {
            bookingReference: 'Boekingsnummer',
            dateTime: 'Datum & Tijd',
            pickup: 'Ophaallocatie',
            destination: 'Bestemming',
            vehicle: 'Voertuig',
            driver: 'Uw Chauffeur',
            plate: 'Nummerplaat',
            support: 'Klantenservice',
            viewBooking: 'Bekijk Boeking',
            bookNew: 'Nieuwe Rit Boeken',
            writeReview: 'Schrijf een review',
            setupAccount: 'Account Instellen',
            summary: 'Rit Overzicht',
            pickupInfo: 'Ophaal Informatie',
            greeting: (name) => `Beste ${name},`,
            confirmationBody: 'we hebben uw boeking goed ontvangen. Ons team verwerkt uw aanvraag momenteel.',
            assignedBody: 'Uw persoonlijke chauffeur is toegewezen voor uw rit.',
            cancelledBody: (ref) => `Uw boeking met referentie <strong>${ref}</strong> is geannuleerd. Indien u reeds heeft betaald, wordt het bedrag teruggestort.`,
            completedBody: 'We hopen dat u een prettige rit heeft gehad. Bedankt voor uw vertrouwen in FleetConnect.',
            welcomeBody: 'Welkom bij FleetConnect. We hebben een account voor u klaargezet waarmee u ritten sneller kunt boeken en uw historie kunt inzien.'
        }
    },
    fr: {
        subjects: {
            BOOKING_CONFIRMATION: 'Votre réservation FleetConnect est reçue',
            BOOKING_ACCEPTED: 'Bonne nouvelle ! Votre réservation est acceptée',
            DRIVER_ASSIGNED: 'Votre chauffeur est en route',
            BOOKING_CANCELLED: 'Confirmation d\'annulation',
            BOOKING_COMPLETED: 'Merci d\'avoir voyagé avec FleetConnect',
            ACCOUNT_WELCOME: 'Bienvenue chez FleetConnect'
        },
        labels: {
            bookingReference: 'Référence de réservation',
            dateTime: 'Date et heure',
            pickup: 'Point de départ',
            destination: 'Destination',
            vehicle: 'Véhicule',
            driver: 'Votre Chauffeur',
            plate: 'Plaque d\'immatriculation',
            support: 'Service client',
            viewBooking: 'Voir la réservation',
            bookNew: 'Réserver une nouvelle course',
            writeReview: 'Laissez un avis',
            setupAccount: 'Configurer le compte',
            summary: 'Résumé du trajet',
            pickupInfo: 'Informations de prise en charge',
            greeting: (name) => `Cher/Chère ${name},`,
            confirmationBody: 'nous avons bien reçu votre réservation. Notre équipe traite actuellement votre demande.',
            assignedBody: 'Votre chauffeur personnel a été assigné pour votre trajet.',
            cancelledBody: (ref) => `Votre réservation avec la référence <strong>${ref}</strong> a été annulée. Si vous avez déjà payé, le montant vous sera remboursé.`,
            completedBody: 'Nous espérons que vous avez passé un agréable trajet. Merci de votre confiance en FleetConnect.',
            welcomeBody: 'Bienvenue chez FleetConnect. Nous avons préparé un compte pour vous permettre de réserver vos trajets plus rapidement.'
        }
    },
    en: {
        subjects: {
            BOOKING_CONFIRMATION: 'Your FleetConnect booking is received',
            BOOKING_ACCEPTED: 'Good news! Your booking is accepted',
            DRIVER_ASSIGNED: 'Your driver is on the way',
            BOOKING_CANCELLED: 'Cancellation confirmation',
            BOOKING_COMPLETED: 'Thank you for traveling with FleetConnect',
            ACCOUNT_WELCOME: 'Welcome to FleetConnect'
        },
        labels: {
            bookingReference: 'Booking Reference',
            dateTime: 'Date & Time',
            pickup: 'Pickup Location',
            destination: 'Destination',
            vehicle: 'Vehicle',
            driver: 'Your Driver',
            plate: 'License Plate',
            support: 'Customer Support',
            viewBooking: 'View Booking',
            bookNew: 'Book New Ride',
            writeReview: 'Write a review',
            setupAccount: 'Setup Account',
            summary: 'Ride Summary',
            pickupInfo: 'Pickup Information',
            greeting: (name) => `Dear ${name},`,
            confirmationBody: 'we have received your booking. Our team is currently processing your request.',
            assignedBody: 'Your personal chauffeur has been assigned for your ride.',
            cancelledBody: (ref) => `Your booking with reference <strong>${ref}</strong> has been cancelled. If you have already paid, the amount will be refunded.`,
            completedBody: 'We hope you had a pleasant ride. Thank you for your trust in FleetConnect.',
            welcomeBody: 'Welcome to FleetConnect. We have set up an account for you to book rides faster and view your history.'
        }
    }
};
