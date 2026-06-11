/**
 * DataNormalizer
 * Rehydrates and standardizes booking/customer objects for templates.
 * Performs full relational rehydration from Supabase to ensure a complete snapshot.
 */
export class DataNormalizer {
    /**
     * @param {string} bookingId - The booking UUID or ID
     * @param {object} supabaseClient - Existing Supabase client
     */
    static async rehydrateBookingSnapshot(bookingId, supabaseClient) {
        if (!bookingId || !supabaseClient) {
            console.error('❌ DataNormalizer: Missing bookingId or supabaseClient');
            return null;
        }

        try {
            console.log(`[DataNormalizer] Rehydrating snapshot for ${bookingId}`);

            // 1. Fetch full booking details
            const { data: booking, error: bError } = await supabaseClient
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .single();

            if (bError || !booking) {
                console.error(`❌ [DataNormalizer] Booking ${bookingId} lookup failed:`, bError?.message);
                throw new Error(`Booking ${bookingId} not found`);
            }

            // 2. Fetch Customer details
            let customer = null;
            if (booking.customer_id) {
                const { data: cData, error: cError } = await supabaseClient
                    .from('customers')
                    .select('*')
                    .eq('id', booking.customer_id)
                    .single();
                if (!cError) {
                    customer = cData;
                } else {
                    console.warn(`[DataNormalizer] Customer ${booking.customer_id} lookup failed (non-fatal):`, cError.message);
                }
            }

            // 3. Fetch Driver details (Relational UUID priority)
            let driver = null;
            if (booking.assigned_driver_id) {
                const { data: dData, error: dError } = await supabaseClient
                    .from('drivers')
                    .select('*')
                    .eq('id', booking.assigned_driver_id)
                    .single();
                if (!dError) {
                    driver = dData;
                } else {
                    console.warn(`[DataNormalizer] Driver ${booking.assigned_driver_id} lookup failed (non-fatal):`, dError.message);
                }
            }

            // 4. Fetch Partner details
            let partner = null;
            const pId = booking.partner_id || (booking.metadata?.partner_id);
            if (pId) {
                const { data: pData, error: pError } = await supabaseClient
                    .from('partners')
                    .select('*')
                    .eq('id', pId)
                    .single();
                if (!pError) {
                    partner = pData;
                } else {
                    console.warn(`[DataNormalizer] Partner ${pId} lookup failed (non-fatal):`, pError.message);
                }
            }

            // 5. Assemble Normalized Snapshot
            return {
                id: booking.id,
                reference: booking.id, // Compatibility
                datetime: booking.datetime,
                time: booking.time,
                pickup: booking.pickup,
                destination: booking.destination,
                vehicle: booking.vehicle,
                amount: parseFloat(booking.amount) || 0,
                payment: booking.payment,
                status: booking.status,
                flight_number: booking.flight_number,
                extras: booking.extras,
                distance_km: Number(
                    booking.distance_km ||
                    booking.route_distance_km ||
                    booking.form_data?.route_distance_km ||
                    booking.form_data?.distance_km ||
                    booking.metadata?.route_distance_km ||
                    booking.metadata?.distance_km ||
                    0
                ),
                duration_min: Number(
                    booking.duration_min ||
                    booking.route_duration_min ||
                    booking.form_data?.route_duration_min ||
                    booking.metadata?.route_duration_min ||
                    0
                ),
                preferred_language: booking.preferred_language || customer?.preferred_language || 'nl',
                customer: customer ? {
                    name: customer.full_name || customer.name || booking.name,
                    email: customer.email || booking.email,
                    phone: customer.phone || booking.phone,
                    preferred_language: customer.preferred_language || 'nl'
                } : {
                    name: booking.name,
                    email: booking.email,
                    phone: booking.phone
                },
                driver: driver ? {
                    id: driver.id,
                    name: driver.name,
                    email: driver.email,
                    vehicle: driver.vehicle,
                    color: driver.color,
                    license_plate: driver.license_plate,
                    phone: driver.phone
                } : (booking.assigned_driver ? booking.assigned_driver : null),
                partner: partner ? {
                    name: partner.name,
                    email: partner.email,
                    phone: partner.phone
                } : null,
                metadata: booking.metadata || {},
                form_data: booking.form_data || {},
                assignment_token: booking.assignment_token,
                assignment_accepted_at: booking.assignment_accepted_at,
                assignment_declined_at: booking.assignment_declined_at,
                is_registered: !!customer
            };

        } catch (error) {
            console.error('❌ DataNormalizer rehydration error:', error.message);
            return null;
        }
    }
}
