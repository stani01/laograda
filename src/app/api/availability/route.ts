import { NextResponse } from "next/server";
import { getBusyRanges } from "@/lib/ical";

// Route Handlers opt out of caching by default in Next.js — this keeps a
// shared cache for 30 minutes so we don't hammer Booking.com/Airbnb on
// every page view.
export const revalidate = 1800;

export async function GET() {
  const { ranges, errors } = await getBusyRanges();

  return NextResponse.json(
    { busy: ranges, errors },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}
