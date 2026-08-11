"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFieldValue, GuestRegistrationForm } from "@/types/guest-registration";

const DOCUMENT_TYPE_LABELS: Record<GuestRegistrationForm["documentType"], string> = {
  CI: "Carte de identitate",
  pasaport: "Pașaport",
};

export function GuestRegistrationEditor({ initial }: { initial: GuestRegistrationForm }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [customFields, setCustomFields] = useState<CustomFieldValue[]>(initial.customFields);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof GuestRegistrationForm>(key: K, value: GuestRegistrationForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateCustomField(index: number, value: string) {
    setCustomFields((prev) => prev.map((c, i) => (i === index ? { ...c, value } : c)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/guest-registration/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          documentType: form.documentType,
          documentSeries: form.documentSeries,
          documentNumber: form.documentNumber,
          nationality: form.nationality,
          birthDate: form.birthDate,
          address: form.address,
          phone: form.phone,
          email: form.email,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guestsCount: form.guestsCount,
          additionalGuests: form.additionalGuests,
          purpose: form.purpose,
          customFields,
        }),
      });

      if (!res.ok) {
        toast.error("Nu am putut salva modificările.");
        return;
      }

      toast.success("Modificările au fost salvate.");
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setSaving(false);
    }
  }

  const printRows: { label: string; value: string }[] = [
    { label: "Nume și prenume", value: form.fullName },
    {
      label: "Act de identitate",
      value: `${DOCUMENT_TYPE_LABELS[form.documentType]}${form.documentSeries ? ` seria ${form.documentSeries}` : ""} nr. ${form.documentNumber}`,
    },
    { label: "Naționalitate", value: form.nationality },
    { label: "Data nașterii", value: form.birthDate ?? "—" },
    { label: "Adresă domiciliu", value: form.address },
    { label: "Telefon", value: form.phone },
    { label: "Email", value: form.email ?? "—" },
    { label: "Perioada sejurului", value: `${form.checkIn} → ${form.checkOut}` },
    { label: "Număr persoane", value: String(form.guestsCount) },
    { label: "Alte persoane cazate", value: form.additionalGuests ?? "—" },
    { label: "Scopul călătoriei", value: form.purpose },
    ...customFields.map((c) => ({ label: c.label, value: c.value || "—" })),
    {
      label: "Completată la",
      value: new Date(form.createdAt).toLocaleString("ro-RO", { dateStyle: "long", timeStyle: "short" }),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="font-heading text-2xl font-semibold">Fișă de cazare</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Salvează modificările
          </Button>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden />
            Printează / Salvează PDF
          </Button>
        </div>
      </div>

      {/* Editable form — corrections here also update the printable summary below immediately, saved or not. */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 print:hidden">
        <div className="grid gap-1.5">
          <Label htmlFor="fullName">Nume și prenume</Label>
          <Input id="fullName" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="documentType">Tip act</Label>
            <select
              id="documentType"
              value={form.documentType}
              onChange={(e) => updateField("documentType", e.target.value as GuestRegistrationForm["documentType"])}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            >
              <option value="CI">Carte de identitate</option>
              <option value="pasaport">Pașaport</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="documentSeries">Serie</Label>
            <Input
              id="documentSeries"
              value={form.documentSeries ?? ""}
              onChange={(e) => updateField("documentSeries", e.target.value || null)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="documentNumber">Număr act</Label>
            <Input id="documentNumber" value={form.documentNumber} onChange={(e) => updateField("documentNumber", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="nationality">Naționalitate</Label>
            <Input id="nationality" value={form.nationality} onChange={(e) => updateField("nationality", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="birthDate">Data nașterii</Label>
            <Input
              id="birthDate"
              type="date"
              value={form.birthDate ?? ""}
              onChange={(e) => updateField("birthDate", e.target.value || null)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="address">Adresă domiciliu</Label>
          <Input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => updateField("email", e.target.value || null)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="checkIn">Data sosirii</Label>
            <Input id="checkIn" type="date" value={form.checkIn} onChange={(e) => updateField("checkIn", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="checkOut">Data plecării</Label>
            <Input id="checkOut" type="date" value={form.checkOut} onChange={(e) => updateField("checkOut", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="guestsCount">Număr persoane</Label>
            <Input
              id="guestsCount"
              type="number"
              min={1}
              max={20}
              value={form.guestsCount}
              onChange={(e) => updateField("guestsCount", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="additionalGuests">Alte persoane cazate</Label>
          <Textarea
            id="additionalGuests"
            rows={2}
            value={form.additionalGuests ?? ""}
            onChange={(e) => updateField("additionalGuests", e.target.value || null)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="purpose">Scopul călătoriei</Label>
          <Input id="purpose" value={form.purpose} onChange={(e) => updateField("purpose", e.target.value)} />
        </div>

        {customFields.map((field, index) => (
          <div key={field.key} className="grid gap-1.5">
            <Label htmlFor={`custom-${field.key}`}>{field.label}</Label>
            <Input
              id={`custom-${field.key}`}
              value={field.value}
              onChange={(e) => updateCustomField(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Read-only printable summary — screen never shows this, only the print/PDF output does. */}
      <div className="hidden print:block">
        <h2 className="font-heading text-xl font-semibold">Fișă de anunțare a cazării</h2>
        <p className="mt-1 text-sm text-muted-foreground">LaOgrada — Valea Avrigului, Județul Sibiu</p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {printRows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{row.label}</dt>
              <dd className="mt-0.5 text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
