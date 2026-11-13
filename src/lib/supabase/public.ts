import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseKey } from "@/config/env";

let publicClient: SupabaseClient | null = null;

/**
 * Stateless Supabase client for public catalog reads.
 *
 * Unlike `lib/supabase/server.ts`, this client never reads cookies or refreshes
 * sessions. That makes it safe to call from `use cache` scopes, where request
 * APIs such as `cookies()` are not available.
 *
 * The key is always the public anon/publishable key. The service role key must
 * never be used here.
 */
export function getPublicSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseKey();

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  if (!publicClient) {
    publicClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        headers: {
          "x-application-name": "ver-o-preco-public-catalog",
        },
      },
    });
  }

  return publicClient;
}
