/**
 * Privileged Supabase client using the service role key. Only ever import
 * this from server-only code (Route Handlers) — it bypasses Row Level
 * Security, which is what lets unauthenticated visitors' booking requests
 * be inserted safely after we've validated them ourselves.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Lipsesc NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY din variabilele de mediu."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
