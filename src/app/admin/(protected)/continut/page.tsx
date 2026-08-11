import { getAdminSiteContent } from "@/lib/site-content";
import { ContentForm } from "@/components/admin/content-form";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const { settings, amenities } = await getAdminSiteContent();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Conținut site</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Textele, prețurile și facilitățile afișate pe pagina principală.
      </p>

      <div className="mt-6">
        <ContentForm initialSettings={settings} initialAmenities={amenities} />
      </div>
    </div>
  );
}
