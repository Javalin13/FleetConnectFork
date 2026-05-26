import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { bookingId, email, amount, paymentMethodType, successUrl, cancelUrl, customerId } = await req.json()

    // Initialize Supabase with SERVICE ROLE for DB writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // 1. Fetch booking to verify and check for active session
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      throw new Error("Booking not found")
    }

    // 2. Duplicate Payment Protection (DB Level)
    if (booking.payment_status === 'paid') {
        throw new Error("Booking already paid")
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: paymentMethodType === "App" ? ["bancontact"] : ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `FleetConnect Rit: ${bookingId}`,
              description: `Van ${booking.pickup} naar ${booking.destination}`,
            },
            unit_amount: Math.round(parseFloat(amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: bookingId,
      invoice_creation: {
        enabled: true,
      },
      metadata: {
        booking_id: bookingId,
        customer_id: customerId || booking.customer_id
      },
    }, {
      idempotencyKey: `session_${bookingId}`,
    })

    // 4. Update booking with session ID
    await supabaseClient
      .from("bookings")
      .update({
        stripe_session_id: session.id,
        payment_status: "pending_payment",
        status: "pending_payment"
      })
      .eq("id", bookingId)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
