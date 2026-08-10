import {
  Wifi,
  Mountain,
  KeyRound,
  Laptop,
  UtensilsCrossed,
  Coffee,
  WashingMachine,
  Flame,
  Baby,
  Bath,
  Car,
  Trees,
  Tv,
  Wind,
  Dog,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Fixed registry of icons an admin can pick for a custom amenity — keeps the
 * icon column in `public.amenities` a safe, known key instead of arbitrary
 * text, while still letting the site render a real lucide icon for it.
 */
export const AMENITY_ICONS = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  mountain: { icon: Mountain, label: "Vedere la munte" },
  "key-round": { icon: KeyRound, label: "Check-in automat" },
  laptop: { icon: Laptop, label: "Spațiu de lucru" },
  utensils: { icon: UtensilsCrossed, label: "Bucătărie" },
  coffee: { icon: Coffee, label: "Cafea" },
  "washing-machine": { icon: WashingMachine, label: "Mașină de spălat rufe" },
  flame: { icon: Flame, label: "Grătar / foc de tabără" },
  baby: { icon: Baby, label: "Copii / loc de joacă" },
  bath: { icon: Bath, label: "Baie / jacuzzi" },
  car: { icon: Car, label: "Parcare" },
  trees: { icon: Trees, label: "Curte / natură" },
  tv: { icon: Tv, label: "TV" },
  wind: { icon: Wind, label: "Încălzire / AC" },
  dog: { icon: Dog, label: "Animale de companie" },
  sparkles: { icon: Sparkles, label: "Altceva" },
} satisfies Record<string, { icon: LucideIcon; label: string }>;

export type AmenityIconKey = keyof typeof AMENITY_ICONS;

export const AMENITY_ICON_KEYS = Object.keys(AMENITY_ICONS) as AmenityIconKey[];

export function getAmenityIcon(key: string): LucideIcon {
  return (AMENITY_ICONS as Record<string, { icon: LucideIcon; label: string }>)[key]?.icon ?? Sparkles;
}
