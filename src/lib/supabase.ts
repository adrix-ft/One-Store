import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not set. The application will not function correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
