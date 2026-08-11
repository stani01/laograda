import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getRecentAuditLog, type AdminAuditEntry } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "content.update": "Conținut actualizat",
  "gallery.upload": "Poze încărcate",
  "gallery.delete": "Poză ștearsă",
  "gallery.reorder": "Ordine poze schimbată",
  "booking.status_update": "Status rezervare schimbat",
};

function formatDetails(entry: AdminAuditEntry): string | null {
  const details = entry.details;
  if (!details) return null;

  switch (entry.action) {
    case "booking.status_update":
      return typeof details.status === "string" ? `Status nou: ${details.status}` : null;
    case "gallery.upload":
      return typeof details.count === "number" ? `${details.count} poză(e) încărcată(e)` : null;
    case "gallery.reorder":
      return typeof details.count === "number" ? `${details.count} poză(e) reordonată(e)` : null;
    case "content.update":
      return typeof details.amenitiesCount === "number"
        ? `${details.amenitiesCount} facilități salvate`
        : null;
    default:
      return null;
  }
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminAuditLogPage() {
  let entries: AdminAuditEntry[] = [];
  let error: unknown = null;

  try {
    entries = await getRecentAuditLog();
  } catch (err) {
    error = err;
  }

  const hasError = Boolean(error);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Jurnal de activitate</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cine a modificat ce și când — rezervări, conținut și galerie foto.
      </p>

      {hasError && (
        <p className="mt-4 text-sm text-destructive">
          Nu am putut încărca jurnalul — verifică variabilele de mediu Supabase și că tabela
          `admin_audit_log` există (rulează supabase/schema.sql).
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {entries.length === 0 && !hasError && (
          <p className="text-sm text-muted-foreground">Nu există încă nicio înregistrare în jurnal.</p>
        )}

        {entries.map((entry) => {
          const details = formatDetails(entry);

          return (
            <Card key={entry.id}>
              <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{ACTION_LABELS[entry.action] ?? entry.action}</Badge>
                    <span className="text-sm font-medium">{entry.actorEmail}</span>
                  </div>
                  {details && <p className="mt-1 text-sm text-muted-foreground">{details}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{formatTimestamp(entry.createdAt)}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
