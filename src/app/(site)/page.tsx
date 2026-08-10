import { HeroSection } from "@/components/sections/hero-section";
import { AmenitiesSection } from "@/components/sections/amenities-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { BookingSection } from "@/components/sections/booking-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { ContactSection } from "@/components/sections/contact-section";
import { getSiteContent } from "@/lib/site-content";

// Re-fetch admin-edited content at most once a minute, so changes made in
// /admin show up on the live site without needing a new deploy.
export const revalidate = 60;

export default async function Home() {
  const { settings, amenities, gallery } = await getSiteContent();

  return (
    <>
      <HeroSection settings={settings} />
      <AmenitiesSection amenities={amenities} />
      <GallerySection images={gallery} />
      <BookingSection />
      <PricingSection settings={settings} />
      <ContactSection settings={settings} />
    </>
  );
}

