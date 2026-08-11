import Link from "next/link";
import { Mountain } from "lucide-react";
import { GuestRegistrationForm } from "@/components/sections/guest-registration-form";
import { getGuestRegistrationFieldDefs } from "@/lib/guest-registration-fields";
import { getGuestRegistrationStandardFields } from "@/lib/guest-registration-standard-fields";
import { getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "Fișă de cazare",
};

export default async function GuestRegistrationPage() {
  const [fieldDefs, standardFields] = await Promise.all([
    getGuestRegistrationFieldDefs(),
    getGuestRegistrationStandardFields(),
  ]);
  const t = getDictionary("ro");

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-script text-2xl">
          <Mountain className="size-5 text-primary" aria-hidden />
          LaOgrada
        </Link>
        <Link href="/guest-registration" className="text-sm opacity-60 transition-opacity hover:opacity-100">
          🇬🇧 English
        </Link>
      </div>

      <h1 className="mt-8 text-center font-heading text-2xl font-semibold">{t.guestRegistration.pageTitle}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">{t.guestRegistration.pageSubtitle}</p>

      <div className="mt-8">
        <GuestRegistrationForm locale="ro" fieldDefs={fieldDefs} standardFields={standardFields} />
      </div>
    </div>
  );
}
