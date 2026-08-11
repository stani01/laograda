"use client";

/**
 * Landing page for Supabase invite / password-recovery email links.
 * Add this page's full URL (https://<domain>/admin/set-password) to
 * Supabase Studio > Authentication > URL Configuration > Redirect URLs (and
 * ideally set it as the Site URL too, since this project doesn't use
 * Supabase Auth for anything else that depends on Site URL) so invite/reset
 * emails land here instead of the public homepage.
 *
 * Supabase's browser client auto-detects the access token in the URL
 * (hash fragment for the implicit flow, `?code=` for PKCE) and fires
 * `onAuthStateChange` once the temporary session from the email link is
 * established — we wait for that before showing the "set a password" form.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
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

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setStatus("ready");
    });

    // In case the auth event already fired before this listener was attached.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });

    // Give the SDK a few seconds to parse the link's token before giving up.
    const timeout = setTimeout(() => {
      setStatus((current) => (current === "loading" ? "invalid" : current));
    }, 4000);

    return () => {
      subscription.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

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
