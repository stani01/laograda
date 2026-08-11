import { createAdminClient } from "@/lib/supabase/admin";
import type { AmenityIconKey } from "@/lib/amenity-icons";

export type Locale = "ro" | "en";

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  aboutText: string;
  address: string;
  mapsUrl: string;
  phone: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  airbnbUrl: string;
  bookingUrl: string;
  travelminitUrl: string;
  amenitiesTitle: string;
  amenitiesSubtitle: string;
  galleryTitle: string;
  bookingTitle: string;
  bookingSubtitle: string;
  pricingTitle: string;
  pricingSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  priceNormal: number;
  priceNormalLabel: string;
  priceNormalFeatures: string;
  priceWeekend: number;
  priceWeekendLabel: string;
  priceWeekendFeatures: string;
  priceLongStay: number;
  priceLongStayLabel: string;
  priceLongStayFeatures: string;
}

/** Same shape as SiteSettings (Romanian values) plus the raw English pair
 * for every translatable field, used only by the admin content editor. */
export interface AdminSiteSettings extends SiteSettings {
  heroTitleEn: string;
  heroSubtitleEn: string;
  ctaPrimaryTextEn: string;
  ctaSecondaryTextEn: string;
  aboutTextEn: string;
  amenitiesTitleEn: string;
  amenitiesSubtitleEn: string;
  galleryTitleEn: string;
  bookingTitleEn: string;
  bookingSubtitleEn: string;
  pricingTitleEn: string;
  pricingSubtitleEn: string;
  contactTitleEn: string;
  contactSubtitleEn: string;
  priceNormalLabelEn: string;
  priceNormalFeaturesEn: string;
  priceWeekendLabelEn: string;
  priceWeekendFeaturesEn: string;
  priceLongStayLabelEn: string;
  priceLongStayFeaturesEn: string;
}

export interface Amenity {
  id: string;
  icon: AmenityIconKey;
  label: string;
  position: number;
}

export interface AdminAmenity extends Amenity {
  labelEn: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface SiteContent {
  settings: SiteSettings;
  amenities: Amenity[];
  gallery: GalleryImage[];
}

export interface AdminSiteContent {
  settings: AdminSiteSettings;
  amenities: AdminAmenity[];
  gallery: GalleryImage[];
}

// Same copy the site shipped with, used whenever Supabase isn't configured
// yet (or the tables are empty) so the public site never breaks.
export const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: "LaOgradă",
  heroSubtitle:
    "Casă de vacanță la poalele Munților Făgăraș, cu vedere superbă la munte, curte generoasă și râu în apropiere.",
  ctaPrimaryText: "Verifică disponibilitate",
  ctaSecondaryText: "Vezi galeria foto",
  aboutText:
    "O casă de vacanță primitoare la poalele Munților Făgăraș — locul perfect pentru o evadare din oraș, weekenduri liniștite și vacanțe în familie.",
  address: "Valea Avrigului, Județul Sibiu",
  mapsUrl: "https://maps.app.goo.gl/supPC8QDwQRM7Dns8",
  phone: "+40 700 000 000",
  email: "contact@laograda.ro",
  instagramUrl: "https://www.instagram.com/laograda/",
  facebookUrl: "https://www.facebook.com/p/LaOgrada-100071189138778/",
  airbnbUrl: "https://www.airbnb.com/rooms/44671053",
  bookingUrl: "https://www.booking.com/hotel/ro/laograda.ro.html",
  travelminitUrl: "https://travelminit.ro/cabana-la-ograda-avrig",
  amenitiesTitle: "Facilități",
  amenitiesSubtitle:
    "7 oaspeți · 3 dormitoare · 3 paturi · 2 băi — tot ce ai nevoie pentru o ședere confortabilă, indiferent de sezon.",
  galleryTitle: "Galerie foto",
  bookingTitle: "Verifică disponibilitatea și rezervă",
  bookingSubtitle:
    "Calendarul este sincronizat automat cu Booking.com, Airbnb și Travelminit — datele ocupate sunt blocate mai jos.",
  pricingTitle: "Prețuri",
  pricingSubtitle:
    "Prețuri orientative — vor fi confirmate la trimiterea cererii de rezervare. Acceptăm și carduri de vacanță.",
  contactTitle: "Contact",
  contactSubtitle: "Ai întrebări despre casă, acces sau facilități? Scrie-ne și îți răspundem cât mai curând.",
  priceNormal: 1100,
  priceNormalLabel: "Sezon normal",
  priceNormalFeatures:
    "2 nopți minim\nCurent, apă, Wi-Fi incluse\nAnulare gratuită cu 7 zile înainte",
  priceWeekend: 1200,
  priceWeekendLabel: "Weekend & sărbători",
  priceWeekendFeatures:
    "2 nopți minim\nCurent, apă, Wi-Fi incluse\nFoc de tabără & lemne incluse",
  priceLongStay: 1000,
  priceLongStayLabel: "Sejur lung (5+ nopți)",
  priceLongStayFeatures:
    "Preț redus pentru șederi lungi\nCurent, apă, Wi-Fi incluse\nCurățenie inclusă",
};

