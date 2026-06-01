'use client';
 
import { useEffect, useState, useRef } from 'react';
import { supabase, syncUserProfile, updateSupabaseUrl, getIssuerFromToken, getRefFromAnonKey, getRefFromUrl, getActiveConfig } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const router = useRouter();
  const processedRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setErrorStr('Authentication service not initialized');
      return;
    }

    if (processedRef.current) return;

    const processAuth = async () => {
      try {
        // Parse search params (query string)
        const queryParams = new URLSearchParams(window.location.search);
        
        // Parse hash params (fragment tracker)
        let hashParams = new URLSearchParams();
        if (typeof window !== 'undefined' && window.location.hash) {
          hashParams = new URLSearchParams(window.location.hash.substring(1));
        }

        const error = queryParams.get('error') || queryParams.get('error_description') || 
                      hashParams.get('error') || hashParams.get('error_description');

        const code = queryParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // Check if there is an active access token and update the correct Supabase URL from token issuer
        if (accessToken) {
          const issuer = getIssuerFromToken(accessToken);
          if (issuer) {
            console.log(`[Google Auth Callback] Auto-detecting and setting matching Supabase URL from token issuer: ${issuer}`);
            updateSupabaseUrl(issuer);
          }
        }

        // If we have an opener, notify them of our progress, but do NOT close the tab or block execution.
        // We will continue the login flow in this tab so the user is guaranteed to log in successfully and land on the dashboard.
        if (typeof window !== 'undefined' && window.opener) {
          try {
            if (error) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_ERROR',
                error: error.replace(/\+/g, ' ')
              }, '*');
            } else if (code) {
              window.opener.postMessage({
                type: 'OAUTH_CODE_RECEIVED',
                code: code
              }, '*');
            } else if (accessToken && refreshToken) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                session: {
                  access_token: accessToken,
                  refresh_token: refreshToken
                }
              }, '*');
            }
          } catch (e) {
            console.warn('[Google Auth Callback] PostMessage to opener was blocked or failed:', e);
          }
        }

        if (error) {
          throw new Error(error.replace(/\+/g, ' '));
        }

        let session = null;
        let toastId = null;

        if (accessToken && refreshToken) {
          processedRef.current = true;
          toastId = toast.loading('Syncing your Google session securely...', { duration: 10000 });
          
          const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (setSessionError) throw setSessionError;
          session = setSessionData?.session;

          if (!session) {
            session = (await supabase.auth.getSession()).data.session;
          }
        } else if (code) {
          processedRef.current = true;
          toastId = toast.loading('Establishing secure session with Google...', { duration: 10000 });
          try {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            session = exchangeData?.session;
          } catch (exchangeErr: any) {
            console.warn('Auth callback code exchange warning, trying getSession fallback:', exchangeErr);
            const { data: { session: fallbackSession } } = await supabase.auth.getSession();
            if (fallbackSession) {
              session = fallbackSession;
            } else {
              throw exchangeErr;
            }
          }
        }

        if (!session) {
          const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          session = existingSession;
        }

        if (session) {
          const currentUser = session.user;

          // Ensure we check/create user profile in database robustly
          await syncUserProfile(session);

          // Strip query/hash parameters to clean up address bar
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          // If we are running in a popup/new tab, post the session back to the parent page so it can also sync if possible
          if (typeof window !== 'undefined' && window.opener) {
            try {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                session: {
                  access_token: session.access_token,
                  refresh_token: session.refresh_token
                }
              }, '*');
            } catch (err) {
              console.error('Failed to postMessage to parent window:', err);
            }
          }

          if (toastId) {
            toast.success('Successfully signed in with Google!', { id: toastId });
          } else {
            toast.success('Successfully signed in with Google!');
          }

          router.push('/dashboard');
          router.refresh();
          return;
        }

        // Set up a listener in case implicit flows or asynchronous session hydration are underway
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession) {
            subscription.unsubscribe();
            router.push('/dashboard');
            router.refresh();
          }
        });

        // Safety timeout
        setTimeout(async () => {
          subscription.unsubscribe();
          const { data: { session: finalSession } } = await supabase.auth.getSession();
          if (finalSession) {
            router.push('/dashboard');
            router.refresh();
          } else {
            setErrorStr('Could not establish an active session. Please sign in again.');
            setTimeout(() => {
              router.push('/auth');
            }, 2500);
          }
        }, 3000);
      } catch (err: any) {
        console.error('Error in authentication callback:', err);
        
        // Check for mismatch diagnosis
        let mismatchMessage = null;
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const issuer = accessToken ? getIssuerFromToken(accessToken) : null;
          const { anonKey: currentAnonKey } = getActiveConfig();
          
          if (issuer) {
            const tokenRef = getRefFromUrl(issuer);
            const configuredRef = getRefFromAnonKey(currentAnonKey);
            if (tokenRef && configuredRef && tokenRef !== configuredRef) {
              mismatchMessage = `Configuration Mismatch Detected! Dynamic token is for database "${tokenRef}", but your Dev Workspace is running on key "${configuredRef}". Please update NEXT_PUBLIC_SUPABASE_URL and key settings in AI Studio to match!`;
            }
          }
        } catch (diagErr) {
          console.warn('Diagnostics failed:', diagErr);
        }

        if (mismatchMessage) {
          setErrorStr(mismatchMessage);
          // Don't auto-redirect immediately so the user can actually read the detailed message
          setTimeout(() => {
            router.push('/auth');
          }, 30000);
        } else {
          setErrorStr(err?.message || 'Authentication error');
          setTimeout(() => {
            router.push('/auth');
          }, 2500);
        }
      }
    };

    processAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-6 text-center">
      {errorStr ? (
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="text-xl font-bold">!</span>
          </div>
          <p className="text-sm font-bold tracking-tight text-red-600">{errorStr}</p>
          <p className="text-xs text-stone-400">Backing to login shortly...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-stone-900 mx-auto" />
          <p className="text-sm font-black italic tracking-tight text-stone-800 uppercase">Verifying Google Credentials...</p>
          <p className="text-xs text-stone-400">Hang tight as we securely link your profile.</p>
        </div>
      )}
    </div>
  );
}
