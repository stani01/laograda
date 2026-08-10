import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * NETOPIA server-to-server payment notification (IPN) endpoint.
 *
 * NOT production-ready: before going live, verify the authenticity of the
 * request per the NETOPIA v2 docs (https://doc.netopia-payments.com/docs/payment-api/v2.x/intro)
 * — do not trust `payment.status` until that's implemented, otherwise
 * anyone could mark a booking as paid by POSTing here directly.
 */
export async function POST(request: NextRequest) {
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
  const { error } = await supabase
    .from("bookings")
    .update({
      payment_status: paymentStatus,
      status: paymentStatus === "paid" ? "confirmed" : undefined,
    })
    .eq("id", bookingId);

  if (error) {
    console.error("Nu am putut actualiza rezervarea din IPN NETOPIA:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
