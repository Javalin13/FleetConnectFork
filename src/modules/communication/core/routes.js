import { CommunicationConfig } from './config.js';

/**
 * RouteBuilder
 * Centralized logic for creating URLs and CTA links.
 */
export class RouteBuilder {
    static getBaseUrl() {
        const origin = window.location?.origin;
        if (origin && origin !== 'null') {
            return origin;
        }
        return CommunicationConfig.brand.website;
    }

    static build(type, params = {}) {
        const baseUrl = this.getBaseUrl();

        switch (type) {
            case 'view-booking':
                return `${baseUrl}/PV/index.html?booking=${encodeURIComponent(params.id || '')}&email=${encodeURIComponent(params.email || '')}`;

            case 'review':
                return `${baseUrl}/review/${params.id}`; // Future route

            case 'support-whatsapp':
                return `https://wa.me/${CommunicationConfig.brand.supportWhatsapp}`;

            case 'book-new':
                return `${baseUrl}/PV/PV.html#booking`;

            case 'account-welcome':
                return `${baseUrl}/PV/register.html?token=${params.token}`;

            case 'setup-account-prefilled':
                return `${baseUrl}/PV/register.html?booking=${encodeURIComponent(params.id || '')}&email=${encodeURIComponent(params.email || '')}`;

            case 'customer-booking':
                return `${baseUrl}/PV/index.html?booking=${encodeURIComponent(params.id || '')}&email=${encodeURIComponent(params.email || '')}`;

            case 'driver-accept':
                return `${baseUrl}/driver-accept.html?token=${params.token}`;

            case 'driver-decline':
                return `${baseUrl}/driver-decline.html?token=${params.token}`;

            default:
                return baseUrl;
        }
    }
}
