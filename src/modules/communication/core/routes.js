import { CommunicationConfig } from './config.js';

/**
 * RouteBuilder
 * Centralized logic for creating URLs and CTA links.
 */
export class RouteBuilder {
    static getBaseUrl() {
        // In development, you might want a localhost URL.
        // In production, use the configured website URL.
        return CommunicationConfig.brand.website;
    }

    static build(type, params = {}) {
        const baseUrl = this.getBaseUrl();

        switch (type) {
            case 'view-booking':
                return `${baseUrl}/klantenportaalpv.html?id=${params.id}`;

            case 'review':
                return `${baseUrl}/review/${params.id}`; // Future route

            case 'support-whatsapp':
                return `https://wa.me/${CommunicationConfig.brand.supportWhatsapp}`;

            case 'book-new':
                return `${baseUrl}/PV.html#booking`;

            case 'account-welcome':
                return `${baseUrl}/setup-account.html?token=${params.token}`;

            default:
                return baseUrl;
        }
    }
}
