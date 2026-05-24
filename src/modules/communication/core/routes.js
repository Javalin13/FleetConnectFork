import { CommunicationConfig } from './config.js';

/**
 * RouteBuilder
 * Centralized logic for creating URLs and CTA links.
 */
export class RouteBuilder {
    static getBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `${window.location.protocol}//${window.location.host}`;
        }
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

            case 'setup-account-prefilled':
                return `${baseUrl}/setup-account.html?booking_id=${params.id}&email=${params.email}`;

            default:
                return baseUrl;
        }
    }
}
