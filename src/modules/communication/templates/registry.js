import { TemplateRenderer } from './renderer.js';

/**
 * TemplateRegistry
 * Maps lifecycle triggers to rendering logic and metadata.
 */
export const TemplateRegistry = {
    BOOKING_CONFIRMATION: {
        render: (data, lang, mode) => TemplateRenderer.render('BOOKING_CONFIRMATION', data, lang, mode)
    },
    BOOKING_ACCEPTED: {
        render: (data, lang, mode) => TemplateRenderer.render('BOOKING_ACCEPTED', data, lang, mode)
    },
    DRIVER_ASSIGNED: {
        render: (data, lang, mode) => TemplateRenderer.render('DRIVER_ASSIGNED', data, lang, mode)
    },
    DRIVER_ASSIGNMENT_REQUEST: {
        render: (data, lang, mode) => TemplateRenderer.render('DRIVER_ASSIGNMENT_REQUEST', data, lang, mode)
    },
    DRIVER_DECLINED: {
        render: (data, lang, mode) => TemplateRenderer.render('DRIVER_DECLINED', data, lang, mode)
    },
    BOOKING_CANCELLED: {
        render: (data, lang, mode) => TemplateRenderer.render('BOOKING_CANCELLED', data, lang, mode)
    },
    RIDE_COMPLETED: {
        render: (data, lang, mode) => TemplateRenderer.render('RIDE_COMPLETED', data, lang, mode)
    },
    ACCOUNT_ONBOARDING: {
        render: (data, lang, mode) => TemplateRenderer.render('ACCOUNT_ONBOARDING', data, lang, mode)
    },
    CUSTOMER_REGISTRATION_CONFIRMATION: {
        render: (data, lang, mode) => TemplateRenderer.render('CUSTOMER_REGISTRATION_CONFIRMATION', data, lang, mode)
    },
    // Compatibility aliases
    BOOKING_COMPLETED: {
        render: (data, lang, mode) => TemplateRenderer.render('RIDE_COMPLETED', data, lang, mode)
    },
    ACCOUNT_WELCOME: {
        render: (data, lang, mode) => TemplateRenderer.render('ACCOUNT_ONBOARDING', data, lang, mode)
    },
    PAYMENT_REFUND_CONFIRMATION: {
        render: (data, lang, mode) => TemplateRenderer.render('PAYMENT_REFUND_CONFIRMATION', data, lang, mode)
    }
};
