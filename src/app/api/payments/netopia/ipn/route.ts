import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isNetopiaConfigured } from "@/lib/netopia";

/**
 * NETOPIA server-to-server payment notification (IPN) endpoint.
 *
 * NOT production-ready: before going live, verify the authenticity of the
 * request per the NETOPIA v2 docs (https://doc.netopia-payments.com/docs/payment-api/v2.x/intro)
 * — do not trust `payment.status` until that's implemented, otherwise
 * anyone could mark a booking as paid by POSTing here directly.
 *
 * Until that's done, this route only accepts a payload for a booking that
 * WE already put into "processing" (i.e. a real payment was actually
 * started from /api/payments/netopia/initiate) — this doesn't replace
 * proper signature verification, but it stops a random visitor from just
 * POSTing an arbitrary booking id + status:3 here to mark someone else's
 * booking "paid" for free.
 */
export async function POST(request: NextRequest) {
  // Payments aren't live yet (no merchant account) — keep this endpoint
  // inert rather than reachable-but-unverified in the meantime.
  if (!isNetopiaConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);

  if (!payload?.order?.orderID) {
    return NextResponse.json({ error: "Payload invalid" }, { status: 400 });
  }

  // TODO: verify NETOPIA's signature/certificate on `payload` here.

  const bookingId = payload.order.orderID as string;
  const status = payload.payment?.status as number | undefined;

  // NETOPIA status codes: 3 = confirmed/paid, 5 = rejected/closed, 15 = pending 3DS.
  // See "Errors & Statuses" in the v2 docs for the full list.
  const paymentStatus = status === 3 ? "paid" : status === 5 ? "failed" : "processing";

  const supabase = createAdminClient();

  // Only update bookings we ourselves already marked "processing" via
  // /api/payments/netopia/initiate, and only if the orderID matches the one
  // we generated — never trust an IPN payload alone to pick which row to touch.
  const { data, error } = await supabase
    .from("bookings")
    .update({
      payment_status: paymentStatus,
      status: paymentStatus === "paid" ? "confirmed" : undefined,
    })
    .eq("id", bookingId)
    .eq("netopia_order_id", bookingId)
    .eq("payment_status", "processing")
    .select("id");

  if (error) {
    console.error("Nu am putut actualiza rezervarea din IPN NETOPIA:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.warn("IPN NETOPIA ignorat: rezervarea nu era în starea 'processing' sau orderID nu se potrivește.", {
      bookingId,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

