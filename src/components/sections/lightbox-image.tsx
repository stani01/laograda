"use client";

/**
 * Pinch-to-zoom + pan for the gallery lightbox (mobile) with mouse-wheel
 * zoom and double-click/tap as a bonus for desktop. Implemented with plain
 * Pointer Events (works for touch and mouse alike) instead of a library,
 * since we only need: track 1-2 active pointers, compute pinch distance
 * for scale, and drag-to-pan once zoomed in.
 *
 * Deliberately does NOT close the dialog on click/tap (unlike the rest of
 * the page) — once zoom/pan is interactive, a tap on the photo needs to
 * manipulate it, not dismiss it. Clicking the backdrop or the explicit
 * close button still closes the lightbox as before.
 */
import { useRef, useState } from "react";
import Image from "next/image";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distanceBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function LightboxImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isGesturing, setIsGesturing] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const panStart = useRef<{ x: number; y: number } | null>(null);

  function resetZoom() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setIsGesturing(true);

    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()];
      pinchStart.current = { distance: distanceBetween(p1, p2), scale };
      panStart.current = null;
    } else if (pointers.current.size === 1 && scale > 1) {
      panStart.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [p1, p2] = [...pointers.current.values()];
      const distance = distanceBetween(p1, p2);
      const nextScale = clamp(
        pinchStart.current.scale * (distance / pinchStart.current.distance),
        MIN_SCALE,
        MAX_SCALE
      );
      setScale(nextScale);
    } else if (pointers.current.size === 1 && panStart.current) {
      setTranslate({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);

    if (pointers.current.size === 0) {
      pinchStart.current = null;
      panStart.current = null;
      setIsGesturing(false);
      if (scale <= 1) resetZoom();
    } else if (pointers.current.size === 1) {
      // Went from pinching (2 fingers) to panning (1 finger) — restart the pan anchor.
      const [[, point]] = pointers.current;
      pinchStart.current = null;
      panStart.current = { x: point.x - translate.x, y: point.y - translate.y };
    }
  }

  function onDoubleClick() {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const next = clamp(scale - e.deltaY * 0.01, MIN_SCALE, MAX_SCALE);
    setScale(next);
    if (next <= 1) resetZoom();
  }

  return (
    <div
      className="relative flex max-h-[85vh] max-w-[90vw] touch-none items-center justify-center overscroll-contain"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      onWheel={onWheel}
    >
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={1440}
        quality={90}
        sizes="90vw"
        draggable={false}
        className="block h-auto max-h-[85vh] w-auto max-w-[90vw] touch-none select-none object-contain"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: isGesturing ? "none" : "transform 150ms ease-out",
          cursor: scale > 1 ? "grab" : "zoom-in",
        }}
      />
    </div>
  );
}
