'use client';

import { useEffect, useRef } from 'react';
import { supabase, inMemoryStorage, syncUserProfile, updateSupabaseUrl, getIssuerFromToken, getRefFromAnonKey, getRefFromUrl, getActiveConfig } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Module-level lock to completely prevent duplicate PKCE exchanging in React Strict Mode during development
const processedCodes = new Set<string>();

export default function GlobalAuthDetector() {
  const router = useRouter();
  const effectRan = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !supabase) return;

    // Skip parsing if we are on the dedicated auth/callback page to avoid duplicate processing/race conditions
    if (window.location.pathname.startsWith('/auth/callback')) {
      return;
    }

    // Parse Hash Parameters for direct OAuth redirect recovery
    let hashParams = new URLSearchParams();
    if (typeof window !== 'undefined' && window.location.hash) {
      hashParams = new URLSearchParams(window.location.hash.substring(1));
    }
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      const processHashExchange = async () => {
        const toastId = toast.loading('Syncing your Google credentials securely...');
        try {
          console.log('[Google Auth Hash] Syncing session from hash parameters...');
          
          const issuer = getIssuerFromToken(accessToken);
          if (issuer) {
            console.log(`[Google Auth Hash] Auto-detected matching Supabase URL from token issuer: ${issuer}`);
            updateSupabaseUrl(issuer);
          }

          const { data, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionErr) throw sessionErr;

          if (data?.session) {
            // Immediately check and upsert user profile row in database robustly
            await syncUserProfile(data.session);

            toast.success('Successfully signed in with Google!', { id: toastId });

            // Strip the hash from the URL so page refreshing is clean
            const newUrl = window.location.pathname + window.location.search;
            window.history.replaceState({}, document.title, newUrl);

            // Notify opener if present
            if (typeof window !== 'undefined' && window.opener) {
              try {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  session: {
                    access_token: accessToken,
                    refresh_token: refreshToken
                  }
                }, '*');
              } catch (err) {
                console.error('Failed to postMessage to parent window:', err);
              }
            }

            // Access dashboard and refresh authentication state
            router.push('/dashboard');
            router.refresh();
          } else {
            toast.dismiss(toastId);
          }
        } catch (err: any) {
          console.error('[Google Auth Hash] Error during automatic setSession exchange:', err);
          
          const issuer = getIssuerFromToken(accessToken);
          const { anonKey: currentAnonKey } = getActiveConfig();
          const tokenRef = getRefFromUrl(issuer || '');
          const configuredRef = getRefFromAnonKey(currentAnonKey);
          
          if (tokenRef && configuredRef && tokenRef !== configuredRef) {
            toast.error(
              `Configuration Mismatch: Google OAuth was initiated with database "${tokenRef}", but the app is configured with "${configuredRef}" keys. Please open the AI Studio Settings panel and update your Supabase URL, Anon Key, and Service Role Key to match!`,
              { id: toastId, duration: 25000 }
            );
          } else {
            toast.error(err.message || 'Verification failed. Please sign in again.', { id: toastId });
          }
          
          const newUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, document.title, newUrl);
        }
      };

      processHashExchange();
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error') || params.get('error_description');

    // Handle authentication error redirected from Google
    if (error) {
      toast.error(error.replace(/\+/g, ' ') || 'Google sign-in could not be completed.');
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      return;
    }

    if (code) {
      // If we are running in a popup/new tab, post the code back to the parent so they can also track it if possible
      if (typeof window !== 'undefined' && window.opener) {
        try {
          window.opener.postMessage({
            type: 'OAUTH_CODE_RECEIVED',
            code: code
          }, '*');
        } catch (err) {
          console.error('Failed to postMessage to parent window:', err);
        }
      }

      if (processedCodes.has(code)) {
        // Already exchanged or in progress, do nothing
        return;
      }
      processedCodes.add(code);

      const processCodeExchange = async () => {
        const toastId = toast.loading('Syncing your Google credentials securely...');
        try {
          // --- SELF-HEALING PKCE STORAGE RECOVERY ---
          console.log('[PKCE Self-Healing GLOBAL] Initiating PKCE verifier reconstruction before exchange...');
          let verifierValue: string | null = null;
          let sourceKey: string | null = null;

          // 1. Look in fallback memory storage
          if (inMemoryStorage) {
            for (const key of Object.keys(inMemoryStorage)) {
              if (key.includes('code-verifier')) {
                verifierValue = inMemoryStorage[key];
                sourceKey = key;
                console.log(`[PKCE Self-Healing GLOBAL] Found verifier in inMemoryStorage: "${key}"`);
                break;
              }
            }
          }

          // 2. Look in localStorage
          if (!verifierValue && typeof window !== 'undefined' && window.localStorage) {
            try {
              for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.includes('code-verifier')) {
                  verifierValue = window.localStorage.getItem(key);
                  sourceKey = key;
                  console.log(`[PKCE Self-Healing GLOBAL] Found verifier in window.localStorage: "${key}"`);
                  break;
                }
              }
            } catch (e) {
              console.warn('[PKCE Self-Healing GLOBAL] Failed to scan localStorage:', e);
            }
          }

          // 3. Look in document.cookie
          if (!verifierValue && typeof document !== 'undefined') {
            try {
              const cookies = document.cookie.split(';');
              for (const cookie of cookies) {
                const [key, val] = cookie.trim().split('=');
                if (key && key.includes('code-verifier') && val) {
                  verifierValue = decodeURIComponent(val);
                  sourceKey = key;
                  console.log(`[PKCE Self-Healing GLOBAL] Found verifier in document.cookie: "${key}"`);
                  break;
                }
              }
            } catch (e) {
              console.warn('[PKCE Self-Healing GLOBAL] Failed to scan cookies:', e);
            }
          }

          // If we found a verifier, write it to ALL possible keys and storages to make it 100% accessible to Supabase clients.
          if (verifierValue) {
            const supabaseUrl = getActiveConfig().url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.(co|net|space)/);
            const projectSlug = match ? match[1] : '';
            
            // Keys list to write
            const keysToWrite = new Set<string>();
            if (sourceKey) keysToWrite.add(sourceKey);
            if (projectSlug) {
              keysToWrite.add(`sb-${projectSlug}-auth-token-code-verifier`);
            }
            // Add stable key names and generic fallbacks
            keysToWrite.add('supabase.auth.token-code-verifier');
            keysToWrite.add('hdz-store-auth-code-verifier');

            console.log('[PKCE Self-Healing GLOBAL] Syncing verifier to these storage keys:', Array.from(keysToWrite));

            for (const k of keysToWrite) {
              // Write to fallback memory
              if (inMemoryStorage) {
                inMemoryStorage[k] = verifierValue;
              }

              // Write to localStorage
              if (typeof window !== 'undefined' && window.localStorage) {
                try {
                  window.localStorage.setItem(k, verifierValue);
                } catch (e) {}
              }

              // Write to cookies
              if (typeof document !== 'undefined') {
                try {
                  document.cookie = `${k}=${encodeURIComponent(verifierValue)}; path=/; SameSite=None; Secure; Max-Age=3600`;
                } catch (e) {}
              }
            }
          } else {
            console.warn('[PKCE Self-Healing GLOBAL] No PKCE code verifier was found in any storage source.');
          }
          // ------------------------------------------

          // Exchange code for the active session
          let session = null;
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            session = data?.session;
          } catch (exchangeErr: any) {
            console.warn('Global auth detector exchange code warning, trying fallback getSession:', exchangeErr);
            const { data: { session: fallbackSession } } = await supabase.auth.getSession();
            if (fallbackSession) {
              session = fallbackSession;
            } else {
              throw exchangeErr;
            }
          }

          if (session) {
            const currentUser = session.user;

            // Immediately check and upsert user profile row in database robustly
            await syncUserProfile(session);

            toast.success('Successfully signed in with Google!', { id: toastId });

            // Strip '?code=...' from the URL so page refreshing is clean
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);

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

            // Access dashboard and refresh authentication state
            router.push('/dashboard');
            router.refresh();
          } else {
            toast.dismiss(toastId);
          }
        } catch (err: any) {
          console.error('Error during automatic OAuth session exchange:', err);
          toast.error(err.message || 'Verification failed. Please sign in again.', { id: toastId });
          
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      };

      processCodeExchange();
    }
  }, [router]);

  return null;
}
