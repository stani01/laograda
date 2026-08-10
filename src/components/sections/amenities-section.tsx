import { getAmenityIcon } from "@/lib/amenity-icons";
import type { Amenity } from "@/lib/site-content";

export function AmenitiesSection({ amenities }: { amenities: Amenity[] }) {
  return (
    <section id="facilitati" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Facilități</h2>
        <p className="mt-3 text-muted-foreground">
          7 oaspeți · 3 dormitoare · 3 paturi · 2 băi — tot ce ai nevoie
          pentru o ședere confortabilă, indiferent de sezon.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {amenities.map((amenity) => {
          const Icon = getAmenityIcon(amenity.icon);
          return (
            <div
              key={amenity.id}
              className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-6 text-center ring-1 ring-foreground/5"
            >
              <Icon className="size-6 text-primary" aria-hidden />
              <span className="text-sm font-medium">{amenity.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
