import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteContent } from "@/lib/site-content";

// Re-fetch admin-edited content at most once a minute, so changes made in
// /admin show up on the live site without needing a new deploy.
export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteContent();

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
