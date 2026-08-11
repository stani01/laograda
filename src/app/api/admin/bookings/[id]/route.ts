import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-audit";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: user.email ?? "necunoscut",
    action: "booking.status_update",
    entityType: "booking",
    entityId: id,
    details: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}
