"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Upload } from "lucide-react";
import type { GalleryImage } from "@/lib/site-content";

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Selectează o poză.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("alt", alt);

      const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Încărcarea a eșuat.");
        return;
      }

      setImages((prev) => [...prev, data]);
      setAlt("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Poza a fost adăugată.");
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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <form onSubmit={handleUpload} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="gallery-file">Poză (jpg, png, webp — max 8MB)</Label>
              <Input id="gallery-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" ref={fileInputRef} />
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
            <Image src={image.url} alt={image.alt} fill className="object-cover" unoptimized />
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
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
