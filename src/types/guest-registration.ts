import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de dată invalid (AAAA-LL-ZZ)");

export const CUSTOM_FIELD_TYPES = ["text", "textarea", "number", "date", "checkbox"] as const;
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

/** One admin-defined extra field shown on the public /fisa-cazare & /guest-registration forms. */
export interface CustomFieldDef {
  id: string;
  fieldKey: string;
  label: string;
  labelEn: string;
  fieldType: CustomFieldType;
  required: boolean;
  position: number;
}

/** One answered custom field, snapshotted with its label at submission time
 * so admin can still read it correctly even if the field def changes later. */
const customFieldValueSchema = z.object({
  key: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(150),
  value: z.string().trim().max(1000),
});

export type CustomFieldValue = z.infer<typeof customFieldValueSchema>;

/**
 * Keys of the fixed/built-in fields on the guest registration form. Their
 * input type and length limits are structural (baked into the DB columns &
 * this schema) and NOT admin-editable, but the label text and whether each
 * one is required CAN be customized from /admin/fise-cazare/campuri — see
 * StandardFieldConfig below. documentType/checkIn/checkOut/guestsCount are
 * excluded here because they're always required (core to the form's
 * purpose), so there's nothing useful to toggle for them.
 */
export const STANDARD_FIELD_KEYS = [
  "fullName",
  "documentSeries",
  "documentNumber",
  "nationality",
  "birthDate",
  "address",
  "phone",
  "email",
  "additionalGuests",
  "purpose",
] as const;
export type StandardFieldKey = (typeof STANDARD_FIELD_KEYS)[number];

/** Structural info (never admin-editable) shown as read-only reference next to each standard field. */
export const STANDARD_FIELD_META: Record<StandardFieldKey, { inputType: string; limits: string }> = {
  fullName: { inputType: "Text", limits: "2–150 caractere" },
  documentSeries: { inputType: "Text", limits: "max. 20 caractere" },
  documentNumber: { inputType: "Text", limits: "2–30 caractere" },
  nationality: { inputType: "Text", limits: "2–60 caractere" },
  birthDate: { inputType: "Dată", limits: "—" },
  address: { inputType: "Text", limits: "5–300 caractere" },
  phone: { inputType: "Telefon", limits: "6–20 caractere" },
  email: { inputType: "Email", limits: "—" },
  additionalGuests: { inputType: "Text lung", limits: "max. 500 caractere" },
  purpose: { inputType: "Text", limits: "2–100 caractere" },
};

/** Default label + required-ness, matching the original hardcoded behaviour — used to seed the DB and as a fallback. */
export const DEFAULT_STANDARD_FIELDS: Record<StandardFieldKey, { label: string; labelEn: string; required: boolean }> = {
  fullName: { label: "Nume și prenume", labelEn: "Full name", required: true },
  documentSeries: { label: "Serie (dacă e cazul)", labelEn: "Series (if applicable)", required: false },
  documentNumber: { label: "Număr act", labelEn: "Document number", required: true },
  nationality: { label: "Naționalitate", labelEn: "Nationality", required: true },
  birthDate: { label: "Data nașterii (opțional)", labelEn: "Date of birth (optional)", required: false },
  address: { label: "Adresă domiciliu", labelEn: "Home address", required: true },
  phone: { label: "Telefon", labelEn: "Phone", required: true },
  email: { label: "Email (opțional)", labelEn: "Email (optional)", required: false },
  additionalGuests: {
    label: "Alte persoane cazate împreună cu tine (opțional)",
    labelEn: "Other guests staying with you (optional)",
    required: false,
  },
  purpose: { label: "Scopul călătoriei", labelEn: "Purpose of travel", required: true },
};

export interface StandardFieldConfig {
  key: StandardFieldKey;
  label: string;
  labelEn: string;
  required: boolean;
}

export const guestRegistrationSchema = z
  .object({
    fullName: z.string().trim().max(150),
    documentType: z.enum(["CI", "pasaport"]),
    documentSeries: z.string().trim().max(20).optional(),
    documentNumber: z.string().trim().max(30),
    nationality: z.string().trim().max(60),
    birthDate: z.string().trim().max(10).optional(),
    address: z.string().trim().max(300),
    phone: z.string().trim().max(20),
    email: z.email("Adresă de email invalidă").optional().or(z.literal("")),
    checkIn: isoDate,
    checkOut: isoDate,
    guestsCount: z.coerce.number().int().min(1).max(20),
    additionalGuests: z.string().trim().max(500).optional(),
    purpose: z.string().trim().max(100),
    gdprConsent: z.literal(true, "Trebuie să fii de acord cu prelucrarea datelor pentru a continua"),
    locale: z.enum(["ro", "en"]).default("ro"),
    customFields: z.array(customFieldValueSchema).max(30).optional(),
    // Honeypot field: real users never fill this in, bots often do.
    company: z.string().max(0).optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Data de plecare trebuie să fie după data de sosire",
    path: ["checkOut"],
  });

export type GuestRegistrationInput = z.infer<typeof guestRegistrationSchema>;

export interface GuestRegistrationForm {
  id: string;
  fullName: string;
  documentType: "CI" | "pasaport";
  documentSeries: string | null;
  documentNumber: string;
  nationality: string;
  birthDate: string | null;
  address: string;
  phone: string;
  email: string | null;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  additionalGuests: string | null;
  purpose: string;
  gdprConsent: boolean;
  locale: "ro" | "en";
  customFields: CustomFieldValue[];
  createdAt: string;
}
