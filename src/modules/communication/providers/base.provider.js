/**
 * BaseEmailProvider
 * Interface for all email delivery services.
 */
export class BaseEmailProvider {
    constructor(config) {
        this.config = config;
    }

    /**
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - HTML body
     * @param {object} options - Extra provider-specific options
     */
    async send(to, subject, html, options = {}) {
        throw new Error('Method "send" must be implemented by subclasses.');
    }
}
