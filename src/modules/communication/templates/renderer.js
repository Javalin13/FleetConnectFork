import { CommunicationConfig } from '../core/config.js';
import { EmailComponents } from './components/base.js';
import { LanguageEngine } from '../l10n/engine.js';
import { RouteBuilder } from '../core/routes.js';

/**
 * TemplateRenderer
 * Orchestrates the assembly of component-based, multilingual, and responsive emails.
 * Standardizes relational data access to prevent undefined/null rendering.
 */
export class TemplateRenderer {
    /**
     * Main rendering entry point.
     */
    static render(trigger, data, lang, mode = 'single') {
        const languages = mode === 'trilingual'
            ? CommunicationConfig.settings.trilingualOrder
            : [lang];

        let bodyHtml = '';

        languages.forEach((l, index) => {
            const bundle = LanguageEngine.getTranslations(l);
            const content = this.getTemplateContent(trigger, data, bundle, l);

            if (index > 0) bodyHtml += EmailComponents.divider();
            bodyHtml += content;
        });

        const globalBundle = LanguageEngine.getTranslations(lang);
        return this.wrapInBaseLayout(bodyHtml, globalBundle.labels);
    }

    static wrapInBaseLayout(content, labels) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>FleetConnect Update</title>
                <style>
                    body { margin: 0; padding: 0; background-color: ${CommunicationConfig.theme.backgroundColor}; -webkit-font-smoothing: antialiased; }
                    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                    @media screen and (max-width: 600px) {
                        .wrapper { width: 100% !important; }
                        .inner-content { padding: 30px 20px !important; }
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 0;">
                <center>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${CommunicationConfig.theme.backgroundColor}">
                        <tr>
                            <td align="center">
                                <table border="0" cellpadding="0" cellspacing="0" width="600" class="wrapper" bgcolor="#ffffff" style="margin: 40px 0; border: 1px solid #e2e8f0;">
                                    <tr><td>${EmailComponents.header(CommunicationConfig.brand.logoUrl)}</td></tr>
                                    <tr><td class="inner-content" style="padding: 50px 40px;">${content}</td></tr>
                                    <tr><td>${EmailComponents.footer(labels)}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </center>
            </body>
            </html>
        `;
    }

    static getTemplateContent(trigger, data, bundle, lang) {
        const labels = bundle.labels;
        const subjects = bundle.subjects;

        switch (trigger) {
            case 'BOOKING_CONFIRMATION': return this.renderBookingConfirmation(data, labels, subjects, lang);
            case 'BOOKING_ACCEPTED': return this.renderBookingAccepted(data, labels, subjects, lang);
            case 'DRIVER_ASSIGNMENT_REQUEST': return this.renderDriverAssignmentRequest(data, labels, subjects, lang);
            case 'DRIVER_ASSIGNED': return this.renderDriverAssigned(data, labels, subjects, lang);
            case 'BOOKING_CANCELLED': return this.renderBookingCancelled(data, labels, subjects, lang);
            case 'BOOKING_COMPLETED':
            case 'RIDE_COMPLETED':
                return this.renderBookingCompleted(data, labels, subjects, lang);
            case 'ACCOUNT_WELCOME':
            case 'ACCOUNT_ONBOARDING':
                return this.renderAccountWelcome(data, labels, subjects, lang);
            case 'PAYMENT_REFUND_CONFIRMATION':
                return this.renderPaymentRefundConfirmation(data, labels, subjects, lang);
            default: return `<p style="font-family: sans-serif;">Update regarding booking ${data.reference || data.id}</p>`;
        }
    }

    /**
     * Helper to get customer name safely
     */
    static getCustomerName(data) {
        return data.customer?.name || data.name || 'Valued Customer';
    }

    static renderBookingConfirmation(data, labels, subjects, lang) {
        const viewUrl = RouteBuilder.build('view-booking', { id: data.id });
        const distance = data.form_data?.distance_km || data.metadata?.distance_km || data.distance || '...';
        const customerName = this.getCustomerName(data);

        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: ${CommunicationConfig.theme.secondaryColor};">${subjects.BOOKING_CONFIRMATION}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(customerName)} ${labels.confirmationBody}
            </p>
            ${EmailComponents.sectionTitle(labels.summary)}
            <table width="100%" style="margin-bottom: 30px;">
                ${EmailComponents.detailsRow(labels.bookingReference, data.reference || data.id)}
                ${EmailComponents.detailsRow(labels.dateTime, `${data.datetime} ${data.time}`)}
                ${EmailComponents.detailsRow(labels.pickup, data.pickup || '...')}
                ${EmailComponents.detailsRow(labels.destination, data.destination || '...')}
                ${EmailComponents.detailsRow(labels.vehicle, data.vehicle || 'Standard')}
                ${EmailComponents.detailsRow(labels.distance, `${distance} km`)}
                ${EmailComponents.detailsRow(labels.price, `€ ${parseFloat(data.amount || 0).toFixed(2)}`)}
                ${EmailComponents.detailsRow(labels.payment, data.payment || 'Unspecified')}
            </table>
            ${EmailComponents.cta(labels.viewBooking, viewUrl)}
        `;
    }

