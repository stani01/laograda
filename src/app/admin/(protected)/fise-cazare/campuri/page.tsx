import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGuestRegistrationFieldDefs } from "@/lib/guest-registration-fields";
import { getGuestRegistrationStandardFields } from "@/lib/guest-registration-standard-fields";
import { GuestRegistrationFieldsForm } from "@/components/admin/guest-registration-fields-form";
import { GuestRegistrationStandardFieldsForm } from "@/components/admin/guest-registration-standard-fields-form";

export const dynamic = "force-dynamic";

export default async function AdminGuestRegistrationFieldsPage() {
  const [fields, standardFields] = await Promise.all([
    getGuestRegistrationFieldDefs(),
    getGuestRegistrationStandardFields(),
  ]);

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
        Editează etichetele și dacă sunt obligatorii pentru câmpurile standard, sau adaugă
        câmpuri suplimentare noi. Ambele apar pe formularele publice /fisa-cazare și
        /guest-registration.
      </p>

      <h2 className="mt-8 font-heading text-lg font-semibold">Câmpuri standard</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tipul și limitele fiecărui câmp sunt fixe (nu pot fi schimbate), dar poți edita eticheta
        și dacă e obligatoriu.
      </p>
      <div className="mt-4">
        <GuestRegistrationStandardFieldsForm initialFields={standardFields} />
      </div>

      <h2 className="mt-10 font-heading text-lg font-semibold">Câmpuri suplimentare</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Adaugă câmpuri suplimentare (pe lângă cele standard), cu tipul lor propriu.
      </p>
      <div className="mt-4">
        <GuestRegistrationFieldsForm initialFields={fields} />
      </div>
    </div>
  );
}
