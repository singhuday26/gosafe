import { createClient } from "@supabase/supabase-js";

// Mock Supabase configuration for development
const supabaseUrl = "https://mock-project.supabase.co";
const supabaseAnonKey = "mock-anon-key-for-development";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
