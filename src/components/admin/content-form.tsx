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
