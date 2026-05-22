import { EmailTranslations } from './translations.js';
import { CommunicationConfig } from '../core/config.js';

/**
 * LanguageEngine
 * Handles language detection, single-language vs. trilingual fallback logic.
 */
export class LanguageEngine {
    /**
     * Determine the language to use based on priority rules.
     * 1. Explicit preference
     * 2. Booking snapshot
     * 3. Website current UI lang (detected via data-lang)
     */
    static detectLanguage(booking, customer) {
        const lang = booking?.preferred_language ||
                     customer?.preferred_language ||
                     document.documentElement.lang ||
                     CommunicationConfig.settings.defaultLanguage;

        return CommunicationConfig.settings.supportedLanguages.includes(lang.toLowerCase())
            ? lang.toLowerCase()
            : CommunicationConfig.settings.defaultLanguage;
    }

    /**
     * Get subject line based on mode.
     */
    static getSubject(trigger, lang, mode = 'single') {
        const set = EmailTranslations[lang] || EmailTranslations['en'] || { subjects: {} };
        return set.subjects[trigger] || `Update: ${trigger}`;
    }

    /**
     * Get trilingual subject (Belgian Fallback).
     */
    static getTrilingualSubject(trigger) {
        const order = CommunicationConfig.settings.trilingualOrder || ['nl', 'fr', 'en'];
        return order
            .map(lang => {
                const set = EmailTranslations[lang] || {};
                return set.subjects ? set.subjects[trigger] : null;
            })
            .filter(Boolean)
            .join(' | ');
    }

    /**
     * Get translation bundle for a specific language.
     */
    static getTranslations(lang) {
        return EmailTranslations[lang] || EmailTranslations['en'];
    }
}
