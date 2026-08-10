import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck, MapPin } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-[85vh] items-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary),transparent_80%),transparent_60%),radial-gradient(circle_at_80%_0%,color-mix(in_oklch,var(--chart-2),transparent_85%),transparent_55%)] bg-stone-900"
    >
      {/* Placeholder scenery gradient — swap for a real hero photo of the cabin. */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/70 to-stone-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2260%22%20height=%2260%22%3E%3Cpath%20d=%22M0%200h60v60H0z%22%20fill=%22none%22/%3E%3Cpath%20d=%22M0%2060L60%200%22%20stroke=%22%23ffffff10%22/%3E%3C/svg%3E')] opacity-40" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 text-stone-50 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-50/20 bg-stone-50/10 px-3 py-1 text-xs font-medium tracking-wide uppercase backdrop-blur-sm">
          <MapPin className="size-3.5" aria-hidden />
          Avrig, Județul Sibiu
        </span>

        <h1 className="max-w-2xl font-heading text-4xl leading-tight font-semibold sm:text-6xl">
          La Ograda
        </h1>

        <p className="max-w-xl text-lg text-stone-200 sm:text-xl">
          Casă de vacanță la poalele Munților Făgăraș, cu vedere superbă la
          munte, curte generoasă și râu în apropiere. Rezervă direct și
          bucură-te de o vacanță fără griji, cu disponibilitate actualizată
          în timp real de pe Booking.com și Airbnb.
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 px-6 text-base"
            nativeButton={false}
            render={
              <Link href="#rezervare">
                <CalendarCheck className="size-5" aria-hidden />
                Verifică disponibilitate
              </Link>
            }
          />
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-stone-50/30 bg-transparent px-6 text-base text-stone-50 hover:bg-stone-50/10 hover:text-stone-50"
            nativeButton={false}
            render={<Link href="#galerie">Vezi galeria foto</Link>}
          />
        </div>
      </div>
    </section>
  );
}
