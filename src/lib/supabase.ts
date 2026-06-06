import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;
let _serviceChecked = false;
let _clientChecked = false;

export function getSupabase(): SupabaseClient | null {
  if (!_clientChecked) {
    _clientChecked = true;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.warn("Supabase anon key not set, DB features disabled");
      return null;
    }
    _client = createClient(url, key);
  }
  return _client;
}

export function getServiceClient(): SupabaseClient | null {
  if (!_serviceChecked) {
    _serviceChecked = true;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.warn("Supabase service role key not set, admin features disabled");
      return null;
    }
    _serviceClient = createClient(url, key);
  }
  return _serviceClient;
}
