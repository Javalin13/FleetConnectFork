import { BaseEmailProvider } from './base.provider.js';

/**
 * ResendProvider
 * Integration with Resend.com API.
 */
export class ResendProvider extends BaseEmailProvider {
    /**
     * @param {object} config - Must include { apiKey, from }
     */
    constructor(config) {
        super(config);
        if (!this.config.apiKey) {
            console.warn('⚠️ ResendProvider initialized without API Key.');
        }
    }

    async send(to, subject, html, options = {}) {
        const payload = {
            from: options.from || this.config.from,
            to: [to],
            subject: subject,
            html: html,
            ...options
        };

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send email via Resend');
            }

            return {
                success: true,
                id: data.id,
                provider: 'resend'
            };
        } catch (error) {
            console.error('❌ ResendProvider error:', error.message);
            return {
                success: false,
                error: error.message,
                provider: 'resend'
            };
        }
    }
}
