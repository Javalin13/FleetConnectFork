import { BaseEmailProvider } from './base.provider.js';

/**
 * MockProvider
 * Logs email payloads to console. Useful for development and verification.
 */
export class MockProvider extends BaseEmailProvider {
    async send(to, subject, html, options = {}) {
        console.group('📧 [MOCK EMAIL SENT]');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('HTML Length:', html.length, 'chars');
        console.log('Options:', options);
        console.groupCollapsed('HTML Content (Click to expand)');
        console.log(html);
        console.groupEnd();
        console.groupEnd();

        return {
            success: true,
            id: `mock-${Date.now()}`,
            provider: 'mock'
        };
    }
}
