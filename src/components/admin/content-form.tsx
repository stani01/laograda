"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { AMENITY_ICONS, AMENITY_ICON_KEYS, type AmenityIconKey } from "@/lib/amenity-icons";
import type { SiteSettings, Amenity } from "@/lib/site-content";

interface AmenityDraft {
  icon: AmenityIconKey;
  label: string;
}

export function ContentForm({
  initialSettings,
  initialAmenities,
}: {
  initialSettings: SiteSettings;
  initialAmenities: Amenity[];
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [amenities, setAmenities] = useState<AmenityDraft[]>(
    initialAmenities.map((a) => ({ icon: a.icon, label: a.label }))
  );
  const [submitting, setSubmitting] = useState(false);

  function updateAmenity(index: number, patch: Partial<AmenityDraft>) {
    setAmenities((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function removeAmenity(index: number) {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  }

  function addAmenity() {
    setAmenities((prev) => [...prev, { icon: "sparkles", label: "" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          amenities: amenities.filter((a) => a.label.trim().length > 0),
        }),
      });

      if (!res.ok) {
        toast.error("Nu am putut salva modificările.");
        return;
      }

      toast.success("Conținutul a fost salvat.");
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Texte principale</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="heroTitle">Titlu (prima pagină)</Label>
              <Input
                id="heroTitle"
                value={settings.heroTitle}
                onChange={(e) => setSettings((s) => ({ ...s, heroTitle: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ctaPrimaryText">Text buton principal</Label>
              <Input
                id="ctaPrimaryText"
                value={settings.ctaPrimaryText}
                onChange={(e) => setSettings((s) => ({ ...s, ctaPrimaryText: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="heroSubtitle">Subtitlu (prima pagină)</Label>
            <Textarea
              id="heroSubtitle"
              rows={3}
              value={settings.heroSubtitle}
              onChange={(e) => setSettings((s) => ({ ...s, heroSubtitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ctaSecondaryText">Text buton secundar (prima pagină)</Label>
            <Input
              id="ctaSecondaryText"
              value={settings.ctaSecondaryText}
              onChange={(e) => setSettings((s) => ({ ...s, ctaSecondaryText: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="aboutText">Descriere (subsol)</Label>
            <Textarea
              id="aboutText"
              rows={3}
              value={settings.aboutText}
              onChange={(e) => setSettings((s) => ({ ...s, aboutText: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="address">Locație</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mapsUrl">Link Google Maps</Label>
              <Input
                id="mapsUrl"
                type="url"
                placeholder="https://maps.app.goo.gl/..."
                value={settings.mapsUrl}
                onChange={(e) => setSettings((s) => ({ ...s, mapsUrl: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => setSettings((s) => ({ ...s, instagramUrl: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="facebookUrl">Facebook</Label>
              <Input
                id="facebookUrl"
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => setSettings((s) => ({ ...s, facebookUrl: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="airbnbUrl">Airbnb</Label>
              <Input
                id="airbnbUrl"
                type="url"
                value={settings.airbnbUrl}
                onChange={(e) => setSettings((s) => ({ ...s, airbnbUrl: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bookingUrl">Booking.com</Label>
              <Input
                id="bookingUrl"
                type="url"
                value={settings.bookingUrl}
                onChange={(e) => setSettings((s) => ({ ...s, bookingUrl: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="travelminitUrl">Travelminit</Label>
            <Input
              id="travelminitUrl"
              type="url"
              placeholder="https://www.travelminit.ro/..."
              value={settings.travelminitUrl}
              onChange={(e) => setSettings((s) => ({ ...s, travelminitUrl: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Texte secțiuni</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="amenitiesTitle">Titlu — Facilități</Label>
            <Input
              id="amenitiesTitle"
              value={settings.amenitiesTitle}
              onChange={(e) => setSettings((s) => ({ ...s, amenitiesTitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="galleryTitle">Titlu — Galerie foto</Label>
            <Input
              id="galleryTitle"
              value={settings.galleryTitle}
              onChange={(e) => setSettings((s) => ({ ...s, galleryTitle: e.target.value }))}
            />
          </div>
          <div className="col-span-full grid gap-1.5">
            <Label htmlFor="amenitiesSubtitle">Subtitlu — Facilități</Label>
            <Textarea
              id="amenitiesSubtitle"
              rows={2}
              value={settings.amenitiesSubtitle}
              onChange={(e) => setSettings((s) => ({ ...s, amenitiesSubtitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bookingTitle">Titlu — Rezervare</Label>
            <Input
              id="bookingTitle"
              value={settings.bookingTitle}
              onChange={(e) => setSettings((s) => ({ ...s, bookingTitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pricingTitle">Titlu — Prețuri</Label>
            <Input
              id="pricingTitle"
              value={settings.pricingTitle}
              onChange={(e) => setSettings((s) => ({ ...s, pricingTitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bookingSubtitle">Subtitlu — Rezervare</Label>
            <Textarea
              id="bookingSubtitle"
              rows={2}
              value={settings.bookingSubtitle}
              onChange={(e) => setSettings((s) => ({ ...s, bookingSubtitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pricingSubtitle">Subtitlu — Prețuri</Label>
            <Textarea
              id="pricingSubtitle"
              rows={2}
              value={settings.pricingSubtitle}
              onChange={(e) => setSettings((s) => ({ ...s, pricingSubtitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contactTitle">Titlu — Contact</Label>
            <Input
              id="contactTitle"
              value={settings.contactTitle}
              onChange={(e) => setSettings((s) => ({ ...s, contactTitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contactSubtitle">Subtitlu — Contact</Label>
            <Textarea
              id="contactSubtitle"
              rows={2}
              value={settings.contactSubtitle}
              onChange={(e) => setSettings((s) => ({ ...s, contactSubtitle: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Prețuri (lei / noapte)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="priceNormalLabel">Denumire plan</Label>
              <Input
                id="priceNormalLabel"
                value={settings.priceNormalLabel}
                onChange={(e) => setSettings((s) => ({ ...s, priceNormalLabel: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priceNormal">Preț / noapte</Label>
              <Input
                id="priceNormal"
                type="number"
                min={0}
                value={settings.priceNormal}
                onChange={(e) => setSettings((s) => ({ ...s, priceNormal: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priceNormalFeatures">Descriere (câte o linie = un rând)</Label>
              <Textarea
                id="priceNormalFeatures"
                rows={4}
                value={settings.priceNormalFeatures}
                onChange={(e) => setSettings((s) => ({ ...s, priceNormalFeatures: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="priceWeekendLabel">Denumire plan</Label>
              <Input
                id="priceWeekendLabel"
                value={settings.priceWeekendLabel}
                onChange={(e) => setSettings((s) => ({ ...s, priceWeekendLabel: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priceWeekend">Preț / noapte</Label>
              <Input
                id="priceWeekend"
                type="number"
                min={0}
                value={settings.priceWeekend}
                onChange={(e) => setSettings((s) => ({ ...s, priceWeekend: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priceWeekendFeatures">Descriere (câte o linie = un rând)</Label>
              <Textarea
                id="priceWeekendFeatures"
                rows={4}
                value={settings.priceWeekendFeatures}
                onChange={(e) => setSettings((s) => ({ ...s, priceWeekendFeatures: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="priceLongStayLabel">Denumire plan</Label>
              <Input
                id="priceLongStayLabel"
                value={settings.priceLongStayLabel}
                onChange={(e) => setSettings((s) => ({ ...s, priceLongStayLabel: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priceLongStay">Preț / noapte</Label>
              <Input
                id="priceLongStay"
                type="number"
                min={0}
                value={settings.priceLongStay}
                onChange={(e) => setSettings((s) => ({ ...s, priceLongStay: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priceLongStayFeatures">Descriere (câte o linie = un rând)</Label>
              <Textarea
                id="priceLongStayFeatures"
                rows={4}
                value={settings.priceLongStayFeatures}
                onChange={(e) => setSettings((s) => ({ ...s, priceLongStayFeatures: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Facilități</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={amenity.icon}
                onChange={(e) => updateAmenity(index, { icon: e.target.value as AmenityIconKey })}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
              >
                {AMENITY_ICON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {AMENITY_ICONS[key].label}
                  </option>
                ))}
              </select>
              <Input
                value={amenity.label}
                onChange={(e) => updateAmenity(index, { label: e.target.value })}
                placeholder="ex: Vedere superbă la munte"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => removeAmenity(index)}>
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addAmenity} className="self-start">
            <Plus className="size-4" aria-hidden />
            Adaugă facilitate
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Salvează
      </Button>
    </form>
  );
}
