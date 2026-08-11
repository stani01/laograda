import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { GuestRegistrationEditor } from "@/components/admin/guest-registration-editor";
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
    locale: (row.locale as "ro" | "en") ?? "ro",
    customFields: (row.custom_fields as GuestRegistrationForm["customFields"]) ?? [],
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

  return <GuestRegistrationEditor initial={toForm(data)} />;
}