// English translations used only as a fallback when Supabase isn't
// configured yet AND the visitor is on the /en site — everyday marketing
// copy, not anything legally sensitive.
export const DEFAULT_SETTINGS_EN: SiteSettings = {
  ...DEFAULT_SETTINGS,
  heroTitle: "LaOgradă",
  heroSubtitle:
    "A vacation home at the foot of the Făgăraș Mountains, with superb mountain views, a generous yard and a river nearby.",
  ctaPrimaryText: "Check availability",
  ctaSecondaryText: "View photo gallery",
  aboutText:
    "A welcoming vacation home at the foot of the Făgăraș Mountains — the perfect place to escape the city, for quiet weekends and family holidays.",
  amenitiesTitle: "Amenities",
  amenitiesSubtitle:
    "7 guests · 3 bedrooms · 3 beds · 2 bathrooms — everything you need for a comfortable stay, in any season.",
  galleryTitle: "Photo gallery",
  bookingTitle: "Check availability and book",
  bookingSubtitle:
    "The calendar is automatically synced with Booking.com, Airbnb and Travelminit — busy dates are blocked below.",
  pricingTitle: "Pricing",
  pricingSubtitle: "Indicative prices — confirmed when you send a booking request. We also accept vacation vouchers.",
  contactTitle: "Contact",
  contactSubtitle: "Questions about the house, access or amenities? Write to us and we'll reply as soon as possible.",
  priceNormalLabel: "Regular season",
  priceNormalFeatures: "2-night minimum\nElectricity, water, Wi-Fi included\nFree cancellation up to 7 days before",
  priceWeekendLabel: "Weekends & holidays",
  priceWeekendFeatures: "2-night minimum\nElectricity, water, Wi-Fi included\nCampfire & firewood included",
  priceLongStayLabel: "Long stay (5+ nights)",
  priceLongStayFeatures: "Discounted rate for long stays\nElectricity, water, Wi-Fi included\nCleaning included",
};

export const DEFAULT_AMENITIES: Omit<Amenity, "id">[] = [
  { icon: "wifi", label: "Wi-Fi gratuit", position: 0 },
  { icon: "mountain", label: "Vedere superbă la munte", position: 1 },
  { icon: "key-round", label: "Check-in automat, cu cutie cu cod", position: 2 },
  { icon: "laptop", label: "Spațiu de lucru dedicat", position: 3 },
  { icon: "utensils", label: "Bucătărie complet utilată", position: 4 },
  { icon: "coffee", label: "Espressor de cafea", position: 5 },
  { icon: "washing-machine", label: "Mașină de spălat rufe", position: 6 },
  { icon: "flame", label: "Grătar interior & exterior", position: 7 },
  { icon: "baby", label: "Trambulină & loc de joacă pentru copii", position: 8 },
  { icon: "bath", label: "Jacuzzi (cost suplimentar)", position: 9 },
  { icon: "car", label: "Parcare gratuită", position: 10 },
  { icon: "trees", label: "Curte generoasă, râu în apropiere", position: 11 },
];

export const DEFAULT_AMENITIES_EN: Omit<Amenity, "id">[] = [
  { icon: "wifi", label: "Free Wi-Fi", position: 0 },
  { icon: "mountain", label: "Superb mountain views", position: 1 },
  { icon: "key-round", label: "Self check-in with keypad lockbox", position: 2 },
  { icon: "laptop", label: "Dedicated workspace", position: 3 },
  { icon: "utensils", label: "Fully equipped kitchen", position: 4 },
  { icon: "coffee", label: "Coffee machine", position: 5 },
  { icon: "washing-machine", label: "Washing machine", position: 6 },
  { icon: "flame", label: "Indoor & outdoor grill", position: 7 },
  { icon: "baby", label: "Trampoline & kids' play area", position: 8 },
  { icon: "bath", label: "Jacuzzi (extra cost)", position: 9 },
  { icon: "car", label: "Free parking", position: 10 },
  { icon: "trees", label: "Generous yard, river nearby", position: 11 },
];

