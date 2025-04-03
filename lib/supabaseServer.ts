import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace("5432", "4000") 
  : "http://localhost:4000"; 

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and service role key must be provided in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-my-custom-header": "my-app-name" },
  },
  realtime: {
    timeout: 60000,
    params: {
      eventsPerSecond: 10,
    },
  },
});