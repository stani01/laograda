"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { SiteSettings } from "@/lib/site-content";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ContactSection({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const t = getDictionary(locale);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, message, company }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? t.contact.errorGeneric);
        return;
      }

      toast.success(t.contact.successToast);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      toast.error(t.contact.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{settings.contactTitle}</h2>
          <p className="mt-3 max-w-md text-muted-foreground">{settings.contactSubtitle}</p>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" aria-hidden />
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:underline">{settings.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" aria-hidden />
              <a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a>
            </li>
          </ul>

          <Button
            className="mt-6 bg-[#25D366] text-white hover:bg-[#1ea952]"
            nativeButton={false}
            render={
              <a
                href={`https://wa.me/${settings.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-5" aria-hidden />
                {t.contact.whatsapp}
              </a>
            }
          />
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="contact-name">{t.contact.name}</Label>
                  <Input id="contact-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="contact-phone">{t.contact.phoneOptional}</Label>
                  <Input id="contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="contact-email">{t.contact.email}</Label>
                <Input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="contact-message">{t.contact.message}</Label>
                <Textarea id="contact-message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>

              <div className="hidden" aria-hidden="true">
                <Label htmlFor="contact-company">Companie</Label>
                <Input id="contact-company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <Button type="submit" disabled={submitting} className="mt-2">
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {t.contact.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
