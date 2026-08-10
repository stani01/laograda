import { NextResponse, type NextRequest } from "next/server";
import { bookingRequestSchema } from "@/types/booking";
import { getBusyRanges } from "@/lib/ical";
import { sendBookingRequestEmails } from "@/lib/resend";
import { createAdminClient } from "@/lib/supabase/admin";

/** Do two [start, end) date ranges (as ISO strings) overlap? */
function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot: bots fill every field, real visitors never see/fill `company`.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, checkIn, checkOut, guests, message } = parsed.data;

  const { ranges } = await getBusyRanges();
  const isBusy = ranges.some((range) =>
    rangesOverlap(checkIn, checkOut, range.start, range.end)
  );

  if (isBusy) {
    return NextResponse.json(
      { error: "Perioada selectată nu mai este disponibilă. Te rugăm alege alte date." },
      { status: 409 }
    );
  }

  let bookingId: string;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        name,
        email,
        phone,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        message: message ?? null,
        status: "pending",
        payment_status: "unpaid",
      })
      .select("id")
      .single();

    if (error) throw error;
    bookingId = data.id as string;
  } catch (err) {
    console.error("Nu am putut salva cererea de rezervare în Supabase:", err);
    return NextResponse.json(
      { error: "A apărut o eroare la salvarea cererii. Te rugăm încearcă din nou." },
      { status: 500 }
    );
  }

  try {
    await sendBookingRequestEmails({ ...parsed.data, id: bookingId });
  } catch (err) {
    // The booking is already saved — a failed email shouldn't fail the request.
    console.error("Nu am putut trimite emailurile de confirmare a rezervării:", err);
  }

  return NextResponse.json({ ok: true, bookingId }, { status: 201 });
}
