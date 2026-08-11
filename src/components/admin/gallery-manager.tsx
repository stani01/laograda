"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, Trash2, Upload } from "lucide-react";
import type { GalleryImage } from "@/lib/site-content";

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

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
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    setReorderingId(images[index].id);
    setImages(reordered);
    persistOrder(reordered).finally(() => setReorderingId(null));
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
          Folosește săgețile de pe fiecare poză pentru a schimba ordinea în care apar pe site.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
            <Image src={image.url} alt={image.alt} fill className="object-cover" unoptimized />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                disabled={index === 0 || reorderingId !== null}
                onClick={() => moveImage(index, -1)}
                aria-label="Mută mai devreme"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                disabled={index === images.length - 1 || reorderingId !== null}
                onClick={() => moveImage(index, 1)}
                aria-label="Mută mai târziu"
              >
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
              disabled={deletingId === image.id}
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
