import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getResend } from '@/lib/resend';

// Use lazy initialization
let supabaseAdminInstance: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    supabaseAdminInstance = createClient(url, key);
  }
  return supabaseAdminInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { subject, message, secret } = await req.json();

    const roleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (secret !== roleKey?.slice(0, 10)) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) throw new Error('Supabase admin not configured');

    const { data: subscribers, error: dbError } = await supabaseAdmin
      .from('subscribers')
      .select('email');

    if (dbError) throw dbError;
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No subscribers found' });
    }

    const emails = subscribers.map(s => s.email);

    // 2. Broadcast via Resend
    const resend = getResend();
    if (!resend) {
       return NextResponse.json({ error: 'Resend API not configured' }, { status: 500 });
    }

    // Resend allows sending to multiple recipients in one call (batching) 
    // or by using Bcc for privacy.
    // Max 50 recipients per send in the base plan.
    const chunks = [];
    for (let i = 0; i < emails.length; i += 50) {
      chunks.push(emails.slice(i, i + 50));
    }

    let sentCount = 0;
    for (const chunk of chunks) {
      const response = await resend.emails.send({
        from: 'HDZ-STORE <marketing@resend.dev>', // Use verified domain later
        to: 'musaab.asa@gmail.com', // Sent to admin but Bcc subscribers
        bcc: chunk,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1c1c; border: 1px solid #eee; padding: 40px;">
            <h1 style="font-size: 20px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">HDZ-STORE UPDATE.</h1>
            <div style="font-size: 15px; line-height: 1.8; color: #444; white-space: pre-wrap;">
              ${message}
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
               <p style="font-size: 11px; color: #999; text-align: center;">You are receiving this because you subscribed to HDZ-STORE network.</p>
               <p style="font-size: 11px; color: #999; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px;">Elite Hardware Lab.</p>
            </div>
          </div>
        `
      });
      if (response.data) sentCount += chunk.length;
    }

    return NextResponse.json({ 
      success: true, 
      count: sentCount,
      message: `Successfully broadcast to ${sentCount} subscribers.`
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    endpoint: "/api/broadcast",
    time: new Date().toISOString()
  });
}
