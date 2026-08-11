import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_STANDARD_FIELDS,
  STANDARD_FIELD_KEYS,
  type StandardFieldConfig,
  type StandardFieldKey,
} from "@/types/guest-registration";

/**
 * Reads the admin-editable label/required overrides for the fixed/standard
 * fields on the guest registration form (set from /admin/fise-cazare/campuri).
 * Always returns all STANDARD_FIELD_KEYS in a fixed order, falling back to
 * DEFAULT_STANDARD_FIELDS for any key missing from the DB (including when
 * Supabase isn't configured yet or the table doesn't exist) — public forms
 * keep working either way.
 */
export async function getGuestRegistrationStandardFields(): Promise<StandardFieldConfig[]> {
  const overrides = new Map<StandardFieldKey, { label: string; labelEn: string; required: boolean }>();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("guest_registration_standard_fields").select("*");

    if (error) throw error;

    for (const row of data ?? []) {
      overrides.set(row.key as StandardFieldKey, {
        label: row.label,
        labelEn: row.label_en ?? "",
        required: row.required,
      });
    }
  } catch {
    // Fall through to defaults below.
  }

  return STANDARD_FIELD_KEYS.map((key) => {
    const override = overrides.get(key);
    const fallback = DEFAULT_STANDARD_FIELDS[key];
    return {
      key,
      label: override?.label || fallback.label,
      labelEn: override?.labelEn || fallback.labelEn,
      required: override?.required ?? fallback.required,
    };
  });
}
