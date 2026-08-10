"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "#top", label: "Acasă" },
  { href: "#facilitati", label: "Facilități" },
  { href: "#galerie", label: "Galerie" },
  { href: "#rezervare", label: "Rezervare" },
  { href: "#preturi", label: "Prețuri" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="#top" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
          <TreePine className="size-5 text-primary" aria-hidden />
          La Ograda
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button size="sm" nativeButton={false} render={<Link href="#rezervare">Verifică disponibilitate</Link>} />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Deschide meniul">
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle>La Ograda</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Button
                size="sm"
                className="mt-2"
                nativeButton={false}
                render={
                  <Link href="#rezervare" onClick={() => setOpen(false)}>
                    Verifică disponibilitate
                  </Link>
                }
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
