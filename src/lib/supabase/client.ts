/**
 * Supabase client for use in the browser (Client Components).
 * Uses the public anon key, safe to expose to the client — access is
 * restricted server-side by Row Level Security (RLS) policies.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Lipsesc NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY din variabilele de mediu."
    );
  }

  return createBrowserClient(url, anonKey);
}