function resolveText(ro: string, en: string | null | undefined, locale: Locale): string {
  return locale === "en" && en ? en : ro;
}

/**
 * Reads the admin-editable content from Supabase, resolved for a single
 * locale (Romanian text is always the fallback if the English translation
 * hasn't been filled in yet from /admin). This is what public pages use.
 * Falls back to hardcoded defaults (no throwing) if Supabase isn't
 * configured yet or the tables are still empty, so the site always renders.
 */
export async function getSiteContent(locale: Locale = "ro"): Promise<SiteContent> {
  const defaultSettings = locale === "en" ? DEFAULT_SETTINGS_EN : DEFAULT_SETTINGS;
  const defaultAmenities = locale === "en" ? DEFAULT_AMENITIES_EN : DEFAULT_AMENITIES;

  try {
    const supabase = createAdminClient();

    const [settingsRes, amenitiesRes, galleryRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("amenities").select("*").order("position", { ascending: true }),
      supabase.from("gallery_images").select("*").order("position", { ascending: true }),
    ]);

    const row = settingsRes.data;

    const settings: SiteSettings = row
      ? {
          heroTitle: resolveText(row.hero_title ?? defaultSettings.heroTitle, row.hero_title_en, locale),
          heroSubtitle: resolveText(row.hero_subtitle ?? defaultSettings.heroSubtitle, row.hero_subtitle_en, locale),
          ctaPrimaryText: resolveText(
            row.cta_primary_text ?? defaultSettings.ctaPrimaryText,
            row.cta_primary_text_en,
            locale
          ),
          ctaSecondaryText: resolveText(
            row.cta_secondary_text ?? defaultSettings.ctaSecondaryText,
            row.cta_secondary_text_en,
            locale
          ),
          aboutText: resolveText(row.about_text ?? defaultSettings.aboutText, row.about_text_en, locale),
          address: row.address ?? defaultSettings.address,
          mapsUrl: row.maps_url ?? defaultSettings.mapsUrl,
          phone: row.phone ?? defaultSettings.phone,
          email: row.email ?? defaultSettings.email,
          instagramUrl: row.instagram_url ?? defaultSettings.instagramUrl,
          facebookUrl: row.facebook_url ?? defaultSettings.facebookUrl,
          airbnbUrl: row.airbnb_url ?? defaultSettings.airbnbUrl,
          bookingUrl: row.booking_url ?? defaultSettings.bookingUrl,
          travelminitUrl: row.travelminit_url ?? defaultSettings.travelminitUrl,
          amenitiesTitle: resolveText(
            row.amenities_title ?? defaultSettings.amenitiesTitle,
            row.amenities_title_en,
            locale
          ),
          amenitiesSubtitle: resolveText(
            row.amenities_subtitle ?? defaultSettings.amenitiesSubtitle,
            row.amenities_subtitle_en,
            locale
          ),
          galleryTitle: resolveText(row.gallery_title ?? defaultSettings.galleryTitle, row.gallery_title_en, locale),
          bookingTitle: resolveText(row.booking_title ?? defaultSettings.bookingTitle, row.booking_title_en, locale),
          bookingSubtitle: resolveText(
            row.booking_subtitle ?? defaultSettings.bookingSubtitle,
            row.booking_subtitle_en,
            locale
          ),
          pricingTitle: resolveText(row.pricing_title ?? defaultSettings.pricingTitle, row.pricing_title_en, locale),
          pricingSubtitle: resolveText(
            row.pricing_subtitle ?? defaultSettings.pricingSubtitle,
            row.pricing_subtitle_en,
            locale
          ),
          contactTitle: resolveText(row.contact_title ?? defaultSettings.contactTitle, row.contact_title_en, locale),
          contactSubtitle: resolveText(
            row.contact_subtitle ?? defaultSettings.contactSubtitle,
            row.contact_subtitle_en,
            locale
          ),
          priceNormal: Number(row.price_normal ?? defaultSettings.priceNormal),
          priceNormalLabel: resolveText(
            row.price_normal_label ?? defaultSettings.priceNormalLabel,
            row.price_normal_label_en,
            locale
          ),
          priceNormalFeatures: resolveText(
            row.price_normal_features ?? defaultSettings.priceNormalFeatures,
            row.price_normal_features_en,
            locale
          ),
          priceWeekend: Number(row.price_weekend ?? defaultSettings.priceWeekend),
          priceWeekendLabel: resolveText(
            row.price_weekend_label ?? defaultSettings.priceWeekendLabel,
            row.price_weekend_label_en,
            locale
          ),
          priceWeekendFeatures: resolveText(
            row.price_weekend_features ?? defaultSettings.priceWeekendFeatures,
            row.price_weekend_features_en,
            locale
          ),
          priceLongStay: Number(row.price_long_stay ?? defaultSettings.priceLongStay),
          priceLongStayLabel: resolveText(
            row.price_long_stay_label ?? defaultSettings.priceLongStayLabel,
            row.price_long_stay_label_en,
            locale
          ),
          priceLongStayFeatures: resolveText(
            row.price_long_stay_features ?? defaultSettings.priceLongStayFeatures,
            row.price_long_stay_features_en,
            locale
          ),
        }
      : defaultSettings;

    const amenities: Amenity[] =
      amenitiesRes.data && amenitiesRes.data.length > 0
        ? amenitiesRes.data.map((row) => ({
            id: row.id,
            icon: row.icon as AmenityIconKey,
            label: resolveText(row.label, row.label_en, locale),
            position: row.position,
          }))
        : defaultAmenities.map((a, i) => ({ ...a, id: `default-${i}` }));

    const gallery: GalleryImage[] = (galleryRes.data ?? []).map((row) => ({
      id: row.id,
      url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
      alt: row.alt,
      position: row.position,
    }));

    return { settings, amenities, gallery };
  } catch {
    // Supabase not configured yet — keep the site working with defaults.
    return {
      settings: defaultSettings,
      amenities: defaultAmenities.map((a, i) => ({ ...a, id: `default-${i}` })),
      gallery: [],
    };
  }
}

