import Link from "next/link";
import { redirect } from "next/navigation";
import { TreePine } from "lucide-react";
import { requireAdminUser } from "@/lib/admin-auth";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

const ADMIN_NAV = [
  { href: "/admin/rezervari", label: "Rezervări" },
  { href: "/admin/continut", label: "Conținut" },
  { href: "/admin/galerie", label: "Galerie" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-heading text-lg font-semibold">
              <TreePine className="size-5 text-primary" aria-hidden />
              Admin
            </Link>
            <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
              {ADMIN_NAV.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
        <nav className="flex items-center gap-4 overflow-x-auto border-t border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground sm:hidden">
          {ADMIN_NAV.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
