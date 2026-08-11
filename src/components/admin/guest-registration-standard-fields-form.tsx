"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { STANDARD_FIELD_META, type StandardFieldConfig } from "@/types/guest-registration";

export function GuestRegistrationStandardFieldsForm({ initialFields }: { initialFields: StandardFieldConfig[] }) {
  const router = useRouter();
  const [fields, setFields] = useState<StandardFieldConfig[]>(initialFields);
  const [submitting, setSubmitting] = useState(false);

  function updateField(key: StandardFieldConfig["key"], patch: Partial<StandardFieldConfig>) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleaned = fields.map((f) => ({ ...f, label: f.label.trim() || initialFields.find((i) => i.key === f.key)!.label }));

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/guest-registration-standard-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: cleaned }),
      });

      if (!res.ok) {
        toast.error("Nu am putut salva câmpurile standard.");
        return;
      }

      toast.success("Câmpurile standard au fost salvate.");
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map((field) => {
        const meta = STANDARD_FIELD_META[field.key];
        return (
          <Card key={field.key}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono">{field.key}</span>
                <span>{meta.inputType}</span>
                <span>·</span>
                <span>{meta.limits}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Etichetă (română)</Label>
                  <Input value={field.label} onChange={(e) => updateField(field.key, { label: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Etichetă (engleză)</Label>
                  <Input value={field.labelEn} onChange={(e) => updateField(field.key, { labelEn: e.target.value })} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.key, { required: e.target.checked })}
                  className="size-4"
                />
                Obligatoriu
              </label>
            </CardContent>
          </Card>
        );
      })}

      <Button type="submit" disabled={submitting} className="mt-2 self-start">
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Salvează
      </Button>
    </form>
  );
}
