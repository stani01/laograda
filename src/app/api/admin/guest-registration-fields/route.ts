import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { CUSTOM_FIELD_TYPES } from "@/types/guest-registration";

const fieldDefSchema = z.object({
  fieldKey: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Folosește doar litere mici, cifre și underscore"),
  label: z.string().trim().min(1).max(150),
  labelEn: z.string().trim().max(150),
  fieldType: z.enum(CUSTOM_FIELD_TYPES),
  required: z.boolean(),
});

const bodySchema = z.object({
  fields: z.array(fieldDefSchema).max(40),
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

  const keys = fields.map((f) => f.fieldKey);
  if (new Set(keys).size !== keys.length) {
    return NextResponse.json({ error: "Cheile câmpurilor trebuie să fie unice" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Simplest consistent update: replace the whole field list, same pattern
  // used for amenities in /api/admin/content.
  const { error: deleteError } = await supabase
    .from("guest_registration_field_defs")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    return NextResponse.json({ error: "Eroare la salvarea câmpurilor" }, { status: 500 });
  }

  if (fields.length > 0) {
    const { error: insertError } = await supabase.from("guest_registration_field_defs").insert(
      fields.map((f, index) => ({
        field_key: f.fieldKey,
        label: f.label,
        label_en: f.labelEn,
        field_type: f.fieldType,
        required: f.required,
        position: index,
      }))
    );

    if (insertError) {
      return NextResponse.json({ error: "Eroare la salvarea câmpurilor" }, { status: 500 });
    }
  }

  await logAdminAction({
    actorEmail: user.email ?? "necunoscut",
    action: "guest_registration_fields.update",
    entityType: "guest_registration_field_defs",
    details: { count: fields.length },
  });

  return NextResponse.json({ ok: true });
}
