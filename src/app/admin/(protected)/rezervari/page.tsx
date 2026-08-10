import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookingActions } from "@/components/admin/booking-actions";
import type { Booking } from "@/types/booking";

export const dynamic = "force-dynamic";

function toBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    checkIn: row.check_in as string,
    checkOut: row.check_out as string,
    guests: row.guests as number,
    message: (row.message as string | null) ?? null,
    status: row.status as Booking["status"],
    paymentStatus: row.payment_status as Booking["paymentStatus"],
    totalAmount: row.total_amount as number | null,
    currency: row.currency as string,
    netopiaOrderId: (row.netopia_order_id as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

const STATUS_LABELS: Record<Booking["status"], string> = {
  pending: "În așteptare",
  confirmed: "Confirmată",
  cancelled: "Anulată",
};

export default async function AdminBookingsPage() {
  let bookings: Booking[] = [];
  let error: unknown = null;

  try {
    const supabase = createAdminClient();
    const res = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    error = res.error;
    bookings = (res.data ?? []).map(toBooking);
  } catch (err) {
    error = err;
  }

  const hasError = Boolean(error);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Cereri de rezervare</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Aprobă sau anulează cererile primite prin site.
      </p>

      {hasError && (
        <p className="mt-4 text-sm text-destructive">
          Nu am putut încărca rezervările — verifică variabilele de mediu Supabase.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {bookings.length === 0 && !hasError && (
          <p className="text-sm text-muted-foreground">Nu există cereri de rezervare încă.</p>
        )}

        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{booking.name}</span>
                  <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.checkIn} → {booking.checkOut} · {booking.guests} oaspeți
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.email} · {booking.phone}
                </p>
                {booking.message && (
                  <p className="mt-1 text-sm text-muted-foreground italic">“{booking.message}”</p>
                )}
              </div>

              <BookingActions bookingId={booking.id} status={booking.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
