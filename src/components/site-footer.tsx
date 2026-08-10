import { Mountain, Mail, Phone, MapPin, Instagram, Facebook, Globe, Bookmark } from "lucide-react";
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
              <Facebook className="size-5" aria-hidden />
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
