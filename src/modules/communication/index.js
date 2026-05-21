import { CommunicationConfig } from './core/config.js';
import { MockProvider } from './providers/mock.provider.js';
import { ResendProvider } from './providers/resend.provider.js';
import { TemplateRegistry } from './templates/registry.js';
import { LanguageEngine } from './l10n/engine.js';
import { DataNormalizer } from './core/normalizer.js';
import { CommunicationLogger } from './core/logger.js';

/**
 * CommunicationService (The Orchestrator)
 * Central entry point for all communication triggers.
 * Handles normalization, localization, and dispatching.
 */
export class CommunicationService {
    constructor() {
        this.providers = {
            mock: new MockProvider(),
            resend: new ResendProvider(CommunicationConfig.providers.resend)
        };
        this.activeProvider = this.providers[CommunicationConfig.settings.provider] || this.providers.mock;
    }

    /**
     * Dispatch a communication trigger by rehydrating the snapshot first.
     * @param {string} trigger - e.g., 'DRIVER_ASSIGNED'
     * @param {string} bookingId - The booking UUID
     * @param {object} supabaseClient - Shared supabase client
     */
    async trigger(trigger, bookingId, supabaseClient) {
        if (!bookingId || !supabaseClient) {
            console.error(`❌ CommunicationService: Missing ID or client for ${trigger}`);
            return;
        }

        try {
            // 1. Full Relational Rehydration
            const snapshot = await DataNormalizer.rehydrateBookingSnapshot(bookingId, supabaseClient);
            if (!snapshot) throw new Error('Failed to rehydrate snapshot');

            // 2. Localization Settings
            const lang = LanguageEngine.detectLanguage(snapshot, snapshot.customer);
            const mode = CommunicationConfig.settings.fallbackMode;

            // 3. Subject Construction
            const subject = mode === 'trilingual'
                ? LanguageEngine.getTrilingualSubject(trigger)
                : LanguageEngine.getSubject(trigger, lang);

            // 4. Rendering
            const template = TemplateRegistry[trigger];
            if (!template) throw new Error(`Template not found for ${trigger}`);
            const html = template.render(snapshot, lang, mode);

            // 5. Dispatch
            const to = snapshot.customer?.email || snapshot.email;
            if (!to) throw new Error('Recipient email missing');

            const result = await this.activeProvider.send(to, subject, html, {
                bookingId: snapshot.id,
                trigger: trigger
            });

            // 6. Logging
            CommunicationLogger.log({
                trigger,
                to,
                subject,
                status: result.success ? 'success' : 'failed',
                provider: result.provider,
                bookingId: snapshot.id,
                lang: mode === 'trilingual' ? 'TRILINGUAL' : lang,
                error: result.error
            });

            return result;

        } catch (error) {
            console.error(`❌ CommunicationService [${trigger}]:`, error.message);
            CommunicationLogger.log({
                trigger,
                status: 'error',
                bookingId,
                error: error.message
            });
        }
    }
}

// Export a singleton instance
export const comms = new CommunicationService();
