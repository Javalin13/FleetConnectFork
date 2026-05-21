import { BaseEmailProvider } from './base.provider.js';
import { CommunicationConfig } from '../core/config.js';

/**
 * ResendProvider
 * Integration with Resend.com API via Supabase Edge Function.
 */
export class ResendProvider extends BaseEmailProvider {
    /**
     * @param {object} config - Must include { endpoint, from }
     */
    constructor(config) {
        super(config);
    }

    /**
     * Send email via secure backend abstraction.
     * This protects the Resend API key by executing the call server-side.
     */
    async send(to, subject, html, options = {}) {
        const payload = {
            from: options.from || this.config.from,
            reply_to: options.replyTo || this.config.replyTo,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html,
            metadata: options.metadata || {}
        };

        try {
            // Attempt to call the secure backend endpoint (Supabase Edge Function)
            const baseUrl = CommunicationConfig.settings.supabaseUrl;
            const functionBase = CommunicationConfig.settings.edgeFunctionBase;
            const endpoint = this.config.endpoint;

            const response = await fetch(`${baseUrl}${functionBase}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || `HTTP ${response.status}: Failed to dispatch via backend`);
            }

            const data = await response.json();

            return {
                success: true,
                id: data.id || `resend-${Date.now()}`,
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
