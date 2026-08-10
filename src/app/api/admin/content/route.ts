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
    mapsUrl: z.string().url().max(500),
    phone: z.string().trim().min(1).max(40),
    email: z.string().email(),
    instagramUrl: z.string().url().max(500),
    facebookUrl: z.string().url().max(500),
    airbnbUrl: z.string().url().max(500),
    bookingUrl: z.string().url().max(500),
    priceNormal: z.coerce.number().min(0),
    priceNormalLabel: z.string().trim().min(1).max(80),
    priceNormalFeatures: z.string().trim().min(1).max(500),
    priceWeekend: z.coerce.number().min(0),
    priceWeekendLabel: z.string().trim().min(1).max(80),
    priceWeekendFeatures: z.string().trim().min(1).max(500),
    priceLongStay: z.coerce.number().min(0),
    priceLongStayLabel: z.string().trim().min(1).max(80),
    priceLongStayFeatures: z.string().trim().min(1).max(500),
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
      instagram_url: settings.instagramUrl,
      facebook_url: settings.facebookUrl,
      airbnb_url: settings.airbnbUrl,
      booking_url: settings.bookingUrl,
      price_normal: settings.priceNormal,
      price_normal_features: settings.priceNormalFeatures,
      price_weekend: settings.priceWeekend,
      price_weekend_label: settings.priceWeekendLabel,
      price_weekend_features: settings.priceWeekendFeatures,
      price_long_stay: settings.priceLongStay,
      price_long_stay_label: settings.priceLongStayLabel,
      price_long_stay_features: settings.priceLongStayFeatures,
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
