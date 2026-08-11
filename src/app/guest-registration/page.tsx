import Link from "next/link";
import { Mountain } from "lucide-react";
import { GuestRegistrationForm } from "@/components/sections/guest-registration-form";
import { getGuestRegistrationFieldDefs } from "@/lib/guest-registration-fields";
import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "Guest Registration Form",
};

// English mirror of src/app/fisa-cazare/page.tsx — same form/fields, just
// with English copy. Separate URL (not a query param) so it's a clean,
// shareable link for foreign guests.
export default async function EnglishGuestRegistrationPage() {
  const fieldDefs = await getGuestRegistrationFieldDefs();
  const t = getDictionary("en");

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/en" className="flex items-center gap-2 font-script text-2xl">
          <Mountain className="size-5 text-primary" aria-hidden />
          LaOgrada
        </Link>
        <Link href="/fisa-cazare" className="text-sm opacity-60 transition-opacity hover:opacity-100">
          🇷🇴 Română
        </Link>
      </div>

      <h1 className="mt-8 text-center font-heading text-2xl font-semibold">{t.guestRegistration.pageTitle}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">{t.guestRegistration.pageSubtitle}</p>

      <div className="mt-8">
        <GuestRegistrationForm locale="en" fieldDefs={fieldDefs} />
      </div>
    </div>
  );
}
