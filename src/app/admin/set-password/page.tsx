"use client";

/**
 * Landing page for Supabase invite / password-recovery email links.
 * Add this page's full URL (https://<domain>/admin/set-password) to
 * Supabase Studio > Authentication > URL Configuration > Redirect URLs (and
 * ideally set it as the Site URL too, since this project doesn't use
 * Supabase Auth for anything else that depends on Site URL) so invite/reset
 * emails land here instead of the public homepage.
 *
 * IMPORTANT: the default Supabase email templates use `{{ .ConfirmationURL
 * }}`, which points to Supabase's own hosted `/auth/v1/verify` endpoint —
 * that endpoint verifies (and burns) the one-time token on ANY plain HTTP
 * GET, with no JavaScript required. Corporate email security scanners
 * (Outlook Safe Links, etc.) frequently "pre-click" links like this to scan
 * them, which silently invalidates the token before the real user ever
 * clicks it — that's almost certainly why links were coming back
 * "invalid/expired". Fix: edit the email templates (Authentication > Email
 * Templates > "Invite user" / "Reset Password") to link directly to this
 * page instead, passing the raw token:
 *   {{ .SiteURL }}/admin/set-password?token_hash={{ .TokenHash }}&type=invite
 * (use type=recovery in the "Reset Password" template). A GET request to
 * OUR page has no side effects — the token is only ever consumed by the
 * `verifyOtp` call below, which requires this page's JS to actually run, so
 * link-scanners that don't execute JavaScript can no longer burn it.
 */
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ready" | "invalid">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setStatus("invalid");
      return;
    }

    const tokenHash = searchParams.get("token_hash");
    const type = (searchParams.get("type") as EmailOtpType | null) ?? "invite";

    // Preferred path: an explicit token_hash from a custom email template
    // (see the file-level comment). Verifying it is what actually
    // establishes the session — safe from link-scanner pre-fetching.
    if (tokenHash) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error: verifyError }) => {
        setStatus(verifyError ? "invalid" : "ready");
      });
      return;
    }

    // Fallback for the default Supabase email template: the session is
    // established automatically from the URL hash by the client SDK.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setStatus("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });

    const timeout = setTimeout(() => {
      setStatus((current) => (current === "loading" ? "invalid" : current));
    }, 4000);

    return () => {
      subscription.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError("Nu am putut seta parola. Cere un link nou de invitație și încearcă din nou.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("A apărut o eroare de rețea.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Setează parola contului</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Se verifică linkul de invitație...
            </p>
          )}

          {status === "invalid" && (
            <p className="text-sm text-destructive">
              Linkul este invalid sau a expirat. Cere administratorului un nou link de invitație
              (sau un email de resetare a parolei) și accesează-l din nou.
            </p>
          )}

          {status === "ready" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="password">Parolă nouă</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="confirmPassword">Confirmă parola</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting} className="mt-2">
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Salvează parola
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
