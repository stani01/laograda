import { NextResponse, type NextRequest } from "next/server";
import { contactMessageSchema } from "@/types/booking";
import { sendContactMessageEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot field — silently "succeed" so bots don't learn anything.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendContactMessageEmail(parsed.data);
  } catch (err) {
    console.error("Nu am putut trimite mesajul de contact:", err);
    return NextResponse.json(
      { error: "A apărut o eroare la trimiterea mesajului. Te rugăm încearcă din nou." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
