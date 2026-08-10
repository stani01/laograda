"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { ro } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { BusyRange } from "@/types/booking";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Every calendar day covered by any busy range, disabled for selection. */
function useDisabledDays(busy: BusyRange[]) {
  return useMemo(() => {
    const days: Date[] = [];
    for (const range of busy) {
      const cursor = new Date(range.start);
      const end = new Date(range.end);
      while (cursor < end) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return days;
  }, [busy]);
}

export function BookingSection() {
  const [busy, setBusy] = useState<BusyRange[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/availability")
      .then((res) => res.json())
      .then((data: { busy: BusyRange[] }) => {
        if (!cancelled) setBusy(data.busy ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Nu am putut încărca disponibilitatea calendarului.");
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const disabledDays = useDisabledDays(busy);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!range?.from || !range?.to) {
      toast.error("Selectează perioada dorită în calendar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          guests,
          message: message || undefined,
          checkIn: toIsoDate(range.from),
          checkOut: toIsoDate(range.to),
          company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "A apărut o eroare. Încearcă din nou.");
        return;
      }

      toast.success("Cererea de rezervare a fost trimisă! Te contactăm în curând.");
      setRange(undefined);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      toast.error("A apărut o eroare de rețea. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="rezervare" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Verifică disponibilitatea și rezervă
          </h2>
          <p className="mt-3 text-muted-foreground">
            Calendarul este sincronizat automat cu Booking.com și Airbnb —
            datele ocupate sunt blocate mai jos.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center gap-3">
              <Calendar
                mode="range"
                numberOfMonths={1}
                selected={range}
                onSelect={setRange}
                disabled={[{ before: new Date() }, ...disabledDays]}
                locale={ro}
                className="w-full"
              />
              {loadingAvailability && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                  Se încarcă disponibilitatea din Booking & Airbnb...
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Nume complet</Label>
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="guests">Număr persoane (max. 7)</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={7}
                      required
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="message">Mesaj (opțional)</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
                </div>

                {/* Honeypot — hidden from real users via CSS, not the accessibility tree. */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="company">Companie</Label>
                  <Input id="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>

                <p className="text-xs text-muted-foreground">
                  {range?.from && range?.to
                    ? `Perioadă selectată: ${toIsoDate(range.from)} → ${toIsoDate(range.to)}`
                    : "Selectează perioada în calendar înainte de a trimite cererea."}
                </p>

                <Button type="submit" disabled={submitting} className="mt-2">
                  {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  Trimite cererea de rezervare
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
