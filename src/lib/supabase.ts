import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (typeof window === 'undefined') return null as any;
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase URL or Anon Key is missing');
      return null as any;
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Only initialize if we're in the browser or have keys
export const supabase = typeof window !== 'undefined' ? getSupabase() : null as any;

// Helper for safe auth access
export const getAuth = () => getSupabase()?.auth;

export const getSession = async () => {
  const auth = getAuth();
  if (!auth) return null;
  const { data: { session } } = await auth.getSession();
  return session;
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
