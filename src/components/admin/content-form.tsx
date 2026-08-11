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
import type { AdminSiteSettings, AdminAmenity } from "@/lib/site-content";

interface AmenityDraft {
  icon: AmenityIconKey;
  label: string;
  labelEn: string;
}

// Fields that have a Romanian value + an "...En" English counterpart on
// AdminSiteSettings. The form-locale toggle below switches which of the
// pair each translatable input reads from/writes to.
type TranslatableField = Extract<
  keyof AdminSiteSettings,
  "heroTitle" | "heroSubtitle" | "ctaPrimaryText" | "ctaSecondaryText" | "aboutText" | "amenitiesTitle" |
  "amenitiesSubtitle" | "galleryTitle" | "bookingTitle" | "bookingSubtitle" | "pricingTitle" | "pricingSubtitle" |
  "contactTitle" | "contactSubtitle" | "priceNormalLabel" | "priceNormalFeatures" | "priceWeekendLabel" |
  "priceWeekendFeatures" | "priceLongStayLabel" | "priceLongStayFeatures"
>;

const EN_KEY: Record<TranslatableField, keyof AdminSiteSettings> = {
  heroTitle: "heroTitleEn",
  heroSubtitle: "heroSubtitleEn",
  ctaPrimaryText: "ctaPrimaryTextEn",
  ctaSecondaryText: "ctaSecondaryTextEn",
  aboutText: "aboutTextEn",
  amenitiesTitle: "amenitiesTitleEn",
  amenitiesSubtitle: "amenitiesSubtitleEn",
  galleryTitle: "galleryTitleEn",
  bookingTitle: "bookingTitleEn",
  bookingSubtitle: "bookingSubtitleEn",
  pricingTitle: "pricingTitleEn",
  pricingSubtitle: "pricingSubtitleEn",
  contactTitle: "contactTitleEn",
  contactSubtitle: "contactSubtitleEn",
  priceNormalLabel: "priceNormalLabelEn",
  priceNormalFeatures: "priceNormalFeaturesEn",
  priceWeekendLabel: "priceWeekendLabelEn",
  priceWeekendFeatures: "priceWeekendFeaturesEn",
  priceLongStayLabel: "priceLongStayLabelEn",
  priceLongStayFeatures: "priceLongStayFeaturesEn",
};

