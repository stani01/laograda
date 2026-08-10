import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AMENITY_ICON_KEYS } from "@/lib/amenity-icons";

const contentSchema = z.object({
  settings: z.object({
    heroSubtitle: z.string().trim().min(1).max(400),
    aboutText: z.string().trim().min(1).max(600),
    address: z.string().trim().min(1).max(200),
    mapsUrl: z.url().max(500),
    phone: z.string().trim().min(1).max(40),
    email: z.email(),
    priceNormal: z.coerce.number().min(0),
    priceWeekend: z.coerce.number().min(0),
    priceLongStay: z.coerce.number().min(0),
  }),
  amenities: z
    .array(
      z.object({
        icon: z.enum(AMENITY_ICON_KEYS as [string, ...string[]]),
        label: z.string().trim().min(1).max(120),
      })
    )
    .max(30),
});

export async function PUT(request: Request) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = contentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { settings, amenities } = parsed.data;
  const supabase = createAdminClient();

  const { error: settingsError } = await supabase
    .from("site_settings")
    .update({
      hero_subtitle: settings.heroSubtitle,
      about_text: settings.aboutText,
      address: settings.address,
      maps_url: settings.mapsUrl,
      phone: settings.phone,
      email: settings.email,
      price_normal: settings.priceNormal,
      price_weekend: settings.priceWeekend,
      price_long_stay: settings.priceLongStay,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (settingsError) {
    return NextResponse.json({ error: "Eroare la salvarea textelor" }, { status: 500 });
  }

  // Simplest consistent update: replace the whole amenities list.
  const { error: deleteError } = await supabase
    .from("amenities")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    return NextResponse.json({ error: "Eroare la salvarea facilităților" }, { status: 500 });
  }

  if (amenities.length > 0) {
    const { error: insertError } = await supabase.from("amenities").insert(
      amenities.map((a, index) => ({ icon: a.icon, label: a.label, position: index }))
    );

    if (insertError) {
      return NextResponse.json({ error: "Eroare la salvarea facilităților" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
