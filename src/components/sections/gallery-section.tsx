"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { LightboxImage } from "@/components/sections/lightbox-image";
import type { GalleryImage, SiteSettings } from "@/lib/site-content";
import { getDictionary, type Locale } from "@/lib/i18n";

// Placeholder tiles shown until real photos are uploaded from /admin/galerie.
const PLACEHOLDER_COUNT = 6;

export function GallerySection({
  settings,
  images,
  locale,
}: {
  settings: SiteSettings;
  images: GalleryImage[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  function showPrev() {
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  function showNext() {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  return (
    <section id="galerie" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{settings.galleryTitle}</h2>
          {images.length === 0 && (
            <p className="mt-3 text-muted-foreground">
              {t.gallery.comingSoonPrefix}{" "}
              <Link
                href="https://www.airbnb.com/rooms/44671053"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4"
              >
                {t.gallery.airbnbLinkText}
              </Link>
              .
            </p>
          )}
        </div>

        {images.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={t.gallery.zoomIn}
                onClick={() => setActiveIndex(index)}
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

      <Dialog
        open={activeImage !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndex(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "ArrowRight") showNext();
          }}
          className="inset-0 top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-black p-0 shadow-none ring-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[85vh] sm:w-[90vw] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-white/15 sm:shadow-2xl"
        >
          {activeImage && <LightboxImage key={activeImage.id} src={activeImage.url} alt={activeImage.alt} />}

          <DialogClose
            render={
              <button
                type="button"
                aria-label={t.gallery.close}
                className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              />
            }
          >
            <X className="size-6" aria-hidden />
          </DialogClose>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t.gallery.prev}
                onClick={showPrev}
                className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 sm:left-4"
              >
                <ChevronLeft className="size-6" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={t.gallery.next}
                onClick={showNext}
                className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 sm:right-4"
              >
                <ChevronRight className="size-6" aria-hidden />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
