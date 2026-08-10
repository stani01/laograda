/**
 * Transactional email via Resend. Requires RESEND_API_KEY to be set; every
 * exported function is a no-op (with a console warning) when it isn't, so
 * local development and CI don't need real credentials.
 */
import { Resend } from "resend";
import type { BookingRequestInput, ContactMessageInput } from "@/types/booking";

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY nu este configurată — emailul nu a fost trimis.");
    return null;
  }
  if (!client) client = new Resend(apiKey);
  return client;
}

const FROM = process.env.EMAIL_FROM ?? "La Ograda <onboarding@resend.dev>";
const OWNER_EMAIL = process.env.CONTACT_EMAIL_TO;

export async function sendBookingRequestEmails(
  booking: BookingRequestInput & { id: string }
) {
  const resend = getClient();
  if (!resend) return;

  const summary = `${booking.checkIn} → ${booking.checkOut}, ${booking.guests} persoane`;

  const tasks: Promise<unknown>[] = [];

  if (OWNER_EMAIL) {
    tasks.push(
      resend.emails.send({
        from: FROM,
        to: OWNER_EMAIL,
        replyTo: booking.email,
        subject: `Cerere nouă de rezervare — ${booking.name}`,
        text: [
          `Cerere de rezervare nouă pentru La Ograda (#${booking.id})`,
          "",
          `Perioadă: ${summary}`,
          `Nume: ${booking.name}`,
          `Email: ${booking.email}`,
          `Telefon: ${booking.phone}`,
          booking.message ? `Mesaj: ${booking.message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      })
    );
  }

  tasks.push(
    resend.emails.send({
      from: FROM,
      to: booking.email,
      subject: "Am primit cererea ta de rezervare — La Ograda",
      text: [
        `Bună, ${booking.name}!`,
        "",
        `Am primit cererea ta de rezervare pentru perioada ${summary}.`,
        "Te contactăm în curând pentru confirmare și pentru pasul de plată.",
        "",
        "La Ograda",
      ].join("\n"),
    })
  );

  await Promise.all(tasks);
}

export async function sendContactMessageEmail(input: ContactMessageInput) {
  const resend = getClient();
  if (!resend || !OWNER_EMAIL) return;

  await resend.emails.send({
    from: FROM,
    to: OWNER_EMAIL,
    replyTo: input.email,
    subject: `Mesaj nou de contact — ${input.name}`,
    text: [
      input.message,
      "",
      `De la: ${input.name} (${input.email}${input.phone ? `, ${input.phone}` : ""})`,
    ].join("\n"),
  });
}
