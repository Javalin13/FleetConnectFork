/**
 * FleetConnect Communication Configuration
 * Centralized theme, branding, and service settings.
 */
export const CommunicationConfig = {
    brand: {
        name: 'FleetConnect',
        email: 'Fleetconnect@gmail.com',
        website: 'https://fleetconnect.be',
        logoUrl: '', // To be filled later
        supportPhone: '+3200000000',
        supportWhatsapp: '3200000000'
    },
    theme: {
        primaryColor: '#2dd4bf', // Teal/Turquoise
        secondaryColor: '#0f172a', // Luxury Dark
        textColor: '#334155',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    settings: {
        defaultLanguage: 'nl',
        supportedLanguages: ['nl', 'fr', 'en'],
        fallbackMode: 'trilingual', // 'trilingual' or 'default'
        trilingualOrder: ['nl', 'fr', 'en'],
        provider: 'mock' // 'mock' or 'resend'
    },
    providers: {
        resend: {
            apiKey: '', // DO NOT commit real keys
            from: 'FleetConnect <noreply@fleetconnect.be>'
        }
    }
};