/**
 * Reads BOTH the Romanian and English text for every translatable field —
 * used only by the admin content editor (/admin/continut), which needs to
 * show and let owners edit both languages at once, unlike the public site
 * which only ever needs one resolved language at a time (see getSiteContent).
 */
export async function getAdminSiteContent(): Promise<AdminSiteContent> {
  const emptyEnFields = {
    heroTitleEn: "",
    heroSubtitleEn: "",
    ctaPrimaryTextEn: "",
    ctaSecondaryTextEn: "",
    aboutTextEn: "",
    amenitiesTitleEn: "",
    amenitiesSubtitleEn: "",
    galleryTitleEn: "",
    bookingTitleEn: "",
    bookingSubtitleEn: "",
    pricingTitleEn: "",
    pricingSubtitleEn: "",
    contactTitleEn: "",
    contactSubtitleEn: "",
    priceNormalLabelEn: "",
    priceNormalFeaturesEn: "",
    priceWeekendLabelEn: "",
    priceWeekendFeaturesEn: "",
    priceLongStayLabelEn: "",
    priceLongStayFeaturesEn: "",
  };

  try {
    const supabase = createAdminClient();

    const [settingsRes, amenitiesRes, galleryRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("amenities").select("*").order("position", { ascending: true }),
      supabase.from("gallery_images").select("*").order("position", { ascending: true }),
    ]);

    const row = settingsRes.data;

    const settings: AdminSiteSettings = row
      ? {
          heroTitle: row.hero_title ?? DEFAULT_SETTINGS.heroTitle,
          heroTitleEn: row.hero_title_en ?? "",
          heroSubtitle: row.hero_subtitle ?? DEFAULT_SETTINGS.heroSubtitle,
          heroSubtitleEn: row.hero_subtitle_en ?? "",
          ctaPrimaryText: row.cta_primary_text ?? DEFAULT_SETTINGS.ctaPrimaryText,
          ctaPrimaryTextEn: row.cta_primary_text_en ?? "",
          ctaSecondaryText: row.cta_secondary_text ?? DEFAULT_SETTINGS.ctaSecondaryText,
          ctaSecondaryTextEn: row.cta_secondary_text_en ?? "",
          aboutText: row.about_text ?? DEFAULT_SETTINGS.aboutText,
          aboutTextEn: row.about_text_en ?? "",
          address: row.address ?? DEFAULT_SETTINGS.address,
          mapsUrl: row.maps_url ?? DEFAULT_SETTINGS.mapsUrl,
          phone: row.phone ?? DEFAULT_SETTINGS.phone,
          email: row.email ?? DEFAULT_SETTINGS.email,
          instagramUrl: row.instagram_url ?? DEFAULT_SETTINGS.instagramUrl,
          facebookUrl: row.facebook_url ?? DEFAULT_SETTINGS.facebookUrl,
          airbnbUrl: row.airbnb_url ?? DEFAULT_SETTINGS.airbnbUrl,
          bookingUrl: row.booking_url ?? DEFAULT_SETTINGS.bookingUrl,
          travelminitUrl: row.travelminit_url ?? DEFAULT_SETTINGS.travelminitUrl,
          amenitiesTitle: row.amenities_title ?? DEFAULT_SETTINGS.amenitiesTitle,
          amenitiesTitleEn: row.amenities_title_en ?? "",
          amenitiesSubtitle: row.amenities_subtitle ?? DEFAULT_SETTINGS.amenitiesSubtitle,
          amenitiesSubtitleEn: row.amenities_subtitle_en ?? "",
          galleryTitle: row.gallery_title ?? DEFAULT_SETTINGS.galleryTitle,
          galleryTitleEn: row.gallery_title_en ?? "",
          bookingTitle: row.booking_title ?? DEFAULT_SETTINGS.bookingTitle,
          bookingTitleEn: row.booking_title_en ?? "",
          bookingSubtitle: row.booking_subtitle ?? DEFAULT_SETTINGS.bookingSubtitle,
          bookingSubtitleEn: row.booking_subtitle_en ?? "",
          pricingTitle: row.pricing_title ?? DEFAULT_SETTINGS.pricingTitle,
          pricingTitleEn: row.pricing_title_en ?? "",
          pricingSubtitle: row.pricing_subtitle ?? DEFAULT_SETTINGS.pricingSubtitle,
          pricingSubtitleEn: row.pricing_subtitle_en ?? "",
          contactTitle: row.contact_title ?? DEFAULT_SETTINGS.contactTitle,
          contactTitleEn: row.contact_title_en ?? "",
          contactSubtitle: row.contact_subtitle ?? DEFAULT_SETTINGS.contactSubtitle,
          contactSubtitleEn: row.contact_subtitle_en ?? "",
          priceNormal: Number(row.price_normal ?? DEFAULT_SETTINGS.priceNormal),
          priceNormalLabel: row.price_normal_label ?? DEFAULT_SETTINGS.priceNormalLabel,
          priceNormalLabelEn: row.price_normal_label_en ?? "",
          priceNormalFeatures: row.price_normal_features ?? DEFAULT_SETTINGS.priceNormalFeatures,
          priceNormalFeaturesEn: row.price_normal_features_en ?? "",
          priceWeekend: Number(row.price_weekend ?? DEFAULT_SETTINGS.priceWeekend),
          priceWeekendLabel: row.price_weekend_label ?? DEFAULT_SETTINGS.priceWeekendLabel,
          priceWeekendLabelEn: row.price_weekend_label_en ?? "",
          priceWeekendFeatures: row.price_weekend_features ?? DEFAULT_SETTINGS.priceWeekendFeatures,
          priceWeekendFeaturesEn: row.price_weekend_features_en ?? "",
          priceLongStay: Number(row.price_long_stay ?? DEFAULT_SETTINGS.priceLongStay),
          priceLongStayLabel: row.price_long_stay_label ?? DEFAULT_SETTINGS.priceLongStayLabel,
          priceLongStayLabelEn: row.price_long_stay_label_en ?? "",
          priceLongStayFeatures: row.price_long_stay_features ?? DEFAULT_SETTINGS.priceLongStayFeatures,
          priceLongStayFeaturesEn: row.price_long_stay_features_en ?? "",
        }
      : { ...DEFAULT_SETTINGS, ...emptyEnFields };

    const amenities: AdminAmenity[] =
      amenitiesRes.data && amenitiesRes.data.length > 0
        ? amenitiesRes.data.map((row) => ({
            id: row.id,
            icon: row.icon as AmenityIconKey,
            label: row.label,
            labelEn: row.label_en ?? "",
            position: row.position,
          }))
        : DEFAULT_AMENITIES.map((a, i) => ({ ...a, id: `default-${i}`, labelEn: "" }));

    const gallery: GalleryImage[] = (galleryRes.data ?? []).map((row) => ({
      id: row.id,
      url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
      alt: row.alt,
      position: row.position,
    }));

    return { settings, amenities, gallery };
  } catch {
    return {
      settings: { ...DEFAULT_SETTINGS, ...emptyEnFields },
      amenities: DEFAULT_AMENITIES.map((a, i) => ({ ...a, id: `default-${i}`, labelEn: "" })),
      gallery: [],
    };
  }
}

