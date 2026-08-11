"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function GuestRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState<"CI" | "pasaport">("CI");
  const [documentSeries, setDocumentSeries] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("Română");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [additionalGuests, setAdditionalGuests] = useState("");
  const [purpose, setPurpose] = useState("Turism");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!gdprConsent) {
      toast.error("Trebuie să fii de acord cu prelucrarea datelor pentru a continua.");
      return;
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
          company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "A apărut o eroare. Încearcă din nou.");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("A apărut o eroare de rețea. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <h2 className="font-heading text-xl font-semibold">Mulțumim!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fișa de cazare a fost înregistrată. Ne vedem în curând!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="fullName">Nume și prenume</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="documentType">Tip act</Label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as "CI" | "pasaport")}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
              >
                <option value="CI">Carte de identitate</option>
                <option value="pasaport">Pașaport</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="documentSeries">Serie (dacă e cazul)</Label>
              <Input id="documentSeries" value={documentSeries} onChange={(e) => setDocumentSeries(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="documentNumber">Număr act</Label>
              <Input id="documentNumber" required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="nationality">Naționalitate</Label>
              <Input id="nationality" required value={nationality} onChange={(e) => setNationality(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="birthDate">Data nașterii (opțional)</Label>
              <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="address">Adresă domiciliu</Label>
            <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email (opțional)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="checkIn">Data sosirii</Label>
              <Input id="checkIn" type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="checkOut">Data plecării</Label>
              <Input id="checkOut" type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="guestsCount">Număr persoane</Label>
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
            <Label htmlFor="additionalGuests">Alte persoane cazate împreună cu tine (opțional)</Label>
            <Textarea
              id="additionalGuests"
              rows={2}
              placeholder="Nume și prenume, câte unul pe linie"
              value={additionalGuests}
              onChange={(e) => setAdditionalGuests(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="purpose">Scopul călătoriei</Label>
            <Input id="purpose" required value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>

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
            Sunt de acord ca datele de mai sus să fie prelucrate și păstrate de La Ograda exclusiv în scopul
            înregistrării cazării, conform legislației aplicabile.
          </label>

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Trimite fișa de cazare
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
