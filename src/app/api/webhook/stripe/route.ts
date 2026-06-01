import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env_override';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

let stripeInstance: Stripe | null = null;
let supabaseAdminInstance: any = null;

function getStripe() {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is required');
    stripeInstance = new Stripe(key, { apiVersion: '2024-12-18.acacia' as any });
  }
  return stripeInstance;
}

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const url = SUPABASE_URL;
    const key = SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase admin credentials missing');
    supabaseAdminInstance = createClient(url, key);
  }
  return supabaseAdminInstance;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      throw new Error('Missing stripe signature or webhook secret');
    }
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabaseAdmin = getSupabaseAdmin();

    // Fulfill the purchase...
    try {
      const { error } = await supabaseAdmin.from('orders').insert([{
        user_email: session.customer_email || session.customer_details?.email,
        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        status: 'completed',
        stripe_session_id: session.id,
      }]);

      if (error) {
        console.error('Supabase error inserting order:', error);
        return new Response('Error saving order', { status: 500 });
      }

      console.log('Order successfully saved to Supabase');
    } catch (err) {
      console.error('Error processing order:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
