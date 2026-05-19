import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getResend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

// Use lazy initialization for admin operations
let supabaseAdminInstance: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      console.warn('Supabase URL or Service Role Key is missing. Database operations will be skipped.');
      return null;
    }
    
    try {
      supabaseAdminInstance = createClient(url, key);
    } catch (e) {
      console.error('Failed to create Supabase admin client:', e);
      return null;
    }
  }
  return supabaseAdminInstance;
}

export async function POST(req: NextRequest) {
  console.log('Subscribe API hit');
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    // 1. Save to Supabase
    const supabaseAdmin = getSupabaseAdmin();
    let dbSuccess = false;
    let dbErrorDetail = null;

    if (supabaseAdmin) {
      const { error: dbError } = await supabaseAdmin
        .from('subscribers')
        .upsert({ 
          email, 
          subscribed_at: new Date().toISOString()
        }, { onConflict: 'email' });

      if (dbError) {
        console.error('Database error in subscribe API:', dbError);
        dbErrorDetail = dbError.message;
      } else {
        console.log('Successfully saved to Supabase');
        dbSuccess = true;
      }
    } else {
      console.error('Supabase Admin client not initialized.');
      dbErrorDetail = 'Configuration missing';
    }

    // 2. Send Welcome Email via Resend
    const resend = getResend();
    let emailSuccess = false;
    let emailErrorDetail = null;

    if (resend) {
      try {
        const emailResponse = await resend.emails.send({
          from: 'HDZ-STORE <onboarding@resend.dev>',
          to: email,
          subject: 'Welcome to HDZ-STORE Global Network',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1c1c; border: 1px solid #eee; padding: 40px;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">Welcome to HDZ-STORE.</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #666;">You have been successfully added to our global innovation network.</p>
              <div style="background-color: #f5f5f5; padding: 30px; margin: 30px 0;">
                <p style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">The Mission</p>
                <p style="font-size: 13px; font-style: italic;">Bridging the gap between elite laboratory hardware and your personal collection.</p>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #666;">Stay tuned for exclusive drops, technical artifacts, and high-ticket hardware series.</p>
              <p style="font-size: 11px; color: #999; margin-top: 50px; text-align: center;">© ${new Date().getFullYear()} HDZ-STORE International</p>
            </div>
          `
        });
        if (emailResponse.error) {
          console.error('Resend API error:', emailResponse.error);
          emailErrorDetail = JSON.stringify(emailResponse.error);
        } else {
          emailSuccess = true;
        }
      } catch (error: any) {
        console.error('Resend catch error:', error);
        emailErrorDetail = error.message;
      }
    } else {
      console.error('Resend client not initialized.');
      emailErrorDetail = 'Configuration missing';
    }

    if (!dbSuccess && !emailSuccess) {
      console.error('CRITICAL: Both Database and Email systems failed.', { dbErrorDetail, emailErrorDetail });
      return NextResponse.json({ 
        success: false, 
        error: 'SUBSCRIPTION_ENGINE_FAILURE',
        details: {
          database: dbErrorDetail || 'Unknown Error',
          email: emailErrorDetail || 'Unknown Error'
        }
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      db: dbSuccess,
      email: emailSuccess,
      message: 'TRANSMISSION_SUCCESS',
      node: 'GLOBAL_VAULT_01'
    });
  } catch (error: any) {
    console.error('Newsletter critical error:', error);
    return NextResponse.json({ success: false, error: 'PROTOCOL_ERROR' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', endpoint: '/api/subscribe' });
}
