import { createClient } from '@supabase/supabase-js';

// Temporary stub to bypass Supabase library build issues
// This allows the build to complete while we use raw fetch for API calls

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing');
} else {
    console.log('🔌 Supabase Configured URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

export const getSupabase = () => supabase;
