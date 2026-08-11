/**
 * Writes a row to `admin_audit_log` whenever an admin mutates something
 * (content edits, gallery uploads/deletes/reorders, booking status changes),
 * so /admin/jurnal can show who did what and when.
 *
 * Deliberately swallows errors: a failed audit-log write should never break
 * the actual admin action it's describing — same graceful-degradation
 * pattern used everywhere else in this app when Supabase isn't reachable.
 */
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminAuditAction =
  | "content.update"
  | "gallery.upload"
  | "gallery.delete"
  | "gallery.reorder"
  | "booking.status_update"
  | "guest_registration_fields.update"
  | "guest_registration_standard_fields.update"
  | "guest_registration.update";

export interface AdminAuditEntry {
  id: string;
  actorEmail: string;
  action: AdminAuditAction | string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export async function logAdminAction(params: {
  actorEmail: string;
  action: AdminAuditAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("admin_audit_log").insert({
      actor_email: params.actorEmail,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      details: params.details ?? null,
    });
  } catch (err) {
    console.error("Nu am putut scrie în jurnalul de audit:", err);
  }
}

/** Reads the most recent audit log entries for the /admin/jurnal page. */
export async function getRecentAuditLog(limit = 200): Promise<AdminAuditEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details,
    createdAt: row.created_at,
  }));
}
