import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGuestRegistrationFieldDefs } from "@/lib/guest-registration-fields";
import { GuestRegistrationFieldsForm } from "@/components/admin/guest-registration-fields-form";

export const dynamic = "force-dynamic";

export default async function AdminGuestRegistrationFieldsPage() {
  const fields = await getGuestRegistrationFieldDefs();

  return (
    <div>
      <Link
        href="/admin/fise-cazare"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Înapoi la fișe de cazare
      </Link>

      <h1 className="mt-3 font-heading text-2xl font-semibold">Câmpuri fișă de cazare</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Adaugă câmpuri suplimentare (pe lângă cele standard) afișate pe formularele publice
        /fisa-cazare și /guest-registration.
      </p>

      <div className="mt-6">
        <GuestRegistrationFieldsForm initialFields={fields} />
      </div>
    </div>
  );
}
