import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env_override';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[API Config] Fetching live server-side environment variables dynamically...');
  
  // Return the live runtime environment variables to bypass client-side build caching.
  // Set headers to explicitly forbid caching in any browser/proxy layers.
  return new NextResponse(
    JSON.stringify({
      supabaseUrl: SUPABASE_URL || null,
      supabaseAnonKey: SUPABASE_ANON_KEY || null,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
      },
    }
  );
}

