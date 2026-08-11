import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de dată invalid (AAAA-LL-ZZ)");

export const bookingRequestSchema = z
  .object({
    name: z.string().trim().min(2, "Numele este prea scurt").max(100),
    email: z.email("Adresă de email invalidă"),
    phone: z
      .string()
      .trim()
      .min(6, "Număr de telefon invalid")
      .max(20, "Număr de telefon invalid"),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().min(1).max(7),
    message: z.string().trim().max(1000).optional(),
    // Honeypot field: real users never fill this in, bots often do.
    company: z.string().max(0).optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Data de check-out trebuie să fie după data de check-in",
    path: ["checkOut"],
  });

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Numele este prea scurt").max(100),
  email: z.email("Adresă de email invalidă"),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(5, "Mesajul este prea scurt").max(2000),
  company: z.string().max(0).optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export type BusySource = "booking" | "airbnb" | "travelminit" | "icloud";

export interface BusyRange {
  /** Inclusive ISO date (YYYY-MM-DD) when the stay starts. */
  start: string;
  /** Exclusive ISO date (YYYY-MM-DD) when the stay ends (checkout day, usually still bookable for arrival). */
  end: string;
  source: BusySource;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "processing" | "paid" | "failed" | "refunded";

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number | null;
  currency: string;
  netopiaOrderId: string | null;
  createdAt: string;
}
