import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteContent } from "@/lib/site-content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteContent();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
