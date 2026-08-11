import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomFieldDef, CustomFieldType } from "@/types/guest-registration";

/**
 * Reads the admin-defined extra fields (added from /admin/fise-cazare/campuri)
 * shown alongside the fixed fields on /fisa-cazare and /guest-registration.
 * Returns an empty list (never throws) if Supabase isn't configured or the
 * table doesn't exist yet, so the public forms keep working either way.
 */
export async function getGuestRegistrationFieldDefs(): Promise<CustomFieldDef[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("guest_registration_field_defs")
      .select("*")
      .order("position", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      fieldKey: row.field_key,
      label: row.label,
      labelEn: row.label_en ?? "",
      fieldType: row.field_type as CustomFieldType,
      required: row.required,
      position: row.position,
    }));
  } catch {
    return [];
  }
}
