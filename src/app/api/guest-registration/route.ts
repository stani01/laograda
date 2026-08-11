import { NextResponse, type NextRequest } from "next/server";
import { guestRegistrationSchema } from "@/types/guest-registration";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
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
  } = parsed.data;

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
