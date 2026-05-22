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
            metadata: {
                bookingId: options.bookingId,
                trigger: options.trigger
            }
        };

        try {
            // Use Supabase credentials from context if available, otherwise fallback to config
            const baseUrl = options.supabaseUrl || CommunicationConfig.settings.supabaseUrl;
            const supabaseKey = options.supabaseKey || CommunicationConfig.settings.supabaseKey || '';
            const functionBase = CommunicationConfig.settings.edgeFunctionBase || '/functions/v1';
            const endpoint = this.config.endpoint;

            // Handle potential double-slashes during path construction
            const cleanFunctionBase = functionBase.endsWith('/') ? functionBase.slice(0, -1) : functionBase;
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const fullUrl = `${baseUrl}${cleanFunctionBase}${cleanEndpoint}`;

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || data.message || `HTTP ${response.status}: Dispatch failed via backend`);
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
