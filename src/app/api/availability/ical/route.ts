/**
 * Public-ish outbound iCal feed: exposes busy dates from *our own* bookings
 * table (site + WhatsApp bookings the owners enter manually via /admin) so
 * Booking.com, Airbnb and Travelminit can import it as an external calendar
 * ("Connect to another website" / "Import calendar"). This is the mirror of
 * src/lib/ical.ts, which reads *their* export feeds into our availability
 * check.
 *
 * Guarded by a shared-secret query param (?token=...) instead of Supabase
 * auth, because the platforms fetch this URL unauthenticated on their own
 * schedule — same trust model as the private "export calendar" URLs they
 * give us. No guest PII (name/email/phone) is included, only date ranges.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function toIcsDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.ICAL_EXPORT_SECRET;
  const token = request.nextUrl.searchParams.get("token");

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

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

    events = (data ?? [])
      .map((row) => {
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
      })
      .join("\r\n");
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
