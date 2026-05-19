/**
 * CommunicationLogger
 * Tracks dispatch events for observability and debugging.
 */
export class CommunicationLogger {
    /**
     * Log a communication attempt.
     */
    static log(event) {
        const timestamp = new Date().toISOString();
        const {
            trigger,
            to,
            subject,
            status,
            provider,
            bookingId,
            lang,
            error
        } = event;

        const logEntry = `[${timestamp}] [${status.toUpperCase()}] ${trigger} | To: ${to} | Provider: ${provider} | Ref: ${bookingId || 'N/A'} | Lang: ${lang}`;

        if (status === 'success') {
            console.log(`✅ ${logEntry}`);
        } else {
            console.error(`❌ ${logEntry} | Error: ${error || 'Unknown'}`);
        }

        // Future: Persist to a Supabase 'communication_logs' table here.
    }
}
