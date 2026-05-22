import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

/**
 * FleetConnect Email Dispatch Edge Function
 * Securely handles Resend API calls without exposing keys to the client.
 */

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { to, subject, html, from, reply_to, metadata } = payload

    // 2. Strict Payload Validation
    if (!to || (Array.isArray(to) && to.length === 0)) {
      throw new Error('Missing recipient (to)')
    }
    if (!subject) throw new Error('Missing subject')
    if (!html) throw new Error('Missing html content')

    // Simple email format check for strings
    const recipients = Array.isArray(to) ? to : [to];
    for (const email of recipients) {
      if (!email.includes('@')) {
        throw new Error(`Invalid email format: ${email}`)
      }
    }

    console.log(`[Email Dispatch] Trigger: ${metadata?.trigger || 'Unknown'} | To: ${recipients.join(', ')}`);

    // 3. Dispatch via Resend
    // FORCE canonical sender if not provided or doesn't match FleetConnect domain
    const sender = 'FleetConnect <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: sender,
      to: to,
      subject: subject,
      html: html,
      reply_to: reply_to || 'fleetconnect.os@gmail.com',
      // Pass metadata as tags for Resend dashboard tracking
      tags: metadata ? Object.entries(metadata).map(([name, value]) => ({
        name: name.substring(0, 40),
        value: String(value).substring(0, 40)
      })) : []
    })

    if (error) {
      console.error('[Resend SDK Error]', error)
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 4. Success Response
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[Edge Function Exception]', error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
