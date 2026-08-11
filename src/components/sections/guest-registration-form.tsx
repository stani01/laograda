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
import type { CustomFieldDef, StandardFieldConfig } from "@/types/guest-registration";

export function GuestRegistrationForm({
  locale,
  fieldDefs,
  standardFields,
}: {
  locale: Locale;
  fieldDefs: CustomFieldDef[];
  standardFields: StandardFieldConfig[];
}) {
  const t = getDictionary(locale);
  const stdLabel = (key: StandardFieldConfig["key"]) => {
    const field = standardFields.find((f) => f.key === key)!;
    return locale === "en" && field.labelEn ? field.labelEn : field.label;
  };
  const stdRequired = (key: StandardFieldConfig["key"]) => standardFields.find((f) => f.key === key)!.required;
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

    const stdValues: Record<StandardFieldConfig["key"], string> = {
      fullName,
      documentSeries,
      documentNumber,
      nationality,
      birthDate,
      address,
      phone,
      email,
      additionalGuests,
      purpose,
    };

    for (const field of standardFields) {
      if (field.required && !stdValues[field.key].trim()) {
        toast.error(stdLabel(field.key));
        return;
      }
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
            <Label htmlFor="fullName">
              {stdLabel("fullName")}
              {stdRequired("fullName") && " *"}
            </Label>
            <Input id="fullName" required={stdRequired("fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
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
              <Label htmlFor="documentSeries">
                {stdLabel("documentSeries")}
                {stdRequired("documentSeries") && " *"}
              </Label>
              <Input
                id="documentSeries"
                required={stdRequired("documentSeries")}
                value={documentSeries}
                onChange={(e) => setDocumentSeries(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="documentNumber">
                {stdLabel("documentNumber")}
                {stdRequired("documentNumber") && " *"}
              </Label>
              <Input
                id="documentNumber"
                required={stdRequired("documentNumber")}
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="nationality">
                {stdLabel("nationality")}
                {stdRequired("nationality") && " *"}
              </Label>
              <Input
                id="nationality"
                required={stdRequired("nationality")}
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="birthDate">
                {stdLabel("birthDate")}
                {stdRequired("birthDate") && " *"}
              </Label>
              <Input
                id="birthDate"
                type="date"
                required={stdRequired("birthDate")}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="address">
              {stdLabel("address")}
              {stdRequired("address") && " *"}
            </Label>
            <Input id="address" required={stdRequired("address")} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">
                {stdLabel("phone")}
                {stdRequired("phone") && " *"}
              </Label>
              <Input id="phone" type="tel" required={stdRequired("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">
                {stdLabel("email")}
                {stdRequired("email") && " *"}
              </Label>
              <Input
                id="email"
                type="email"
                required={stdRequired("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
            <Label htmlFor="additionalGuests">
              {stdLabel("additionalGuests")}
              {stdRequired("additionalGuests") && " *"}
            </Label>
            <Textarea
              id="additionalGuests"
              rows={2}
              required={stdRequired("additionalGuests")}
              placeholder={t.guestRegistration.additionalGuestsPlaceholder}
              value={additionalGuests}
              onChange={(e) => setAdditionalGuests(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="purpose">
              {stdLabel("purpose")}
              {stdRequired("purpose") && " *"}
            </Label>
            <Input id="purpose" required={stdRequired("purpose")} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
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
