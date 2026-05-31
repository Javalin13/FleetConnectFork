import { CommunicationConfig } from '../../core/config.js';

/**
 * Common HTML components for luxury, responsive emails.
 * Uses table-based layouts for cross-client compatibility (Outlook/Gmail).
 */
export const EmailComponents = {
    /**
     * Luxury Header with optional logo.
     */
    header: (logoUrl) => `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${CommunicationConfig.theme.secondaryColor};">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    ${logoUrl
                        ? `<img src="${logoUrl}" alt="FleetConnect" width="220" style="display: block; width: 220px; max-width: 100%;">`
                        : `<h1 style="color: #ffffff; margin: 0; font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;">FLEET<span style="color: ${CommunicationConfig.theme.primaryColor};">CONNECT</span></h1>`
                    }
                </td>
            </tr>
        </table>
    `,

    /**
     * Standardized Section Title.
     */
    sectionTitle: (title, color) => `
        <h3 style="color: ${color || CommunicationConfig.theme.primaryColor}; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
            ${title}
        </h3>
    `,

    /**
     * Details Row for summaries.
     */
    detailsRow: (label, value) => `
        <tr>
            <td style="padding: 10px 0; font-family: 'Inter', sans-serif; font-size: 14px; color: #64748b; width: 160px; vertical-align: top;">${label}</td>
            <td style="padding: 10px 0; font-family: 'Inter', sans-serif; font-size: 14px; color: ${CommunicationConfig.theme.secondaryColor}; font-weight: 600; vertical-align: top;">${value}</td>
        </tr>
    `,

    /**
     * Premium CTA Button.
     */
    cta: (text, url) => `
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center" bgcolor="${CommunicationConfig.theme.primaryColor}" style="border-radius: 50px;">
                                <a href="${url}" target="_blank" style="display: inline-block; padding: 18px 48px; font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; color: ${CommunicationConfig.theme.secondaryColor}; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                                    ${text}
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `,

    /**
     * trilingual Divider.
     */
    divider: () => `
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td style="padding: 50px 0;">
                    <div style="border-top: 1px solid #e2e8f0;"></div>
                </td>
            </tr>
        </table>
    `,

    /**
     * Standardized Footer.
     */
    footer: (labels) => `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
            <tr>
                <td align="center" style="padding: 50px 20px;">
                    <p style="margin: 0 0 20px 0; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; color: ${CommunicationConfig.theme.secondaryColor}; text-transform: uppercase; letter-spacing: 2px;">
                        FLEET<span style="color: ${CommunicationConfig.theme.primaryColor};">CONNECT</span>
                    </p>
                    <p style="margin: 0 0 30px 0; font-family: 'Inter', sans-serif; font-size: 12px; line-height: 20px; color: #94a3b8;">
                        ${CommunicationConfig.brand.email} | ${CommunicationConfig.brand.website}<br>
                        ${labels.footerTagline}
                    </p>
                    <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding: 0 15px;">
                                <a href="https://wa.me/${CommunicationConfig.brand.supportWhatsapp}" style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: ${CommunicationConfig.theme.primaryColor}; text-decoration: none;">WhatsApp</a>
                            </td>
                            <td style="padding: 0 15px; border-left: 1px solid #e2e8f0;">
                                <a href="tel:${CommunicationConfig.brand.supportPhone}" style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: ${CommunicationConfig.theme.primaryColor}; text-decoration: none;">Support</a>
                            </td>
                        </tr>
                    </table>
                    <p style="margin: 40px 0 0 0; font-family: 'Inter', sans-serif; font-size: 11px; color: #cbd5e1;">
                        © ${new Date().getFullYear()} FleetConnect. ${labels.copyright}
                    </p>
                </td>
            </tr>
        </table>
    `
};
