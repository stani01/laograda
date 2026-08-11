import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de dată invalid (AAAA-LL-ZZ)");

export const guestRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Numele este prea scurt").max(150),
    documentType: z.enum(["CI", "pasaport"]),
    documentSeries: z.string().trim().max(20).optional(),
    documentNumber: z.string().trim().min(2, "Număr act invalid").max(30),
    nationality: z.string().trim().min(2, "Naționalitate invalidă").max(60),
    birthDate: z.string().trim().max(10).optional(),
    address: z.string().trim().min(5, "Adresa este prea scurtă").max(300),
    phone: z.string().trim().min(6, "Număr de telefon invalid").max(20),
    email: z.email("Adresă de email invalidă").optional().or(z.literal("")),
    checkIn: isoDate,
    checkOut: isoDate,
    guestsCount: z.coerce.number().int().min(1).max(20),
    additionalGuests: z.string().trim().max(500).optional(),
    purpose: z.string().trim().min(2).max(100),
    gdprConsent: z.literal(true, "Trebuie să fii de acord cu prelucrarea datelor pentru a continua"),
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
  createdAt: string;
}
