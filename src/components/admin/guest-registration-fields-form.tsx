"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { CUSTOM_FIELD_TYPES, type CustomFieldDef, type CustomFieldType } from "@/types/guest-registration";

interface FieldDraft {
  fieldKey: string;
  label: string;
  labelEn: string;
  fieldType: CustomFieldType;
  required: boolean;
}

const TYPE_LABELS: Record<CustomFieldType, string> = {
  text: "Text scurt",
  textarea: "Text lung",
  number: "Număr",
  date: "Dată",
  checkbox: "Bifă (da/nu)",
};

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function GuestRegistrationFieldsForm({ initialFields }: { initialFields: CustomFieldDef[] }) {
  const router = useRouter();
  const [fields, setFields] = useState<FieldDraft[]>(
    initialFields.map((f) => ({
      fieldKey: f.fieldKey,
      label: f.label,
      labelEn: f.labelEn,
      fieldType: f.fieldType,
      required: f.required,
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  function updateField(index: number, patch: Partial<FieldDraft>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      { fieldKey: "", label: "", labelEn: "", fieldType: "text", required: false },
    ]);
  }

  function moveField(index: number, direction: -1 | 1) {
    setFields((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleaned = fields
      .filter((f) => f.label.trim().length > 0)
      .map((f) => ({ ...f, fieldKey: f.fieldKey.trim() || slugify(f.label) }));

    const keys = cleaned.map((f) => f.fieldKey);
    if (new Set(keys).size !== keys.length) {
      toast.error("Cheile câmpurilor trebuie să fie unice.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/guest-registration-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: cleaned }),
      });

      if (!res.ok) {
        toast.error("Nu am putut salva câmpurile.");
        return;
      }

      toast.success("Câmpurile au fost salvate.");
      router.refresh();
    } catch {
      toast.error("A apărut o eroare de rețea.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nu ai adăugat încă niciun câmp suplimentar — fișa folosește doar câmpurile standard.
        </p>
      )}

      {fields.map((field, index) => (
        <Card key={index}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Etichetă (română)</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="ex: Număr înmatriculare mașină"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Etichetă (engleză, opțional)</Label>
                  <Input
                    value={field.labelEn}
                    onChange={(e) => updateField(index, { labelEn: e.target.value })}
                    placeholder="e.g. Car license plate"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button type="button" variant="outline" size="icon-sm" onClick={() => moveField(index, -1)} disabled={index === 0}>
                  <ArrowUp className="size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => moveField(index, 1)}
                  disabled={index === fields.length - 1}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="grid gap-1.5">
                <Label>Tip câmp</Label>
                <select
                  value={field.fieldType}
                  onChange={(e) => updateField(index, { fieldType: e.target.value as CustomFieldType })}
                  className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                >
                  {CUSTOM_FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 self-end pb-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="size-4"
                />
                Obligatoriu
              </label>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="self-end"
                onClick={() => removeField(index)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addField} className="self-start">
        <Plus className="size-4" aria-hidden />
        Adaugă câmp
      </Button>

      <Button type="submit" disabled={submitting} className="mt-2 self-start">
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Salvează
      </Button>
    </form>
  );
}