    static renderBookingAccepted(data, labels, subjects, lang) {
        const customerName = this.getCustomerName(data);

        // CTA Routing Decision
        const ctaUrl = data.is_registered
            ? RouteBuilder.build('view-booking', { id: data.id })
            : RouteBuilder.build('setup-account-prefilled', { id: data.id, email: data.customer?.email || data.email });

        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: ${CommunicationConfig.theme.primaryColor};">${subjects.BOOKING_ACCEPTED}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(customerName)} ${labels.acceptedBody}
            </p>
            ${EmailComponents.sectionTitle(labels.summary)}
            <table width="100%" style="margin-bottom: 30px;">
                ${EmailComponents.detailsRow(labels.bookingReference, data.reference || data.id)}
                ${EmailComponents.detailsRow(labels.dateTime, `${data.datetime} ${data.time}`)}
                ${EmailComponents.detailsRow(labels.pickup, data.pickup || '...')}
            </table>
            ${EmailComponents.cta(labels.viewBooking, ctaUrl)}
        `;
    }

    static renderDriverAssignmentRequest(data, labels, subjects, lang) {
        const d = data.driver || {};
        const acceptUrl = RouteBuilder.build('driver-accept', { token: data.assignment_token });
        const declineUrl = RouteBuilder.build('driver-decline', { token: data.assignment_token });

        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: ${CommunicationConfig.theme.primaryColor};">${subjects.DRIVER_ASSIGNMENT_REQUEST}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(d.name || 'Driver')} ${labels.assignmentRequestBody}
            </p>
            ${EmailComponents.sectionTitle(labels.summary)}
            <table width="100%" style="margin-bottom: 30px;">
                ${EmailComponents.detailsRow(labels.bookingReference, data.id)}
                ${EmailComponents.detailsRow(labels.dateTime, `${data.datetime} ${data.time}`)}
                ${EmailComponents.detailsRow(labels.pickup, data.pickup || '...')}
                ${EmailComponents.detailsRow(labels.destination, data.destination || '...')}
                ${EmailComponents.detailsRow(labels.vehicle, data.vehicle || '...')}
            </table>

            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                <tr>
                    <td align="center">
                        <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" bgcolor="${CommunicationConfig.theme.primaryColor}" style="border-radius: 8px;">
                                    <a href="${acceptUrl}" target="_blank" style="font-size: 16px; font-family: 'Inter', sans-serif; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; border: 1px solid ${CommunicationConfig.theme.primaryColor}; display: inline-block; font-weight: 600;">
                                        ${labels.acceptAssignment}
                                    </a>
                                </td>
                                <td width="20"></td>
                                <td align="center" bgcolor="#ef4444" style="border-radius: 8px;">
                                    <a href="${declineUrl}" target="_blank" style="font-size: 16px; font-family: 'Inter', sans-serif; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; border: 1px solid #ef4444; display: inline-block; font-weight: 600;">
                                        ${labels.declineAssignment}
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `;
    }

