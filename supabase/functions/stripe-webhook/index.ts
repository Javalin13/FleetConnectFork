import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  try {
    const body = await req.text()
    let event

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret!)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    console.log(`Processing event: ${event.type} [${event.id}]`)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const bookingId = session.client_reference_id
        const customerId = session.metadata?.customer_id

        if (bookingId) {
          // Check if already processed
          const { data: existing } = await supabaseClient
            .from("payments")
            .select("id")
            .eq("stripe_session_id", session.id)
            .maybeSingle()

          if (existing) {
            console.log(`Event ${event.id} already processed (Session ${session.id})`)
            break
          }

          // Fetch Invoice Details if available
          let invoicePdfUrl = null;
          let hostedInvoiceUrl = null;
          if (session.invoice) {
              try {
                  const invoice = await stripe.invoices.retrieve(session.invoice as string);
                  invoicePdfUrl = invoice.invoice_pdf;
                  hostedInvoiceUrl = invoice.hosted_invoice_url;
              } catch (e) {
                  console.error("Could not retrieve invoice details from Stripe", e);
              }
          }

          // Update booking status
          await supabaseClient
            .from("bookings")
            .update({
              payment_status: "paid",
              status: "pending",
              stripe_payment_intent_id: session.payment_intent as string,
              invoice_id: session.invoice as string,
              invoice_pdf_url: invoicePdfUrl
            })
            .eq("id", bookingId)

          // Insert into payments table
          await supabaseClient.from("payments").insert({
            booking_id: bookingId,
            customer_id: customerId,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total! / 100,
            status: "succeeded",
            payment_method: session.payment_method_types?.[0]
          })

          // Insert into invoices table
          if (session.invoice) {
            await supabaseClient.from("invoices").insert({
              booking_id: bookingId,
              stripe_invoice_id: session.invoice as string,
              status: "paid",
              amount_paid: session.amount_total! / 100,
              invoice_pdf_url: invoicePdfUrl,
              hosted_invoice_url: hostedInvoiceUrl
            })
          }

          // Insert into ledger
          await supabaseClient.from("transaction_ledger").insert({
            booking_id: bookingId,
            entity_type: "payment",
            amount: session.amount_total! / 100,
            entry_type: "credit",
            description: "Stripe Checkout Payment"
          })

          console.log(`Successfully processed payment for booking ${bookingId}`)
        }
        break
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object
        const bookingId = pi.metadata?.booking_id
        const customerId = pi.metadata?.customer_id

        const { data: existingPayment } = await supabaseClient
            .from("payments")
            .select("id")
            .eq("stripe_payment_intent_id", pi.id)
            .maybeSingle()

        if (!existingPayment && bookingId) {
            await supabaseClient.from("payments").insert({
                booking_id: bookingId,
                customer_id: customerId,
                stripe_payment_intent_id: pi.id,
                amount: pi.amount / 100,
                status: "succeeded",
                payment_method: pi.payment_method_types?.[0]
            })
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object
        const bookingId = charge.metadata?.booking_id

        if (bookingId) {
            const { data: existingRefund } = await supabaseClient
                .from("refunds")
                .select("id")
                .eq("stripe_refund_id", charge.refunds?.data[0]?.id)
                .maybeSingle()

            if (existingRefund) break

            await supabaseClient
                .from("bookings")
                .update({ payment_status: "refunded" })
                .eq("id", bookingId)

            const { data: payment } = await supabaseClient
                .from("payments")
                .select("id")
                .eq("stripe_payment_intent_id", charge.payment_intent)
                .maybeSingle()

            await supabaseClient.from("refunds").insert({
                payment_id: payment?.id,
                booking_id: bookingId,
                stripe_refund_id: charge.refunds?.data[0]?.id,
                amount: charge.amount_refunded / 100,
                status: "completed",
                reason: charge.refunds?.data[0]?.reason
            })

            await supabaseClient.from("transaction_ledger").insert({
                booking_id: bookingId,
                entity_type: "refund",
                amount: charge.amount_refunded / 100,
                entry_type: "debit",
                description: "Stripe Refund"
            })
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(`Webhook error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
