// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// В Vite переменные окружения должны начинаться с VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key is missing in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true
    }
});