import { NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe() {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }
  return stripeInstance;
}

export async function POST(req: Request) {
  try {
    const { items, customerEmail } = await req.json();

    const currency = (process.env.VITE_CURRENCY || process.env.NEXT_PUBLIC_CURRENCY || 'usd').toLowerCase();
    const baseUrl = process.env.VITE_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const lineItems = items.map((item: any) => {
      // Robust image extraction
      let imageUrl = '';
      if (Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0];
      } else if (typeof item.images === 'string') {
        imageUrl = item.images;
      } else if (item.image_url) {
        imageUrl = item.image_url;
      } else if (item.image) {
        imageUrl = item.image;
      }

      const price = Number(item.price);
      if (isNaN(price)) {
        console.error(`Invalid price for item: ${item.name}`, item.price);
      }

      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name || 'Premium Item',
            images: imageUrl ? [imageUrl] : [],
            description: item.description || '',
          },
          unit_amount: Math.round((isNaN(price) ? 0 : price) * 100),
        },
        quantity: parseInt(item.quantity) || 1,
      };
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: customerEmail,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
