import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/env_override';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[API Delete Account] Request received');
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[API Delete Account] Missing or malformed Authorization header');
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
          console.log(`[API Delete Account] Dynamically override backend target with decoded issuer matching token: ${issUrl}`);
          resolvedUrl = issUrl;
        }
      }
    } catch (err) {
      console.warn('[API Delete Account] Decoder bypass failed, using env variable:', err);
    }

    const anonKey = SUPABASE_ANON_KEY;
    const serviceRoleKey = SUPABASE_SERVICE_ROLE_KEY;

    if (!resolvedUrl || !anonKey) {
      console.error('[API Delete Account] Supabase configuration is missing in environments');
      return NextResponse.json({ success: false, error: 'DATABASE_CONFIG_MISSING' }, { status: 500 });
    }

    if (!serviceRoleKey) {
      console.error('[API Delete Account] SUPABASE_SERVICE_ROLE_KEY is missing. Cannot perform secure deletion.');
      return NextResponse.json({ success: false, error: 'DATABASE_ADMIN_KEY_MISSING' }, { status: 500 });
    }

    // 1. Authenticate the token with Supabase Auth to verify legitimacy
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
      console.error('[API Delete Account] User session validation failed:', authError);
      return NextResponse.json({ success: false, error: 'Invalid or expired user session' }, { status: 401 });
    }

    console.log(`[API Delete Account] Verified delete request for user: ${user.id} (${user.email})`);

    // Prevent deleting the main admin account as a critical guardrail
    if (user.email === 'musaab.asa@gmail.com') {
      console.error('[API Delete Account] Guardrail triggered: Attempt to delete key admin account blocked.');
      return NextResponse.json({ 
        success: false, 
        error: 'ADMIN_ACCOUNT_PROTECTED', 
        details: 'The master administrator account cannot be deleted.' 
      }, { status: 403 });
    }

    // 2. Initialize the admin client to perform the deletion bypass RLS & client limitations
    const adminClient = createClient(resolvedUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    console.log(`[API Delete Account] Executing admin deleteUser for user ID: ${user.id}...`);
    
    // This will delete the user in auth.users and due to ON DELETE CASCADE references,
    // matches and destroys entries in `profiles` and other referencing tables automatically.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[API Delete Account] Admin deleteUser execution failed:', deleteError);
      return NextResponse.json({ 
        success: false, 
        error: 'DELETION_FAILED', 
        details: deleteError.message 
      }, { status: 500 });
    }

    console.log(`[API Delete Account] Account deleted successfully: ${user.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'ACCOUNT_DELETED_SUCCESSFULLY'
    });
  } catch (error: any) {
    console.error('[API Delete Account] Critical unexpected exception:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'INTERNAL_SERVER_ERROR', 
      details: error?.message || 'Unknown Exception'
    }, { status: 500 });
  }
}
