"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import type { BookingStatus } from "@/types/booking";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function updateStatus(nextStatus: BookingStatus) {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        toast.error("Nu am putut actualiza rezervarea.");
        return;
      }

      toast.success("Rezervare actualizată.");
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status !== "confirmed" && (
        <Button size="sm" disabled={pending} onClick={() => updateStatus("confirmed")}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
          Confirmă
        </Button>
      )}
      {status !== "cancelled" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => updateStatus("cancelled")}>
          <X className="size-4" aria-hidden />
          Anulează
        </Button>
      )}
    </div>
  );
}