    static renderDriverAssigned(data, labels, subjects, lang) {
        const d = data.driver || {};
        const customerName = this.getCustomerName(data);
        const driverFirstName = d.name ? d.name.split(' ')[0] : 'Your FleetConnect Driver';

        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: ${CommunicationConfig.theme.secondaryColor};">${subjects.DRIVER_ASSIGNED}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(customerName)} ${labels.assignedBody}
            </p>
            ${EmailComponents.sectionTitle(labels.driver)}
            <table width="100%" style="margin-bottom: 30px;">
                ${EmailComponents.detailsRow(labels.name, driverFirstName)}
                ${EmailComponents.detailsRow(labels.vehicle, `${d.vehicle || 'Luxury Vehicle'} (${d.color || '...'})`)}
                ${EmailComponents.detailsRow(labels.plate, d.license_plate || '...')}
            </table>
            ${EmailComponents.sectionTitle(labels.pickupInfo)}
            <table width="100%" style="margin-bottom: 30px;">
                ${EmailComponents.detailsRow(labels.dateTime, `${data.datetime} ${data.time}`)}
                ${EmailComponents.detailsRow(labels.pickup, data.pickup || '...')}
                ${EmailComponents.detailsRow(labels.destination, data.destination || '...')}
            </table>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-family: 'Inter', sans-serif; font-size: 14px; color: #64748b; text-align: center;">
                    ${labels.dispatchContact}: <strong>${CommunicationConfig.brand.supportPhone}</strong>
                </p>
            </div>
            ${EmailComponents.cta(labels.viewBooking, RouteBuilder.build('view-booking', { id: data.id }))}
        `;
    }

    static renderBookingCancelled(data, labels, subjects, lang) {
        const customerName = this.getCustomerName(data);
        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: #ef4444;">${subjects.BOOKING_CANCELLED}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(customerName)} ${labels.cancelledBody(data.reference || data.id)}
            </p>
            ${EmailComponents.cta(labels.bookNew, RouteBuilder.build('book-new'))}
        `;
    }

    static renderBookingCompleted(data, labels, subjects, lang) {
        const customerName = this.getCustomerName(data);
        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: ${CommunicationConfig.theme.secondaryColor};">${subjects.BOOKING_COMPLETED}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(customerName)} ${labels.completedBody}
            </p>
            ${EmailComponents.cta(labels.writeReview, RouteBuilder.build('review', { id: data.id }))}
            <div style="text-align: center; margin-top: 10px;">
                <a href="${RouteBuilder.build('book-new')}" style="color: ${CommunicationConfig.theme.primaryColor}; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; text-decoration: none;">
                    &rarr; ${labels.bookNew}
                </a>
            </div>
        `;
    }

    static renderAccountWelcome(data, labels, subjects, lang) {
        const customerName = this.getCustomerName(data);
        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: ${CommunicationConfig.theme.secondaryColor};">${subjects.ACCOUNT_WELCOME}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(customerName)} ${labels.welcomeBody}
            </p>
            ${EmailComponents.cta(labels.setupAccount, RouteBuilder.build('account-welcome', { token: data.token }))}
        `;
    }

    static renderPaymentRefundConfirmation(data, labels, subjects, lang) {
        const customerName = this.getCustomerName(data);
        return `
            <h2 style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 22px; color: ${CommunicationConfig.theme.primaryColor};">${subjects.PAYMENT_REFUND_CONFIRMATION}</h2>
            <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 15px; color: #475569; line-height: 24px;">
                ${labels.greeting(customerName)} ${labels.refundConfirmationBody}
            </p>
            ${EmailComponents.sectionTitle(labels.summary)}
            <table width="100%" style="margin-bottom: 30px;">
                ${EmailComponents.detailsRow(labels.bookingReference, data.reference || data.id)}
                ${EmailComponents.detailsRow(labels.price, `€ ${parseFloat(data.amount || 0).toFixed(2)}`)}
                ${EmailComponents.detailsRow(labels.refundStatus, 'Completed')}
            </table>
            ${EmailComponents.cta(labels.viewBooking, RouteBuilder.build('view-booking', { id: data.id }))}
        `;
    }
}
