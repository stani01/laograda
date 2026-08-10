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
} from "lucide-react";

const AMENITIES = [
  { icon: Wifi, label: "Wi-Fi gratuit" },
  { icon: Mountain, label: "Vedere superbă la munte" },
  { icon: KeyRound, label: "Check-in automat, cu cutie cu cod" },
  { icon: Laptop, label: "Spațiu de lucru dedicat" },
  { icon: UtensilsCrossed, label: "Bucătărie complet utilată" },
  { icon: Coffee, label: "Espressor de cafea" },
  { icon: WashingMachine, label: "Mașină de spălat rufe" },
  { icon: Flame, label: "Grătar interior & exterior" },
  { icon: Baby, label: "Trambulină & loc de joacă pentru copii" },
  { icon: Bath, label: "Jacuzzi (cost suplimentar)" },
  { icon: Car, label: "Parcare gratuită" },
  { icon: Trees, label: "Curte generoasă, râu în apropiere" },
];

export function AmenitiesSection() {
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
        {AMENITIES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-6 text-center ring-1 ring-foreground/5"
          >
            <Icon className="size-6 text-primary" aria-hidden />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
