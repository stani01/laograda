import { HeroSection } from "@/components/sections/hero-section";
import { AmenitiesSection } from "@/components/sections/amenities-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { BookingSection } from "@/components/sections/booking-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AmenitiesSection />
      <GallerySection />
      <BookingSection />
      <PricingSection />
      <ContactSection />
    </>
  );
}
