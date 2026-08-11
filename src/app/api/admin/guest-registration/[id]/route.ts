import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-audit";

const customFieldValueSchema = z.object({
  key: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(150),
  value: z.string().trim().max(1000),
});

const updateSchema = z.object({
  fullName: z.string().trim().min(1).max(150),
  documentType: z.enum(["CI", "pasaport"]),
  documentSeries: z.string().trim().max(20).nullable(),
  documentNumber: z.string().trim().min(1).max(30),
  nationality: z.string().trim().min(1).max(60),
  birthDate: z.string().trim().max(10).nullable(),
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().min(1).max(20),
  email: z.string().trim().max(200).nullable(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestsCount: z.coerce.number().int().min(1).max(20),
  additionalGuests: z.string().trim().max(500).nullable(),
  purpose: z.string().trim().min(1).max(100),
  customFields: z.array(customFieldValueSchema).max(30),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("guest_registration_forms")
    .update({
      full_name: data.fullName,
      document_type: data.documentType,
      document_series: data.documentSeries || null,
      document_number: data.documentNumber,
      nationality: data.nationality,
      birth_date: data.birthDate || null,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
      check_in: data.checkIn,
      check_out: data.checkOut,
      guests_count: data.guestsCount,
      additional_guests: data.additionalGuests || null,
      purpose: data.purpose,
      custom_fields: data.customFields,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: user.email ?? "necunoscut",
    action: "guest_registration.update",
    entityType: "guest_registration_form",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
