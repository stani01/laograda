import { ImageIcon } from "lucide-react";
import Link from "next/link";

// Placeholder tiles until real photos of the cabin are available — drop
// files into /public/gallery and swap this array for <Image> tags.
const PLACEHOLDER_COUNT = 6;

export function GallerySection() {
  return (
    <section id="galerie" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Galerie foto</h2>
          <p className="mt-3 text-muted-foreground">
            Fotografiem curând casa pentru acest site — până atunci, poți
            vedea poze reale{" "}
            <Link
              href="https://www.airbnb.com/rooms/44671053"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              pe profilul nostru Airbnb
            </Link>
            .
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 text-stone-400 dark:from-stone-800 dark:to-stone-900"
            >
              <ImageIcon className="size-8" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
