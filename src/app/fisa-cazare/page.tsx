import Link from "next/link";
import { Mountain } from "lucide-react";
import { GuestRegistrationForm } from "@/components/sections/guest-registration-form";

export const metadata = {
  title: "Fișă de cazare",
};

export default function GuestRegistrationPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-10 sm:px-6">
      <Link href="/" className="flex items-center gap-2 self-center font-script text-2xl">
        <Mountain className="size-5 text-primary" aria-hidden />
        La Ograda
      </Link>

      <h1 className="mt-8 text-center font-heading text-2xl font-semibold">Fișă de cazare</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Te rugăm completează fișa de mai jos înainte de sosire. Durează mai puțin de un minut.
      </p>

      <div className="mt-8">
        <GuestRegistrationForm />
      </div>
    </div>
  );
}
