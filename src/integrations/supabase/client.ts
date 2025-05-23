
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pszfkiyjljojendydafj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzemZraXlqbGpvamVuZHlkYWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjM1NzEsImV4cCI6MjA2MTQ5OTU3MX0.05ha_5Hxws_Piu37EEKKeHhSqgEhhley4SAnpfjZUfI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable-app',
    },
  },
  auth: {
    persistSession: true,
  }
});
