import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env_override';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[API Profile Sync] Hit');
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[API Profile Sync] Missing or malformed Authorization header');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Attempt dynamic issuer-derived URL extraction to bypass environment transitions
    let resolvedUrl = SUPABASE_URL;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
        if (payload && payload.iss) {
          const issUrl = payload.iss.replace(/\/auth\/v1\/?$/, '');
          console.log(`[API Profile Sync] Dynamically override backend target with decoded issuer matching token: ${issUrl}`);
          resolvedUrl = issUrl;
        }
      }
    } catch (err) {
      console.warn('[API Profile Sync] Decoder bypass failed, using env variable:', err);
    }

    const anonKey = SUPABASE_ANON_KEY;
    const serviceRoleKey = SUPABASE_SERVICE_ROLE_KEY;

    if (!resolvedUrl || !anonKey) {
      console.error('[API Profile Sync] Supabase configuration is missing in environments');
      return NextResponse.json({ success: false, error: 'DATABASE_CONFIG_MISSING' }, { status: 500 });
    }

    if (!serviceRoleKey) {
      console.error('[API Profile Sync] SUPABASE_SERVICE_ROLE_KEY is missing. Cannot perform secure bypass.');
      return NextResponse.json({ success: false, error: 'DATABASE_ADMIN_KEY_MISSING' }, { status: 500 });
    }

    // 1. Authenticate the Bearer token with Supabase Auth (safe cryptographic check with Supabase servers)
    const userClient = createClient(resolvedUrl, anonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      console.error('[API Profile Sync] User token authentication failed:', authError);
      return NextResponse.json({ success: false, error: 'Invalid or expired user session' }, { status: 401 });
    }

    console.log(`[API Profile Sync] Token verified successfully for user: ${user.id} (${user.email})`);

    // 2. Initialize the admin client to write to the database bypassing client RLS policies
    const adminClient = createClient(resolvedUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'Google User';

    const avatarUrl = user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      '';

    const timestamp = new Date().toISOString();

    console.log(`[API Profile Sync] Performing admin upsert on 'profiles' table for user ID: ${user.id}`);
    
    // Perform database Upsert
    const { data: profileData, error: dbError } = await adminClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: 'customer'
      }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (dbError) {
      console.error('[API Profile Sync] Database upsert operation failed:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_WRITE_ERROR', 
        details: dbError.message 
      }, { status: 500 });
    }

    console.log('[API Profile Sync] Upsert succeeded. Saved profile data:', profileData);

    return NextResponse.json({ 
      success: true, 
      profile: profileData,
      message: 'PROFILE_SYNCED_SUCCESSFULLY'
    });
  } catch (error: any) {
    console.error('[API Profile Sync] Critical unexpected exception:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'INTERNAL_SERVER_ERROR', 
      details: error?.message || 'Unknown Exception'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', endpoint: '/api/auth/profile' });
}
