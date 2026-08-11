/**
 * Public-ish outbound iCal feed. Makes this site the sync "hub": it exports
 * BOTH our own bookings table (site + WhatsApp bookings the owners enter
 * manually via /admin) AND everything we've already pulled in from
 * Booking.com / Airbnb / Travelminit / the shared iCloud calendar (see
 * getBusyRanges() in src/lib/ical.ts). That means each platform only needs
 * to import this ONE link to end up seeing every other platform's busy
 * dates too — they don't need to individually import each other's feeds.
 *
 * Optional `?exclude=booking,icloud` query param drops one or more sources
 * from the export — handy so e.g. Booking.com's own import URL doesn't
 * reflect its own bookings back at it (harmless either way, just tidier).
 * Valid values: booking, airbnb, travelminit, icloud.
 *
 * Guarded by a shared-secret query param (?token=...) instead of Supabase
 * auth, because the platforms fetch this URL unauthenticated on their own
 * schedule — same trust model as the private "export calendar" URLs they
 * give us. No guest PII (name/email/phone) is included, only date ranges.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusyRanges } from "@/lib/ical";
import type { BusySource } from "@/types/booking";

const SOURCE_LABELS: Record<BusySource, string> = {
  booking: "Booking.com",
  airbnb: "Airbnb",
  travelminit: "Travelminit",
  icloud: "iCloud",
};

function toIcsDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.ICAL_EXPORT_SECRET?.trim();
  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (!expectedToken || !token || token !== expectedToken) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const excluded = new Set(
    (request.nextUrl.searchParams.get("exclude") ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );

  let events = "";

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("id, check_in, check_out, status")
      .neq("status", "cancelled")
      .order("check_in", { ascending: true });

    if (error) throw error;

    const dtstamp = `${new Date().toISOString().slice(0, 19).replace(/[-:]/g, "")}Z`;

    const siteEvents = (data ?? []).map((row) => {
      const summary = escapeIcsText(
        row.status === "pending" ? "Ocupat (în așteptare) — La Ograda" : "Ocupat — La Ograda"
      );

      return [
        "BEGIN:VEVENT",
        `UID:${row.id}@laograda.ro`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${toIcsDate(row.check_in as string)}`,
        `DTEND;VALUE=DATE:${toIcsDate(row.check_out as string)}`,
        `SUMMARY:${summary}`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const { ranges: externalRanges } = await getBusyRanges();

    const externalEvents = externalRanges
      .filter((range) => !excluded.has(range.source))
      .map((range) => {
        const summary = escapeIcsText(`Ocupat — ${SOURCE_LABELS[range.source] ?? range.source}`);

        return [
          "BEGIN:VEVENT",
          `UID:ext-${range.source}-${range.start}-${range.end}@laograda.ro`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART;VALUE=DATE:${toIcsDate(range.start)}`,
          `DTEND;VALUE=DATE:${toIcsDate(range.end)}`,
          `SUMMARY:${summary}`,
          "END:VEVENT",
        ].join("\r\n");
      });

    events = [...siteEvents, ...externalEvents].join("\r\n");
  } catch (err) {
    console.error("Nu am putut genera fluxul iCal de ieșire:", err);
    return NextResponse.json({ error: "Eroare la citirea rezervărilor" }, { status: 500 });
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Ograda//Booking Sync//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:La Ograda — rezervări site",
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=laograda-bookings.ics",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
