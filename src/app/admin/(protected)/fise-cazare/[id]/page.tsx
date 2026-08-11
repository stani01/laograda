import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PrintButton } from "@/components/admin/print-button";
import type { GuestRegistrationForm } from "@/types/guest-registration";

export const dynamic = "force-dynamic";

const DOCUMENT_TYPE_LABELS: Record<GuestRegistrationForm["documentType"], string> = {
  CI: "Carte de identitate",
  pasaport: "Pașaport",
};

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

export default async function AdminGuestRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("guest_registration_forms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const form = toForm(data);

  const rows: { label: string; value: string }[] = [
    { label: "Nume și prenume", value: form.fullName },
    {
      label: "Act de identitate",
      value: `${DOCUMENT_TYPE_LABELS[form.documentType]}${form.documentSeries ? ` seria ${form.documentSeries}` : ""} nr. ${form.documentNumber}`,
    },
    { label: "Naționalitate", value: form.nationality },
    { label: "Data nașterii", value: form.birthDate ?? "—" },
    { label: "Adresă domiciliu", value: form.address },
    { label: "Telefon", value: form.phone },
    { label: "Email", value: form.email ?? "—" },
    { label: "Perioada sejurului", value: `${form.checkIn} → ${form.checkOut}` },
    { label: "Număr persoane", value: String(form.guestsCount) },
    { label: "Alte persoane cazate", value: form.additionalGuests ?? "—" },
    { label: "Scopul călătoriei", value: form.purpose },
    { label: "Acord GDPR", value: form.gdprConsent ? "Da" : "Nu" },
    {
      label: "Completată la",
      value: new Date(form.createdAt).toLocaleString("ro-RO", { dateStyle: "long", timeStyle: "short" }),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="font-heading text-2xl font-semibold">Fișă de cazare</h1>
        <PrintButton />
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-6 print:border-none print:p-0">
        <h2 className="font-heading text-xl font-semibold">Fișă de anunțare a cazării</h2>
        <p className="mt-1 text-sm text-muted-foreground">La Ograda — Valea Avrigului, Județul Sibiu</p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{row.label}</dt>
              <dd className="mt-0.5 text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