export function ContentForm({
  initialSettings,
  initialAmenities,
}: {
  initialSettings: AdminSiteSettings;
  initialAmenities: AdminAmenity[];
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [amenities, setAmenities] = useState<AmenityDraft[]>(
    initialAmenities.map((a) => ({ icon: a.icon, label: a.label, labelEn: a.labelEn }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [formLocale, setFormLocale] = useState<"ro" | "en">("ro");

  function translatableValue(field: TranslatableField): string {
    return (formLocale === "en" ? settings[EN_KEY[field]] : settings[field]) as string;
  }

  function setTranslatableValue(field: TranslatableField, value: string) {
    const key = formLocale === "en" ? EN_KEY[field] : field;
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function updateAmenity(index: number, patch: Partial<AmenityDraft>) {
    setAmenities((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function removeAmenity(index: number) {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  }

  function addAmenity() {
    setAmenities((prev) => [...prev, { icon: "sparkles", label: "", labelEn: "" }]);
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
      <div className="sticky top-0 z-10 flex items-center gap-2 rounded-lg border border-border/60 bg-background/95 p-2 backdrop-blur-sm">
        <span className="px-1 text-sm text-muted-foreground">Limbă conținut:</span>
        <Button
          type="button"
          size="sm"
          variant={formLocale === "ro" ? "default" : "outline"}
          onClick={() => setFormLocale("ro")}
        >
          🇷🇴 Română
        </Button>
        <Button
          type="button"
          size="sm"
          variant={formLocale === "en" ? "default" : "outline"}
          onClick={() => setFormLocale("en")}
        >
          🇬🇧 English
        </Button>
        {formLocale === "en" && (
          <span className="px-1 text-xs text-muted-foreground">
            Necompletat = site-ul afișează automat textul românesc.
          </span>
        )}
      </div>

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
                value={translatableValue("heroTitle")}
                onChange={(e) => setTranslatableValue("heroTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ctaPrimaryText">Text buton principal</Label>
              <Input
                id="ctaPrimaryText"
                value={translatableValue("ctaPrimaryText")}
                onChange={(e) => setTranslatableValue("ctaPrimaryText", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="heroSubtitle">Subtitlu (prima pagină)</Label>
            <Textarea
              id="heroSubtitle"
              rows={3}
              value={translatableValue("heroSubtitle")}
              onChange={(e) => setTranslatableValue("heroSubtitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ctaSecondaryText">Text buton secundar (prima pagină)</Label>
            <Input
              id="ctaSecondaryText"
              value={translatableValue("ctaSecondaryText")}
              onChange={(e) => setTranslatableValue("ctaSecondaryText", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="aboutText">Descriere (subsol)</Label>
            <Textarea
              id="aboutText"
              rows={3}
              value={translatableValue("aboutText")}
              onChange={(e) => setTranslatableValue("aboutText", e.target.value)}
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
              value={translatableValue("amenitiesTitle")}
              onChange={(e) => setTranslatableValue("amenitiesTitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="galleryTitle">Titlu — Galerie foto</Label>
            <Input
              id="galleryTitle"
              value={translatableValue("galleryTitle")}
              onChange={(e) => setTranslatableValue("galleryTitle", e.target.value)}
            />
          </div>
          <div className="col-span-full grid gap-1.5">
            <Label htmlFor="amenitiesSubtitle">Subtitlu — Facilități</Label>
            <Textarea
              id="amenitiesSubtitle"
              rows={2}
              value={translatableValue("amenitiesSubtitle")}
              onChange={(e) => setTranslatableValue("amenitiesSubtitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bookingTitle">Titlu — Rezervare</Label>
            <Input
              id="bookingTitle"
              value={translatableValue("bookingTitle")}
              onChange={(e) => setTranslatableValue("bookingTitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pricingTitle">Titlu — Prețuri</Label>
            <Input
              id="pricingTitle"
              value={translatableValue("pricingTitle")}
              onChange={(e) => setTranslatableValue("pricingTitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bookingSubtitle">Subtitlu — Rezervare</Label>
            <Textarea
              id="bookingSubtitle"
              rows={2}
              value={translatableValue("bookingSubtitle")}
              onChange={(e) => setTranslatableValue("bookingSubtitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pricingSubtitle">Subtitlu — Prețuri</Label>
            <Textarea
              id="pricingSubtitle"
              rows={2}
              value={translatableValue("pricingSubtitle")}
              onChange={(e) => setTranslatableValue("pricingSubtitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contactTitle">Titlu — Contact</Label>
            <Input
              id="contactTitle"
              value={translatableValue("contactTitle")}
              onChange={(e) => setTranslatableValue("contactTitle", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contactSubtitle">Subtitlu — Contact</Label>
            <Textarea
              id="contactSubtitle"
              rows={2}
              value={translatableValue("contactSubtitle")}
              onChange={(e) => setTranslatableValue("contactSubtitle", e.target.value)}
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
                value={translatableValue("priceNormalLabel")}
                onChange={(e) => setTranslatableValue("priceNormalLabel", e.target.value)}
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
                value={translatableValue("priceNormalFeatures")}
                onChange={(e) => setTranslatableValue("priceNormalFeatures", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="priceWeekendLabel">Denumire plan</Label>
              <Input
                id="priceWeekendLabel"
                value={translatableValue("priceWeekendLabel")}
                onChange={(e) => setTranslatableValue("priceWeekendLabel", e.target.value)}
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
                value={translatableValue("priceWeekendFeatures")}
                onChange={(e) => setTranslatableValue("priceWeekendFeatures", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="priceLongStayLabel">Denumire plan</Label>
              <Input
                id="priceLongStayLabel"
                value={translatableValue("priceLongStayLabel")}
                onChange={(e) => setTranslatableValue("priceLongStayLabel", e.target.value)}
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
                value={translatableValue("priceLongStayFeatures")}
                onChange={(e) => setTranslatableValue("priceLongStayFeatures", e.target.value)}
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
                value={formLocale === "en" ? amenity.labelEn : amenity.label}
                onChange={(e) =>
                  updateAmenity(index, formLocale === "en" ? { labelEn: e.target.value } : { label: e.target.value })
                }
                placeholder={formLocale === "en" ? "e.g. Superb mountain views" : "ex: Vedere superbă la munte"}
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
