import { Mountain, Mail, Phone, MapPin, Instagram, Globe, Bookmark } from "lucide-react";
import type { SiteSettings } from "@/lib/site-content";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-script text-2xl">
            <Mountain className="size-5 text-primary" aria-hidden />
            La Ograda
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{settings.aboutText}</p>
        </div>

        <div className="text-sm">
          <h3 className="mb-3 font-heading font-semibold">Contact</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-foreground">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              <a href={`mailto:${settings.email}`} className="hover:text-foreground">
                {settings.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline"
              >
                {settings.address}
              </a>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="mb-3 font-heading font-semibold">Găsește-ne și pe</h3>
          <div className="flex items-center gap-3">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:bg-primary hover:text-white"
            >
              <Instagram className="size-5" aria-hidden />
              <span className="sr-only">Instagram</span>
            </a>

            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:bg-primary hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
              </svg>
              <span className="sr-only">Facebook</span>
            </a>

            <a
              href={settings.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:bg-primary hover:text-white"
            >
              <Globe className="size-5" aria-hidden />
              <span className="sr-only">Airbnb</span>
            </a>

            <a
              href={settings.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:bg-primary hover:text-white"
            >
              <Bookmark className="size-5" aria-hidden />
              <span className="sr-only">Booking.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {year} La Ograda. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
