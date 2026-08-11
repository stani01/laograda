import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GuestRegistrationForm } from "@/types/guest-registration";

export const dynamic = "force-dynamic";

function toForm(row: Record<string, unknown>): GuestRegistrationForm {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    documentType: row.document_type as GuestRegistrationForm["documentType"],
    documentSeries: (row.document_series as string | null) ?? null,
    documentNumber: row.document_number as string,
    nationality: row.nationality as string,
    birthDate: (row.birth_date as string | null) ?? null,
    address: row.address as string,
    phone: row.phone as string,
    email: (row.email as string | null) ?? null,
    checkIn: row.check_in as string,
    checkOut: row.check_out as string,
    guestsCount: row.guests_count as number,
    additionalGuests: (row.additional_guests as string | null) ?? null,
    purpose: row.purpose as string,
    gdprConsent: row.gdpr_consent as boolean,
    createdAt: row.created_at as string,
  };
}

export default async function AdminGuestRegistrationsPage() {
  let forms: GuestRegistrationForm[] = [];
  let error: unknown = null;

  try {
    const supabase = createAdminClient();
    const res = await supabase
      .from("guest_registration_forms")
      .select("*")
      .order("check_in", { ascending: false });
    error = res.error;
    forms = (res.data ?? []).map(toForm);
  } catch (err) {
    error = err;
  }

  const hasError = Boolean(error);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Fișe de cazare</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Completate de oaspeți prin linkul{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">/fisa-cazare</code>. Nu înlocuiește
        raportarea obligatorie e-cazare.mai.gov.ro pentru turiștii străini.
      </p>

      {hasError && (
        <p className="mt-4 text-sm text-destructive">
          Nu am putut încărca fișele — verifică variabilele de mediu Supabase și că tabela
          `guest_registration_forms` există (rulează supabase/schema.sql).
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {forms.length === 0 && !hasError && (
          <p className="text-sm text-muted-foreground">Nu există încă nicio fișă completată.</p>
        )}

        {forms.map((form) => (
          <Link key={form.id} href={`/admin/fise-cazare/${form.id}`}>
            <Card className="transition hover:border-primary/40">
              <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{form.fullName}</span>
                    <Badge variant="secondary">{form.guestsCount} pers.</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form.checkIn} → {form.checkOut} · {form.phone}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Completată {new Date(form.createdAt).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
