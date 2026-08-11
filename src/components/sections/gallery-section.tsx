"use client";

import { ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LightboxImage } from "@/components/sections/lightbox-image";
import type { GalleryImage, SiteSettings } from "@/lib/site-content";

// Placeholder tiles shown until real photos are uploaded from /admin/galerie.
const PLACEHOLDER_COUNT = 6;

export function GallerySection({
  settings,
  images,
}: {
  settings: SiteSettings;
  images: GalleryImage[];
}) {
  return (
    <section id="galerie" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{settings.galleryTitle}</h2>
          {images.length === 0 && (
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
          )}
        </div>

        {images.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((image) => (
              <Dialog key={image.id}>
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Mărește poza"
                      className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-muted"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 640px) 33vw, 50vw"
                        quality={85}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  }
                />
                <DialogContent
                  showCloseButton
                  className="flex max-h-[90vh] items-center justify-center border-none bg-transparent p-0 shadow-none ring-0"
                >
                  <div className="overflow-hidden rounded-xl border border-white/15 shadow-2xl">
                    <LightboxImage src={image.url} alt={image.alt} />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
