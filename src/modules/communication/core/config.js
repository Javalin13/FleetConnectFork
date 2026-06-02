/**
 * FleetConnect Communication Configuration
 * Centralized theme, branding, and service settings.
 */
export const CommunicationConfig = {
    brand: {
        name: 'FleetConnect',
        email: 'fleetconnect.os@gmail.com',
        website: 'https://fleetconnect.be',
        reviewUrl: '',
        logoUrl: '', // To be filled later
        supportPhone: '+3200000000',
        supportWhatsapp: '3200000000',
        operationsEmail: 'fleetconnect.os@gmail.com',
        technicalEscalationEmail: 'ryzenoutsourcing@gmail.com'
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
        provider: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'mock' : 'resend',
        supabaseUrl: 'https://rreqjjrmvytnwnsidmqi.supabase.co',
        edgeFunctionBase: '/functions/v1',
        ASSIGNMENT_TIMEOUT_MINUTES: 30
    },
    providers: {
        resend: {
            // Secure backend endpoint (Supabase Edge Function)
            // This prevents exposing the Resend API Key in the browser.
            endpoint: '/send-email',
            from: 'FleetConnect <onboarding@resend.dev>',
            replyTo: 'fleetconnect.os@gmail.com'
        }
    }
};
