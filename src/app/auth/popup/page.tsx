'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthPopupPage() {
  const [errorStr, setErrorStr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!supabase) {
      setErrorStr('Authentication service not initialized');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider') || 'google';

    const startOAuth = async () => {
      try {
        // We trigger signInWithOAuth inside the popup to guarantee it uses unpartitioned top-level storage.
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            // Callback back to the popup handler
            redirectTo: `${window.location.origin}/auth/callback`,
            flowType: 'pkce',
          },
        });
        if (error) throw error;
      } catch (err: any) {
        console.error('Error initiating OAuth inside popup:', err);
        setErrorStr(err.message || 'Failed to connect to Google. Please close the popup and try again.');
      }
    };

    startOAuth();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-6 text-center">
      {errorStr ? (
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="text-xl font-bold">!</span>
          </div>
          <p className="text-sm font-bold tracking-tight text-red-600">{errorStr}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-stone-900 mx-auto" />
          <p className="text-sm font-black italic tracking-tight text-stone-800 uppercase">Redirecting to Google...</p>
          <p className="text-xs text-stone-400">Opening a secure login session.</p>
        </div>
      )}
    </div>
  );
}
