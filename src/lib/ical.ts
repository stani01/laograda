/**
 * Merges busy-date ranges from the Booking.com, Airbnb, Travelminit and
 * shared-iCloud iCal feeds so the booking calendar always reflects
 * reservations made anywhere — including WhatsApp bookings the owners log
 * only in their shared iCloud calendar, not through this site. Each host
 * adds their private "Sync Calendar" export URL to the BOOKING_ICAL_URL /
 * AIRBNB_ICAL_URL / TRAVELMINIT_ICAL_URL / ICLOUD_ICAL_URL environment
 * variables. iCloud's "Public Calendar" share link starts with `webcal://`
 * — swap that prefix for `https://` before putting it in ICLOUD_ICAL_URL.
 */
import ical from "node-ical";
import type { BusyRange, BusySource } from "@/types/booking";

async function fetchIcs(url: string): Promise<string> {
  const res = await fetch(url, {
    // Both platforms rate-limit aggressive polling — cache for 30 minutes.
    next: { revalidate: 60 * 30 },
    headers: { "User-Agent": "laograda-cabin-website/1.0" },
  });

  if (!res.ok) {
    throw new Error(`Descărcarea calendarului a eșuat (${res.status})`);
  }

  return res.text();
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function extractRanges(icsText: string, source: BusySource): BusyRange[] {
  const parsed = ical.sync.parseICS(icsText);
  const ranges: BusyRange[] = [];

  for (const key of Object.keys(parsed)) {
    const item = parsed[key];
    if (!item || item.type !== "VEVENT") continue;
    if (!item.start || !item.end) continue;

    ranges.push({
      start: toIsoDate(new Date(item.start)),
      end: toIsoDate(new Date(item.end)),
      source,
    });
  }

  return ranges;
}

export interface BusyRangesResult {
  ranges: BusyRange[];
  errors: string[];
}

/**
 * Fetches and merges busy ranges from every configured platform. Missing
 * env vars are silently skipped (so the site still works before the owners
 * have connected both calendars); fetch/parse failures are collected in
 * `errors` instead of throwing, so one broken feed doesn't break the other.
 */
export async function getBusyRanges(): Promise<BusyRangesResult> {
  const sources: { url?: string; source: BusySource }[] = [
    { url: process.env.BOOKING_ICAL_URL, source: "booking" },
    { url: process.env.AIRBNB_ICAL_URL, source: "airbnb" },
    { url: process.env.TRAVELMINIT_ICAL_URL, source: "travelminit" },
    { url: process.env.ICLOUD_ICAL_URL, source: "icloud" },
  ];

  const ranges: BusyRange[] = [];
  const errors: string[] = [];

  await Promise.all(
    sources.map(async ({ url, source }) => {
      if (!url) return;
      try {
        const text = await fetchIcs(url);
        ranges.push(...extractRanges(text, source));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Eroare necunoscută";
        errors.push(`${source}: ${message}`);
      }
    })
  );

  ranges.sort((a, b) => a.start.localeCompare(b.start));
  return { ranges, errors };
}
