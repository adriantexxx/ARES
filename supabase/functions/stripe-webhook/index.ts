import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2025-02-24.acacia' })
const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

Deno.serve(async (request) => {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return new Response('Missing Stripe signature', { status: 400 })
  try {
    const event = await stripe.webhooks.constructEventAsync(await request.text(), signature, Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '')
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const checkout = event.data.object as Stripe.Checkout.Session
      const reference = checkout.client_reference_id
      if (reference?.startsWith('ares_')) {
        const { error } = await admin.from('support_requests').update({ payment_status: 'paid', status: 'paid', stripe_checkout_session_id: checkout.id }).eq('payment_reference', reference).eq('payment_status', 'pending')
        if (error) throw error
      }
    }
    return new Response(JSON.stringify({ received: true }), { headers: { 'content-type': 'application/json' } })
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Webhook verification failed', { status: 400 })
  }
})
