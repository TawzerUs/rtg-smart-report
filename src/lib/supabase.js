import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disabled to prevent interference
        storage: window.localStorage,
        // storageKey: 'supabase.auth.token' // Removed to avoid conflict
    }
});

// Helper to get the Supabase client
export const getSupabase = () => supabase;
