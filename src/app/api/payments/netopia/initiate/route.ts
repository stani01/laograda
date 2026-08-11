import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isNetopiaConfigured, startNetopiaPayment } from "@/lib/netopia";
import { createAdminClient } from "@/lib/supabase/admin";

const initiateSchema = z.object({
  bookingId: z.uuid(),
});

/**
 * Kicks off a NETOPIA card payment for an existing booking. Disabled until
 * the owners have a merchant account + a .ro domain — returns 503 with a
 * clear message instead of a confusing crash.
 */
export async function POST(request: NextRequest) {
  if (!isNetopiaConfigured()) {
    return NextResponse.json(
      {
        error:
          "Plățile online nu sunt încă activate. Configurează NETOPIA_API_KEY și NETOPIA_POS_SIGNATURE.",
      },
      { status: 503 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = initiateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", parsed.data.bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Rezervarea nu a fost găsită" }, { status: 404 });
  }

  if (!booking.total_amount) {
    return NextResponse.json(
      { error: "Rezervarea nu are încă o sumă de plată stabilită." },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  try {
    const result = await startNetopiaPayment({
      orderId: booking.id,
      amount: booking.total_amount,
      currency: booking.currency ?? "RON",
      description: `Rezervare LaOgrada (${booking.check_in} → ${booking.check_out})`,
      billing: {
        email: booking.email,
        phone: booking.phone,
        firstName: booking.name.split(" ")[0] ?? booking.name,
        lastName: booking.name.split(" ").slice(1).join(" ") || booking.name,
      },
      redirectUrl: `${siteUrl}/rezervare/${booking.id}/multumim`,
      notifyUrl: `${siteUrl}/api/payments/netopia/ipn`,
    });

    await supabase
      .from("bookings")
      .update({ payment_status: "processing", netopia_order_id: booking.id })
      .eq("id", booking.id);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Eroare la inițierea plății NETOPIA:", err);
    return NextResponse.json({ error: "Inițierea plății a eșuat." }, { status: 502 });
  }
}
