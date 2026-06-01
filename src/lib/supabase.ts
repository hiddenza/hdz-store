import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env_override';
import { createClient } from '@supabase/supabase-js';

const inMemoryStorage: Record<string, string> = {};

// Module-level cache to absolutely guarantee that any PKCE code-verifier generated
// on this page's lifecycle is persisted and retrievable, even if standard localStorage is sandboxed/blocked
// or document.cookie is strictly locked in the AI Studio iframe.
let preservedCodeVerifier: { key: string; value: string } | null = null;

const customStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    
    console.log(`[Supabase Storage] getItem requested for key: "${key}"`);
    
    // --- MEMORY-LEVEL PKCE RECOVERY ---
    // If we're looking for a code-verifier, prioritize our module memory cache
    if (key.includes('code-verifier') && preservedCodeVerifier) {
      console.log(`[Supabase Storage] Found code-verifier in module memory: "${preservedCodeVerifier.key}"`);
      return preservedCodeVerifier.value;
    }
    
    // 1. Prioritize standard localStorage
    try {
      const value = window.localStorage.getItem(key);
      if (value) {
        console.log(`[Supabase Storage] Found "${key}" in window.localStorage:`, value.substring(0, 15) + '...');
        return value;
      }
    } catch (e) {
      console.warn(`[Supabase Storage] window.localStorage.getItem failed/blocked for "${key}":`, e);
    }

    // 2. Fallback to page-level memory storage
    if (key in inMemoryStorage) {
      const value = inMemoryStorage[key];
      console.log(`[Supabase Storage] Found "${key}" in fallback memory storage:`, value.substring(0, 15) + '...');
      return value;
    } else {
      console.log(`[Supabase Storage] "${key}" not in fallback memory storage`);
    }

    // 3. Fallback to standard cookie reading (available in top-level popups)
    try {
      const cookieMatch = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
      if (cookieMatch) {
        const value = decodeURIComponent(cookieMatch[2]);
        console.log(`[Supabase Storage] Found "${key}" in document.cookie fallback:`, value.substring(0, 15) + '...');
        return value;
      }
    } catch (e) {
      console.warn(`[Supabase Storage] Cookie reading failed for "${key}":`, e);
    }

    // Secondary fallback search for any cookie or item containing code-verifier
    if (key.includes('code-verifier')) {
      try {
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [k, v] = cookie.trim().split('=');
            if (k && k.includes('code-verifier') && v) {
              const value = decodeURIComponent(v);
              console.log(`[Supabase Storage] Secondary scan recovered code-verifier from cookie "${k}"`);
              return value;
            }
          }
        }
      } catch (e) {}
    }

    console.log(`[Supabase Storage] Resolved null for key: "${key}"`);
    return null;
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    console.log(`[Supabase Storage] setItem called for key: "${key}" with value length ${value.length}`);

    // Cache code-verifier in our guaranteed memory reference
    if (key.includes('code-verifier')) {
      preservedCodeVerifier = { key, value };
      console.log(`[Supabase Storage] Saved preserved code-verifier: "${key}"`);
    }

    // 1. Try setting in localStorage
    try {
      window.localStorage.setItem(key, value);
      console.log(`[Supabase Storage] Successfully wrote "${key}" to window.localStorage`);
    } catch (e) {
      console.warn(`[Supabase Storage] window.localStorage.setItem failed/blocked for "${key}":`, e);
    }

    // 2. Synchronize to memory map
    inMemoryStorage[key] = value;
    console.log(`[Supabase Storage] Synced "${key}" to fallback memory storage`);

    // 3. Mirror to standard document cookie (unpartitioned backup in popups)
    try {
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=None; Secure; Max-Age=31536000`;
      console.log(`[Supabase Storage] Wrote "${key}" to document.cookie (SameSite=None; Secure)`);
    } catch (e) {
      console.warn(`[Supabase Storage] Cookie writing failed for "${key}":`, e);
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;

    console.log(`[Supabase Storage] removeItem called for key: "${key}"`);

    if (key.includes('code-verifier')) {
      preservedCodeVerifier = null;
      console.log(`[Supabase Storage] Cleared preserved memory code-verifier`);
    }

    // 1. Remove from localStorage
    try {
      window.localStorage.removeItem(key);
      console.log(`[Supabase Storage] Removed "${key}" from window.localStorage`);
    } catch (e) {}

    // 2. Clear memory map
    delete inMemoryStorage[key];
    console.log(`[Supabase Storage] Deleted "${key}" from fallback memory storage`);

    // 3. Clear cookie
    try {
      document.cookie = `${key}=; path=/; max-age=0; SameSite=None; Secure`;
      console.log(`[Supabase Storage] Cleared cookie for "${key}"`);
    } catch (e) {}
  }
};

let supabaseInstance: any = null;
let activeSupabaseUrl: string | null = null;
let activeSupabaseAnonKey: string | null = null;

// Helper to extract issuer URL from a JWT token
export const getIssuerFromToken = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    let decodedStr = '';
    if (typeof window === 'undefined') {
      decodedStr = Buffer.from(base64, 'base64').toString('utf8');
    } else {
      decodedStr = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
    
    const payload = JSON.parse(decodedStr);
    if (payload && payload.iss) {
      const cleanUrl = payload.iss.replace(/\/auth\/v1\/?$/, '');
      return cleanUrl;
    }
  } catch (err) {
    console.warn('[Supabase Dynamic] Failed to parse JWT issuer:', err);
  }
  return null;
};

export const getRefFromAnonKey = (key: string): string | null => {
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let decodedStr = '';
    if (typeof window === 'undefined') {
      decodedStr = Buffer.from(base64, 'base64').toString('utf8');
    } else {
      decodedStr = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
    const payload = JSON.parse(decodedStr);
    return payload?.ref || null;
  } catch (err) {
    return null;
  }
};

export const getRefFromUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/https:\/\/([^.]+)\.supabase\.(co|net|space|in)/);
  return match ? match[1] : null;
};

export const updateSupabaseConfig = (newUrl: string, newAnonKey: string) => {
  if (typeof window === 'undefined' || !newUrl || !newAnonKey) return;
  const cleanUrl = newUrl.trim().replace(/\/auth\/v1\/?$/, '');
  
  const currentUrl = activeSupabaseUrl || SUPABASE_URL;
  const currentAnonKey = activeSupabaseAnonKey || SUPABASE_ANON_KEY;
  
  if (
    currentUrl.replace(/\/$/, '') !== cleanUrl.replace(/\/$/, '') || 
    currentAnonKey !== newAnonKey
  ) {
    console.log(`[Supabase Dynamic] Overriding active Supabase config. URL: "${cleanUrl}", Anon Key length: ${newAnonKey.length}`);
    activeSupabaseUrl = cleanUrl;
    activeSupabaseAnonKey = newAnonKey;
    
    supabaseInstance = createClient(cleanUrl, newAnonKey, {
      auth: {
        persistSession: true,
        storage: customStorage,
        storageKey: 'hdz-store-auth',
        detectSessionInUrl: false,
        flowType: 'implicit',
      }
    });
  }
};

export const updateSupabaseUrl = (newUrl: string) => {
  if (typeof window === 'undefined' || !newUrl) return;
  const cleanUrl = newUrl.trim().replace(/\/auth\/v1\/?$/, '');
  
  const currentUrl = activeSupabaseUrl || SUPABASE_URL;
  if (currentUrl.replace(/\/$/, '') !== cleanUrl.replace(/\/$/, '')) {
    console.log(`[Supabase Dynamic] Overriding active Supabase URL from "${currentUrl}" to "${cleanUrl}"`);
    activeSupabaseUrl = cleanUrl;
    
    const keyToUse = activeSupabaseAnonKey || SUPABASE_ANON_KEY;
    
    // Check if anon key ref matches token issuer ref
    const tokenRef = getRefFromUrl(cleanUrl);
    const configuredRef = getRefFromAnonKey(keyToUse);
    if (tokenRef && configuredRef && tokenRef !== configuredRef) {
      console.warn(`[Supabase Dynamic] WARNING: Project reference mismatch! Token belongs to "${tokenRef}", but active Anon Key belongs to "${configuredRef}". API requests will fail with "Invalid API key".`);
    }

    supabaseInstance = createClient(cleanUrl, keyToUse, {
      auth: {
        persistSession: true,
        storage: customStorage,
        storageKey: 'hdz-store-auth',
        detectSessionInUrl: false,
        flowType: 'implicit',
      }
    });
  }
};

export const getSupabase = () => {
  if (typeof window === 'undefined') return null as any;
  if (!supabaseInstance) {
    const defaultUrl = activeSupabaseUrl || SUPABASE_URL;
    const supabaseAnonKey = activeSupabaseAnonKey || SUPABASE_ANON_KEY;
    if (!defaultUrl || !supabaseAnonKey) {
      console.warn('Supabase URL or Anon Key is missing');
      return null as any;
    }
    activeSupabaseUrl = defaultUrl;
    activeSupabaseAnonKey = supabaseAnonKey;
    supabaseInstance = createClient(defaultUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: customStorage,
        storageKey: 'hdz-store-auth',
        detectSessionInUrl: false,
        flowType: 'implicit',
      }
    });
  }
  return supabaseInstance;
};

// Use Proxy to dynamically delegate to whichever instance is currently active
export const supabase = typeof window !== 'undefined' ? new Proxy({}, {
  get(target, prop) {
    const instance = getSupabase();
    if (!instance) return undefined;
    const value = Reflect.get(instance, prop);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
}) : null as any;

// Helper for safe auth access
export const getAuth = () => getSupabase()?.auth;

export const getSession = async () => {
  const auth = getAuth();
  if (!auth) return null;
  const { data: { session } } = await auth.getSession();
  return session;
};

export const syncUserProfile = async (session: any) => {
  if (!session?.user) return null;
  const user = session.user;
  const accessToken = session.access_token;

  console.log(`[syncUserProfile] Starting sync for user: ${user.id}`);

  // 1. Try Client-side Upsert (Bypasses error if it works, or catches and tries server fallback)
  try {
    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'Google User';
    
    const avatarUrl = user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      '';

    const { data, error } = await supabase
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

    if (!error && data) {
      console.log('[syncUserProfile] Client-side profile upsert succeeded:', data);
      return data;
    } else {
      console.warn('[syncUserProfile] Client-side query returned error/no-data. Falling back. Error:', error);
    }
  } catch (err) {
    console.warn('[syncUserProfile] Client-side upsert failed (e.g. RLS policies). Trying server endpoint. Error:', err);
  }

  // 2. Server-side Secure Upsert Proxy (Bypasses RLS limits using service role key)
  if (accessToken) {
    try {
      console.log('[syncUserProfile] Sending payload to /api/auth/profile secure backend...');
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const resJSON = await response.json();
        if (resJSON.success && resJSON.profile) {
          console.log('[syncUserProfile] Server-side profile upsert succeeded via proxy:', resJSON.profile);
          return resJSON.profile;
        } else {
          console.error('[syncUserProfile] Server returned success:false:', resJSON.error);
        }
      } else {
        console.error('[syncUserProfile] Server returned non-ok status code:', response.status);
      }
    } catch (err) {
      console.error('[syncUserProfile] Server upsert proxy request crashed:', err);
    }
  }

  return null;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getActiveConfig = () => {
  return {
    url: activeSupabaseUrl || SUPABASE_URL,
    anonKey: activeSupabaseAnonKey || SUPABASE_ANON_KEY
  };
};

export { inMemoryStorage };

// --- DYNAMIC RUNTIME CONFIG LOADER ---
if (typeof window !== 'undefined') {
  console.log('[Supabase Dynamic] Initiating dynamic runtime config loading...');
  fetch('/api/config')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then(config => {
      if (config.supabaseUrl && config.supabaseAnonKey) {
        console.log(`[Supabase Dynamic] Live runtime config fetched successfully. Project: ${getRefFromUrl(config.supabaseUrl)}`);
        updateSupabaseConfig(config.supabaseUrl, config.supabaseAnonKey);
      }
    })
    .catch(err => {
      console.warn('[Supabase Dynamic] Failed to dynamically load runtime config:', err);
    });
}

