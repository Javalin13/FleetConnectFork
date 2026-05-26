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
    const { bookingId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // 1. Get booking and payment intent
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("stripe_payment_intent_id, amount")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking?.stripe_payment_intent_id) {
      throw new Error("Booking or payment intent not found")
    }

    // 2. Execute refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      metadata: {
        booking_id: bookingId
      }
    })

    // 3. Update database is handled by the webhook (charge.refunded)
    // but we can return success here

    return new Response(
      JSON.stringify({ success: true, refundId: refund.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
