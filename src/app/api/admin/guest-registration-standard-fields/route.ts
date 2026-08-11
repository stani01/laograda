import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { STANDARD_FIELD_KEYS } from "@/types/guest-registration";

const fieldSchema = z.object({
  key: z.enum(STANDARD_FIELD_KEYS),
  label: z.string().trim().min(1).max(150),
  labelEn: z.string().trim().max(150),
  required: z.boolean(),
});

const bodySchema = z.object({
  fields: z.array(fieldSchema).max(STANDARD_FIELD_KEYS.length),
});

export async function PUT(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { fields } = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase.from("guest_registration_standard_fields").upsert(
    fields.map((f) => ({
      key: f.key,
      label: f.label,
      label_en: f.labelEn,
      required: f.required,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ error: "Eroare la salvarea câmpurilor standard" }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: user.email ?? "necunoscut",
    action: "guest_registration_standard_fields.update",
    entityType: "guest_registration_standard_fields",
    details: { count: fields.length },
  });

  return NextResponse.json({ ok: true });
}
