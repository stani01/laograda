import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default function AdminAccountPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Contul meu</h1>
      <p className="mt-1 text-sm text-muted-foreground">Schimbă parola contului de admin.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Schimbă parola</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
