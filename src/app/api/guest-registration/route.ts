import { NextResponse, type NextRequest } from "next/server";
import { guestRegistrationSchema, type StandardFieldConfig } from "@/types/guest-registration";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGuestRegistrationFieldDefs } from "@/lib/guest-registration-fields";
import { getGuestRegistrationStandardFields } from "@/lib/guest-registration-standard-fields";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!checkRateLimit(request, "guest-registration", { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Prea multe cereri. Te rugăm încearcă din nou peste un minut." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = guestRegistrationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot: bots fill every field, real visitors never see/fill `company`.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const {
    fullName,
    documentType,
    documentSeries,
    documentNumber,
    nationality,
    birthDate,
    address,
    phone,
    email,
    checkIn,
    checkOut,
    guestsCount,
    additionalGuests,
    purpose,
    gdprConsent,
    locale,
    customFields,
  } = parsed.data;

  // Re-validate required fields server-side too — the client already checks
  // this, but never trust the client alone. Standard field required-ness and
  // labels come from admin config (/admin/fise-cazare/campuri).
  const standardFields = await getGuestRegistrationStandardFields();
  const standardValues: Record<StandardFieldConfig["key"], string | undefined> = {
    fullName,
    documentSeries,
    documentNumber,
    nationality,
    birthDate,
    address,
    phone,
    email,
    additionalGuests,
    purpose,
  };

  for (const field of standardFields) {
    if (field.required && !(standardValues[field.key] ?? "").trim()) {
      return NextResponse.json(
        { error: `Câmpul „${field.label}” este obligatoriu` },
        { status: 400 }
      );
    }
  }

  const fieldDefs = await getGuestRegistrationFieldDefs();
  const providedByKey = new Map((customFields ?? []).map((f) => [f.key, f]));

  for (const def of fieldDefs) {
    if (def.required && !(providedByKey.get(def.fieldKey)?.value ?? "").trim()) {
      return NextResponse.json(
        { error: `Câmpul „${def.label}” este obligatoriu` },
        { status: 400 }
      );
    }
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("guest_registration_forms").insert({
      full_name: fullName,
      document_type: documentType,
      document_series: documentSeries || null,
      document_number: documentNumber,
      nationality,
      birth_date: birthDate || null,
      address,
      phone,
      email: email || null,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guestsCount,
      additional_guests: additionalGuests || null,
      purpose,
      gdpr_consent: gdprConsent,
      locale,
      custom_fields: customFields ?? [],
    });

    if (error) throw error;
  } catch (err) {
    console.error("Nu am putut salva fișa de cazare în Supabase:", err);
    return NextResponse.json(
      { error: "A apărut o eroare la salvare. Te rugăm încearcă din nou." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
