import { getSiteContent } from "@/lib/site-content";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const { gallery } = await getSiteContent();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Galerie foto</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Poze afișate în secțiunea Galerie de pe pagina principală.
      </p>

      <div className="mt-6">
        <GalleryManager initialImages={gallery} />
      </div>
    </div>
  );
}
