import { createClient } from "@/lib/supabase/server";

function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns the signed-in Supabase user if (and only if) they're logged in
 * AND their email is on the ADMIN_EMAILS allow-list — otherwise null.
 * Use this at the top of every /admin page and /api/admin/* route handler.
 * Never throws: if Supabase isn't configured yet, this just returns null
 * (so /admin gracefully redirects to the login page instead of crashing).
 */
export async function requireAdminUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;

    const allowed = getAllowedAdminEmails();
    if (allowed.length === 0 || !allowed.includes(user.email.toLowerCase())) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
