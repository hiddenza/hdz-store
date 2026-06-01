'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Mail, Lock, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase, inMemoryStorage, syncUserProfile, getActiveConfig } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxRedirectUrl, setSandboxRedirectUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && supabase) {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error') || params.get('error_description');
      const provider = params.get('provider');

      if (error) {
        toast.error(error || 'Authentication failed. Please try again.');
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } else if (provider === 'google') {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        handleOAuth('google');
      } else {
        // Normal check: if already logged in, send them straight to the dashboard
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            router.push('/dashboard');
          }
        }).catch((err) => {
          console.warn('Silent user check failed', err);
        });
      }
    }

    const handleMessageEvent = async (event: MessageEvent) => {
      // Validate origin is run.app or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        toast.error(event.data.error || 'Google sign-in could not be completed.');
        setLoading(false);
        return;
      }

      if (event.data?.type === 'OAUTH_CODE_RECEIVED') {
        const { code } = event.data;
        if (code && supabase) {
          setLoading(true);
          const toastId = toast.loading('Syncing your Google credentials securely...');
          try {
            // --- SELF-HEALING PKCE STORAGE RECOVERY ---
            console.log('[PKCE Self-Healing] Initiating PKCE verifier reconstruction before exchange...');
            let verifierValue: string | null = null;
            let sourceKey: string | null = null;

            // 1. Look in fallback memory storage
            if (inMemoryStorage) {
              for (const key of Object.keys(inMemoryStorage)) {
                if (key.includes('code-verifier')) {
                  verifierValue = inMemoryStorage[key];
                  sourceKey = key;
                  console.log(`[PKCE Self-Healing] Found verifier in inMemoryStorage: "${key}"`);
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
                    console.log(`[PKCE Self-Healing] Found verifier in window.localStorage: "${key}"`);
                    break;
                  }
                }
              } catch (e) {
                console.warn('[PKCE Self-Healing] Failed to scan localStorage:', e);
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
                    console.log(`[PKCE Self-Healing] Found verifier in document.cookie: "${key}"`);
                    break;
                  }
                }
              } catch (e) {
                console.warn('[PKCE Self-Healing] Failed to scan cookies:', e);
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

              console.log('[PKCE Self-Healing] Syncing verifier to these storage keys:', Array.from(keysToWrite));

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
              console.warn('[PKCE Self-Healing] No PKCE code verifier was found in any storage. Exchanging code may fail.');
            }
            // ------------------------------------------

            // Exchange code securely using the parent window's preserved verifier
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;

            const session = exchangeData?.session;
            if (session) {
              // Ensure profile is synced robustly (handles client-side & server fallback)
              await syncUserProfile(session);

              toast.success('Successfully signed in with Google!', { id: toastId });
              router.push('/dashboard');
              router.refresh();
            } else {
              throw new Error('No active session returned after code exchange.');
            }
          } catch (err: any) {
            console.error('Code exchange failed in parent window:', err);
            toast.error(err.message || 'Verification failed. Please try again.', { id: toastId });
            setLoading(false);
          }
        }
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const receivedSession = event.data.session;
        if (receivedSession && supabase) {
          setLoading(true);
          const toastId = toast.loading('Syncing your Google credentials securely...');
          try {
            const { error: setSessionError, data: sessionData } = await supabase.auth.setSession({
              access_token: receivedSession.access_token,
              refresh_token: receivedSession.refresh_token,
            });

            if (setSessionError) throw setSessionError;

            // Sync user profile robustly using newly restored session details
            const activeSession = sessionData?.session || receivedSession;
            await syncUserProfile(activeSession);

            toast.success('Successfully signed in with Google!', { id: toastId });
            router.push('/dashboard');
            router.refresh();
          } catch (err: any) {
            toast.error(err.message || 'Session verification failed. Please try again.', { id: toastId });
            setLoading(false);
          }
        }
      }
    };

    window.addEventListener('message', handleMessageEvent);
    return () => {
      window.removeEventListener('message', handleMessageEvent);
    };
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Authentication service is currently unavailable.');
      return;
    }
    setLoading(true);

    try {
      if (isLogin) {
        const { error, data: signInData } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;

        // Ensure user profile is synced robustly
        if (signInData?.session) {
          await syncUserProfile(signInData.session);
        }

        toast.success('Welcome back to HDZ-Store!');
      } else {
        const { error, data: signUpData } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: formData.fullName,
            }
          }
        });
        if (error) throw error;

        // Ensure user profile is synced robustly if session is returned on creation
        if (signUpData?.session) {
          await syncUserProfile(signUpData.session);
        }

        toast.success('Account created! Please check your email.');
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google') => {
    if (!supabase) {
      toast.error('Authentication service is currently unavailable.');
      return;
    }
    const supabaseUrl = getActiveConfig().url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://simzbefdsxsuvusxuoru.supabase.co';
    const redirectTo = `${window.location.origin}/auth/callback`;
    
    // Safely calculate iframe status to bypass cross-origin browser security restrictions on window.top
    let isInIframe = false;
    try {
      isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    } catch (e) {
      console.log('[Google Auth] Security boundary limits detected on window.top. Access blocked. Assuming environment is a sandboxed iframe.');
      isInIframe = true;
    }

    const staticAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;

    try {
      setLoading(true);

      if (!isInIframe) {
        console.log('[Google Auth] Standard tab: Performing seamless on-page redirect, no popups.');
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: redirectTo,
              skipBrowserRedirect: false, // Smoothly redirects the active tab itself
            },
          });
          if (error) throw error;
        } catch (innerError: any) {
          console.warn('[Google Auth] Client-side redirect fetch failed, falling back to static URI redirect:', innerError);
          window.location.href = staticAuthUrl;
        }
        return;
      }

      console.log('[Google Auth] Inside sandbox iframe. Transitioning to autologin full-page tab URL...');
      setSandboxRedirectUrl(`${window.location.origin}/auth?provider=${provider}`);
      setShowSandboxModal(true);
      setLoading(false);
    } catch (error: any) {
      console.error('[Google Auth] Critical error inside handleOAuth:', error);
      toast.error(error.message || 'OAuth signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl w-full bg-white rounded-[40px] overflow-hidden border border-stone-100 shadow-2xl shadow-black/5"
      >
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:block relative p-12 bg-black text-white overflow-hidden">
           <div className="absolute inset-0 z-0">
               <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80" className="w-full h-full object-cover opacity-40" alt="Auth Background" />
               <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
           </div>
           
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black italic tracking-tighter">HDZ-STORE.</h2>
                 <p className="text-white/60 tracking-widest text-[10px] font-bold uppercase">Join the global movement.</p>
              </div>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-5xl font-black leading-none tracking-tighter italic">Experience <br /> Modern <br /> Commerce.</h3>
                    <p className="text-white/60 text-sm max-w-xs leading-relaxed">Join thousands of premium shoppers worldwide and get exclusive access to international deals.</p>
                 </div>
                 
                 <div className="flex gap-12 pt-8">
                    <div className="space-y-1">
                       <p className="text-2xl font-black italic">500k+</p>
                       <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Active Users</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-2xl font-black italic">120</p>
                       <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Countries</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 lg:p-16 flex flex-col justify-center space-y-10">
           <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl font-black italic tracking-tighter">{isLogin ? 'Welcome Back.' : 'Create Account.'}</h1>
              <p className="text-stone-400 text-sm">Enter your credentials to access your global vault.</p>
           </div>

           <div>
              <Button 
                variant="outline" 
                type="button"
                className="w-full h-14 rounded-full border-stone-100 hover:bg-stone-50 font-black tracking-tight flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm shadow-black/5"
                onClick={() => handleOAuth('google')}
                disabled={loading}
              >
                 {loading ? (
                   <Loader2 className="h-5 w-5 animate-spin" />
                 ) : (
                   <Globe className="h-5 w-5 text-[#4285F4]" />
                 )}
                 {isLogin ? 'Sign In' : 'Sign Up'} with Google
              </Button>
           </div>

           <div className="relative flex items-center">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-stone-300">Or with Email</span>
           </div>

           <form onSubmit={handleAuth} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    key="full-name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Full Name</Label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                       <Input 
                        placeholder="Jane Doe" 
                        className="h-14 pl-12 rounded-full bg-stone-50 border-stone-100 focus:bg-white"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Email Address</Label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                   <Input 
                    type="email" 
                    placeholder="name@email.com" 
                    className="h-14 pl-12 rounded-full bg-stone-50 border-stone-100 focus:bg-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Password</Label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                   <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-14 pl-12 rounded-full bg-stone-50 border-stone-100 focus:bg-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-16 bg-black text-white hover:bg-black/90 rounded-full font-black text-lg tracking-tight active:scale-95 transition-all shadow-xl shadow-black/10"
                disabled={loading}
              >
                 {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
           </form>

           <div className="text-center pt-4">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)} 
                className="text-xs font-bold text-stone-400 hover:text-black transition-colors underline underline-offset-4"
              >
                 {isLogin ? "Don't have an account? Start here." : "Already a member? Sign in."}
               </button>

            </div>
         </div>
       </motion.div>

       {/* Sandbox Redirect Modal */}
       <AnimatePresence>
         {showSandboxModal && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
           >
             <motion.div 
               initial={{ scale: 0.95, y: 15, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.95, y: 15, opacity: 0 }}
               transition={{ type: 'spring', duration: 0.4 }}
               className="bg-white rounded-[40px] max-w-md w-full border border-stone-100 p-10 space-y-8 shadow-2xl"
             >
               <div className="space-y-4 text-left">
                 <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                   <Lock className="h-5 w-5 text-stone-800" />
                 </div>
                 <h3 className="text-2xl font-black italic tracking-tighter text-stone-900 font-sans">Secure Tab Handshake.</h3>
                 <p className="text-xs text-stone-400 font-bold leading-relaxed">
                   To protect your credentials, Google security frameworks forbid logging in inside nested iframe previews.
                 </p>
                 <p className="text-xs text-stone-500 font-bold leading-relaxed">
                   We will open HDZ-Store securely inside a dedicated full browser tab where you can authenticatively sign in directly on the same page.
                 </p>
               </div>

               <div className="flex flex-col sm:flex-row gap-3 pt-2">
                 <Button 
                   onClick={() => {
                     console.log('[Google Auth] Standard navigation to secure login initiated:', sandboxRedirectUrl);
                     let win: Window | null = null;
                     try {
                       win = window.open(sandboxRedirectUrl, '_blank');
                     } catch (err) {
                       console.error('[Google Auth] Failed opening window.open popup due to browser block:', err);
                     }

                     if (win) {
                       setShowSandboxModal(false);
                       toast.success('Secure authentication tab opened. Please complete your sign-in there.');
                     } else {
                       // Popup was blocked. Let's redirect the top parent window location directly (write-only property on cross-origin is allowed)
                       try {
                         console.log('[Google Auth] Attempting direct top-level parent frame redirection...');
                         if (window.top) {
                           window.top.location.href = sandboxRedirectUrl;
                           setShowSandboxModal(false);
                         } else {
                           throw new Error('window.top is null');
                         }
                       } catch (topErr) {
                         console.error('[Google Auth] Top frame navigation failed:', topErr);
                         toast.error('The browser blocked opening a new tab. Please click again, allow popups for this site, or open this application in a new tab to complete your sign-in.');
                       }
                     }
                   }}
                   className="flex-grow h-14 bg-black text-white hover:bg-stone-800 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all text-center"
                 >
                   Open Secure Tab
                 </Button>
                 <Button 
                   variant="outline"
                   onClick={() => setShowSandboxModal(false)}
                   className="h-14 border-stone-100 text-stone-500 hover:bg-stone-50 rounded-full font-black text-xs uppercase tracking-widest"
                 >
                   Cancel
                 </Button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
}
