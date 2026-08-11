"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { CustomFieldDef } from "@/types/guest-registration";

export function GuestRegistrationForm({ locale, fieldDefs }: { locale: Locale; fieldDefs: CustomFieldDef[] }) {
  const t = getDictionary(locale);
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState<"CI" | "pasaport">("CI");
  const [documentSeries, setDocumentSeries] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nationality, setNationality] = useState(locale === "en" ? "" : "Română");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [additionalGuests, setAdditionalGuests] = useState("");
  const [purpose, setPurpose] = useState(locale === "en" ? "Tourism" : "Turism");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!gdprConsent) {
      toast.error(t.guestRegistration.consentRequired);
      return;
    }

    for (const field of fieldDefs) {
      if (field.required && !(customValues[field.fieldKey] ?? "").trim()) {
        toast.error(locale === "en" ? field.labelEn || field.label : field.label);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/guest-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          documentType,
          documentSeries: documentSeries || undefined,
          documentNumber,
          nationality,
          birthDate: birthDate || undefined,
          address,
          phone,
          email: email || undefined,
          checkIn,
          checkOut,
          guestsCount,
          additionalGuests: additionalGuests || undefined,
          purpose,
          gdprConsent,
          locale,
          customFields: fieldDefs.map((field) => ({
            key: field.fieldKey,
            label: locale === "en" && field.labelEn ? field.labelEn : field.label,
            value: customValues[field.fieldKey] ?? "",
          })),
          company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? t.guestRegistration.errorGeneric);
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error(t.guestRegistration.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <h2 className="font-heading text-xl font-semibold">{t.guestRegistration.thankYouTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.guestRegistration.thankYouMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="fullName">{t.guestRegistration.fullName}</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="documentType">{t.guestRegistration.documentType}</Label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as "CI" | "pasaport")}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
              >
                <option value="CI">{t.guestRegistration.documentTypeCI}</option>
                <option value="pasaport">{t.guestRegistration.documentTypePassport}</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="documentSeries">{t.guestRegistration.documentSeries}</Label>
              <Input id="documentSeries" value={documentSeries} onChange={(e) => setDocumentSeries(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="documentNumber">{t.guestRegistration.documentNumber}</Label>
              <Input id="documentNumber" required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="nationality">{t.guestRegistration.nationality}</Label>
              <Input id="nationality" required value={nationality} onChange={(e) => setNationality(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="birthDate">{t.guestRegistration.birthDate}</Label>
              <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="address">{t.guestRegistration.address}</Label>
            <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">{t.guestRegistration.phone}</Label>
              <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">{t.guestRegistration.email}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="checkIn">{t.guestRegistration.checkIn}</Label>
              <Input id="checkIn" type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="checkOut">{t.guestRegistration.checkOut}</Label>
              <Input id="checkOut" type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="guestsCount">{t.guestRegistration.guestsCount}</Label>
              <Input
                id="guestsCount"
                type="number"
                min={1}
                max={20}
                required
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="additionalGuests">{t.guestRegistration.additionalGuests}</Label>
            <Textarea
              id="additionalGuests"
              rows={2}
              placeholder={t.guestRegistration.additionalGuestsPlaceholder}
              value={additionalGuests}
              onChange={(e) => setAdditionalGuests(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="purpose">{t.guestRegistration.purpose}</Label>
            <Input id="purpose" required value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>

          {fieldDefs.map((field) => {
            const label = locale === "en" && field.labelEn ? field.labelEn : field.label;
            const value = customValues[field.fieldKey] ?? "";
            const inputId = `custom-${field.fieldKey}`;

            return (
              <div key={field.id} className="grid gap-1.5">
                {field.fieldType === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={value === "true"}
                      onChange={(e) =>
                        setCustomValues((prev) => ({ ...prev, [field.fieldKey]: e.target.checked ? "true" : "false" }))
                      }
                      className="size-4"
                    />
                    {label}
                    {field.required && " *"}
                  </label>
                ) : (
                  <>
                    <Label htmlFor={inputId}>
                      {label}
                      {field.required && " *"}
                    </Label>
                    {field.fieldType === "textarea" ? (
                      <Textarea
                        id={inputId}
                        rows={2}
                        required={field.required}
                        value={value}
                        onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.fieldKey]: e.target.value }))}
                      />
                    ) : (
                      <Input
                        id={inputId}
                        type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : "text"}
                        required={field.required}
                        value={value}
                        onChange={(e) => setCustomValues((prev) => ({ ...prev, [field.fieldKey]: e.target.value }))}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Honeypot — hidden from real users via CSS, not the accessibility tree. */}
          <div className="hidden" aria-hidden="true">
            <Label htmlFor="company">Companie</Label>
            <Input id="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              required
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className="mt-0.5 size-4 shrink-0"
            />
            {t.guestRegistration.gdprConsent}
          </label>

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t.guestRegistration.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
