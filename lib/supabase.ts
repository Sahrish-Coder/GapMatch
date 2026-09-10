import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('/rest/v1')) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL is missing or invalid. ' +
    'It must be the base project URL only, e.g. https://<project-ref>.supabase.co'
  );
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
