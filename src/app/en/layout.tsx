import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteContent } from "@/lib/site-content";

// English mirror of src/app/(site)/layout.tsx — same header/footer, just
// resolved for the "en" locale (falls back to the Romanian text for any
// field the owners haven't translated yet from /admin).
export const revalidate = 60;

export default async function EnglishSiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteContent("en");

  return (
    <>
      <SiteHeader settings={settings} locale="en" />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} locale="en" />
    </>
  );
}
