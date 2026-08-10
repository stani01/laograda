import { createAdminClient } from "@/lib/supabase/admin";
import type { AmenityIconKey } from "@/lib/amenity-icons";

export interface SiteSettings {
  heroSubtitle: string;
  aboutText: string;
  address: string;
  mapsUrl: string;
  phone: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  airbnbUrl: string;
  bookingUrl: string;
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

export interface Amenity {
  id: string;
  icon: AmenityIconKey;
  label: string;
  position: number;
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

// Same copy the site shipped with, used whenever Supabase isn't configured
// yet (or the tables are empty) so the public site never breaks.
export const DEFAULT_SETTINGS: SiteSettings = {
  heroSubtitle:
    "Casă de vacanță la poalele Munților Făgăraș, cu vedere superbă la munte, curte generoasă și râu în apropiere.",
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
  priceNormal: 350,
  priceNormalLabel: "Sezon normal",
  priceNormalFeatures:
    "2 nopți minim\nCurent, apă, Wi-Fi incluse\nAnulare gratuită cu 7 zile înainte",
  priceWeekend: 450,
  priceWeekendLabel: "Weekend & sărbători",
  priceWeekendFeatures:
    "2 nopți minim\nCurent, apă, Wi-Fi incluse\nFoc de tabără & lemne incluse",
  priceLongStay: 300,
  priceLongStayLabel: "Sejur lung (5+ nopți)",
  priceLongStayFeatures:
    "Preț redus pentru șederi lungi\nCurent, apă, Wi-Fi incluse\nCurățenie inclusă",
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

/**
 * Reads the admin-editable content from Supabase. Falls back to the
 * defaults above (no throwing) if Supabase isn't configured yet or the
 * tables are still empty, so the public site always renders something.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const supabase = createAdminClient();

    const [settingsRes, amenitiesRes, galleryRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("amenities").select("*").order("position", { ascending: true }),
      supabase.from("gallery_images").select("*").order("position", { ascending: true }),
    ]);

    const settings: SiteSettings = settingsRes.data
      ? {
          heroSubtitle: settingsRes.data.hero_subtitle ?? DEFAULT_SETTINGS.heroSubtitle,
          aboutText: settingsRes.data.about_text ?? DEFAULT_SETTINGS.aboutText,
          address: settingsRes.data.address ?? DEFAULT_SETTINGS.address,
          mapsUrl: settingsRes.data.maps_url ?? DEFAULT_SETTINGS.mapsUrl,
          phone: settingsRes.data.phone ?? DEFAULT_SETTINGS.phone,
          email: settingsRes.data.email ?? DEFAULT_SETTINGS.email,
          instagramUrl: settingsRes.data.instagram_url ?? DEFAULT_SETTINGS.instagramUrl,
          facebookUrl: settingsRes.data.facebook_url ?? DEFAULT_SETTINGS.facebookUrl,
          airbnbUrl: settingsRes.data.airbnb_url ?? DEFAULT_SETTINGS.airbnbUrl,
          bookingUrl: settingsRes.data.booking_url ?? DEFAULT_SETTINGS.bookingUrl,
          priceNormal: Number(settingsRes.data.price_normal ?? DEFAULT_SETTINGS.priceNormal),
          priceNormalLabel: settingsRes.data.price_normal_label ?? DEFAULT_SETTINGS.priceNormalLabel,
          priceNormalFeatures:
            settingsRes.data.price_normal_features ?? DEFAULT_SETTINGS.priceNormalFeatures,
          priceWeekend: Number(settingsRes.data.price_weekend ?? DEFAULT_SETTINGS.priceWeekend),
          priceWeekendLabel: settingsRes.data.price_weekend_label ?? DEFAULT_SETTINGS.priceWeekendLabel,
          priceWeekendFeatures:
            settingsRes.data.price_weekend_features ?? DEFAULT_SETTINGS.priceWeekendFeatures,
          priceLongStay: Number(settingsRes.data.price_long_stay ?? DEFAULT_SETTINGS.priceLongStay),
          priceLongStayLabel:
            settingsRes.data.price_long_stay_label ?? DEFAULT_SETTINGS.priceLongStayLabel,
          priceLongStayFeatures:
            settingsRes.data.price_long_stay_features ?? DEFAULT_SETTINGS.priceLongStayFeatures,
        }
      : DEFAULT_SETTINGS;

    const amenities: Amenity[] =
      amenitiesRes.data && amenitiesRes.data.length > 0
        ? amenitiesRes.data.map((row) => ({
            id: row.id,
            icon: row.icon as AmenityIconKey,
            label: row.label,
            position: row.position,
          }))
        : DEFAULT_AMENITIES.map((a, i) => ({ ...a, id: `default-${i}` }));

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
      settings: DEFAULT_SETTINGS,
      amenities: DEFAULT_AMENITIES.map((a, i) => ({ ...a, id: `default-${i}` })),
      gallery: [],
    };
  }
}
