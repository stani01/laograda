import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { AMENITY_ICON_KEYS } from "@/lib/amenity-icons";

const contentSchema = z.object({
  settings: z.object({
    heroTitle: z.string().trim().min(1).max(80),
    heroTitleEn: z.string().trim().max(80),
    heroSubtitle: z.string().trim().min(1).max(400),
    heroSubtitleEn: z.string().trim().max(400),
    ctaPrimaryText: z.string().trim().min(1).max(60),
    ctaPrimaryTextEn: z.string().trim().max(60),
    ctaSecondaryText: z.string().trim().min(1).max(60),
    ctaSecondaryTextEn: z.string().trim().max(60),
    aboutText: z.string().trim().min(1).max(600),
    aboutTextEn: z.string().trim().max(600),
    address: z.string().trim().min(1).max(200),
    mapsUrl: z.string().url().max(500),
    phone: z.string().trim().min(1).max(40),
    email: z.string().email(),
    instagramUrl: z.string().url().max(500),
    facebookUrl: z.string().url().max(500),
    airbnbUrl: z.string().url().max(500),
    bookingUrl: z.string().url().max(500),
    travelminitUrl: z.union([z.string().url().max(500), z.literal("")]),
    amenitiesTitle: z.string().trim().min(1).max(80),
    amenitiesTitleEn: z.string().trim().max(80),
    amenitiesSubtitle: z.string().trim().min(1).max(300),
    amenitiesSubtitleEn: z.string().trim().max(300),
    galleryTitle: z.string().trim().min(1).max(80),
    galleryTitleEn: z.string().trim().max(80),
    bookingTitle: z.string().trim().min(1).max(120),
    bookingTitleEn: z.string().trim().max(120),
    bookingSubtitle: z.string().trim().min(1).max(300),
    bookingSubtitleEn: z.string().trim().max(300),
    pricingTitle: z.string().trim().min(1).max(80),
    pricingTitleEn: z.string().trim().max(80),
    pricingSubtitle: z.string().trim().min(1).max(300),
    pricingSubtitleEn: z.string().trim().max(300),
    contactTitle: z.string().trim().min(1).max(80),
    contactTitleEn: z.string().trim().max(80),
    contactSubtitle: z.string().trim().min(1).max(300),
    contactSubtitleEn: z.string().trim().max(300),
    priceNormal: z.coerce.number().min(0),
    priceNormalLabel: z.string().trim().min(1).max(80),
    priceNormalLabelEn: z.string().trim().max(80),
    priceNormalFeatures: z.string().trim().min(1).max(500),
    priceNormalFeaturesEn: z.string().trim().max(500),
    priceWeekend: z.coerce.number().min(0),
    priceWeekendLabel: z.string().trim().min(1).max(80),
    priceWeekendLabelEn: z.string().trim().max(80),
    priceWeekendFeatures: z.string().trim().min(1).max(500),
    priceWeekendFeaturesEn: z.string().trim().max(500),
    priceLongStay: z.coerce.number().min(0),
    priceLongStayLabel: z.string().trim().min(1).max(80),
    priceLongStayLabelEn: z.string().trim().max(80),
    priceLongStayFeatures: z.string().trim().min(1).max(500),
    priceLongStayFeaturesEn: z.string().trim().max(500),
  }),
  amenities: z
    .array(
      z.object({
        icon: z.enum(AMENITY_ICON_KEYS as [string, ...string[]]),
        label: z.string().trim().min(1).max(120),
        labelEn: z.string().trim().max(120),
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
      hero_title: settings.heroTitle,
      hero_title_en: settings.heroTitleEn || null,
      hero_subtitle: settings.heroSubtitle,
      hero_subtitle_en: settings.heroSubtitleEn || null,
      cta_primary_text: settings.ctaPrimaryText,
      cta_primary_text_en: settings.ctaPrimaryTextEn || null,
      cta_secondary_text: settings.ctaSecondaryText,
      cta_secondary_text_en: settings.ctaSecondaryTextEn || null,
      about_text: settings.aboutText,
      about_text_en: settings.aboutTextEn || null,
      address: settings.address,
      maps_url: settings.mapsUrl,
      phone: settings.phone,
      email: settings.email,
      instagram_url: settings.instagramUrl,
      facebook_url: settings.facebookUrl,
      airbnb_url: settings.airbnbUrl,
      booking_url: settings.bookingUrl,
      travelminit_url: settings.travelminitUrl,
      amenities_title: settings.amenitiesTitle,
      amenities_title_en: settings.amenitiesTitleEn || null,
      amenities_subtitle: settings.amenitiesSubtitle,
      amenities_subtitle_en: settings.amenitiesSubtitleEn || null,
      gallery_title: settings.galleryTitle,
      gallery_title_en: settings.galleryTitleEn || null,
      booking_title: settings.bookingTitle,
      booking_title_en: settings.bookingTitleEn || null,
      booking_subtitle: settings.bookingSubtitle,
      booking_subtitle_en: settings.bookingSubtitleEn || null,
      pricing_title: settings.pricingTitle,
      pricing_title_en: settings.pricingTitleEn || null,
      pricing_subtitle: settings.pricingSubtitle,
      pricing_subtitle_en: settings.pricingSubtitleEn || null,
      contact_title: settings.contactTitle,
      contact_title_en: settings.contactTitleEn || null,
      contact_subtitle: settings.contactSubtitle,
      contact_subtitle_en: settings.contactSubtitleEn || null,
      price_normal: settings.priceNormal,
      price_normal_label: settings.priceNormalLabel,
      price_normal_label_en: settings.priceNormalLabelEn || null,
      price_normal_features: settings.priceNormalFeatures,
      price_normal_features_en: settings.priceNormalFeaturesEn || null,
      price_weekend: settings.priceWeekend,
      price_weekend_label: settings.priceWeekendLabel,
      price_weekend_label_en: settings.priceWeekendLabelEn || null,
      price_weekend_features: settings.priceWeekendFeatures,
      price_weekend_features_en: settings.priceWeekendFeaturesEn || null,
      price_long_stay: settings.priceLongStay,
      price_long_stay_label: settings.priceLongStayLabel,
      price_long_stay_label_en: settings.priceLongStayLabelEn || null,
      price_long_stay_features: settings.priceLongStayFeatures,
      price_long_stay_features_en: settings.priceLongStayFeaturesEn || null,
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
      amenities.map((a, index) => ({ icon: a.icon, label: a.label, label_en: a.labelEn || null, position: index }))
    );

    if (insertError) {
      return NextResponse.json({ error: "Eroare la salvarea facilităților" }, { status: 500 });
    }
  }

  await logAdminAction({
    actorEmail: user.email ?? "necunoscut",
    action: "content.update",
    entityType: "site_settings",
    details: { amenitiesCount: amenities.length },
  });

  return NextResponse.json({ ok: true });
}
