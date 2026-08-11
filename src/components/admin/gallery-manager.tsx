"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/site-content";

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      toast.error("Selectează cel puțin o poză.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      formData.set("alt", alt);

      const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Încărcarea a eșuat.");
        return;
      }

      setImages((prev) => [...prev, ...(data.images as GalleryImage[])]);
      setAlt("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(
        data.images.length > 1 ? `${data.images.length} poze au fost adăugate.` : "Poza a fost adăugată."
      );
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Ștergerea a eșuat.");
        return;
      }
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Poza a fost ștearsă.");
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setDeletingId(null);
    }
  }

  async function persistOrder(order: GalleryImage[]) {
    setReordering(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: order.map((img) => img.id) }),
      });
      if (!res.ok) {
        toast.error("Nu am putut salva ordinea pozelor.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setReordering(false);
    }
  }

  function handleDrop(targetId: string) {
    const sourceId = draggedId;
    setDraggedId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetId) return;

    const fromIndex = images.findIndex((img) => img.id === sourceId);
    const toIndex = images.findIndex((img) => img.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setImages(reordered);
    persistOrder(reordered);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <form onSubmit={handleUpload} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="gallery-file">Poze (jpg, png, webp — max 8MB fiecare, poți selecta mai multe)</Label>
              <Input
                id="gallery-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                ref={fileInputRef}
              />
            </div>
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="gallery-alt">Descriere scurtă</Label>
              <Input id="gallery-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="ex: Curtea casei vara" />
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
              Încarcă
            </Button>
          </form>
        </CardContent>
      </Card>

      {images.length === 0 && (
        <p className="text-sm text-muted-foreground">Nu ai adăugat încă nicio poză.</p>
      )}

      {images.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Trage o poză de mânerul din colțul din stânga sus pentru a schimba ordinea în care apar pe site.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDraggedId(image.id)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOverId !== image.id) setDragOverId(image.id);
            }}
            onDragLeave={() => setDragOverId((current) => (current === image.id ? null : current))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(image.id);
            }}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverId(null);
            }}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl bg-muted ring-primary transition",
              draggedId === image.id && "opacity-40",
              dragOverId === image.id && draggedId !== image.id && "ring-2"
            )}
          >
            <Image src={image.url} alt={image.alt} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />

            <div
              className="absolute top-2 left-2 flex size-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
              aria-hidden="true"
            >
              <GripVertical className="size-4" />
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
              disabled={deletingId === image.id || reordering}
              onClick={() => handleDelete(image.id)}
            >
              {deletingId === image.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="size-4" aria-hidden />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
