import Link from "next/link";
import { TreePine, Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-heading text-lg font-semibold">
            <TreePine className="size-5 text-primary" aria-hidden />
            La Ograda
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            O casă de vacanță primitoare la poalele Munților Făgăraș — locul
            perfect pentru o evadare din oraș, weekenduri liniștite și
            vacanțe în familie.
          </p>
        </div>

        <div className="text-sm">
          <h3 className="mb-3 font-heading font-semibold">Contact</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              <a href="tel:+40700000000" className="hover:text-foreground">
                +40 700 000 000
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              <a href="mailto:contact@laograda.ro" className="hover:text-foreground">
                contact@laograda.ro
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span>Avrig, Județul Sibiu</span>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h3 className="mb-3 font-heading font-semibold">Găsește-ne și pe</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="#rezervare" className="hover:text-foreground">
                Booking.com
              </Link>
            </li>
            <li>
              <Link href="#rezervare" className="hover:text-foreground">
                Airbnb
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {year} La Ograda. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
