import { HeroSection } from "@/components/sections/hero-section";
import { AmenitiesSection } from "@/components/sections/amenities-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { BookingSection } from "@/components/sections/booking-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { ContactSection } from "@/components/sections/contact-section";
import { getSiteContent } from "@/lib/site-content";

// English mirror of src/app/(site)/page.tsx — same sections, resolved for
// the "en" locale. Kept as a separate page (rather than a [locale] dynamic
// segment) so the existing Romanian URLs never change.
export const revalidate = 60;

export default async function EnglishHome() {
  const { settings, amenities, gallery } = await getSiteContent("en");

  return (
    <>
      <HeroSection settings={settings} images={gallery} />
      <AmenitiesSection settings={settings} amenities={amenities} />
      <GallerySection settings={settings} images={gallery} locale="en" />
      <BookingSection settings={settings} locale="en" />
      <PricingSection settings={settings} locale="en" />
      <ContactSection settings={settings} locale="en" />
    </>
  );
}
