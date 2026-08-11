import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin-audit";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_FILES_PER_UPLOAD = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  // Support both the multi-file field name ("files") and the legacy
  // single-file one ("file"), so older clients keep working.
  const files = [...(formData?.getAll("files") ?? []), ...(formData?.getAll("file") ?? [])].filter(
    (entry): entry is File => entry instanceof File
  );
  const alt = (formData?.get("alt") as string | null) ?? "";

  if (files.length === 0) {
    return NextResponse.json({ error: "Lipsesc fișierele imaginilor" }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return NextResponse.json(
      { error: `Poți încărca cel mult ${MAX_FILES_PER_UPLOAD} poze deodată` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format neacceptat (jpg, png, webp, avif)" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "O imagine depășește 8MB" }, { status: 400 });
    }
  }

  const supabase = createAdminClient();

  const { count } = await supabase
    .from("gallery_images")
    .select("id", { count: "exact", head: true });

  let nextPosition = count ?? 0;
  const uploadedPaths: string[] = [];
  const rowsToInsert: { storage_path: string; alt: string; position: number }[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      // Roll back everything already uploaded in this batch so we don't
      // leave orphaned Storage objects behind.
      await supabase.storage.from("gallery").remove(uploadedPaths);
      return NextResponse.json({ error: "Încărcarea a eșuat" }, { status: 500 });
    }

    uploadedPaths.push(storagePath);
    rowsToInsert.push({ storage_path: storagePath, alt, position: nextPosition });
    nextPosition += 1;
  }

  const { data, error: insertError } = await supabase
    .from("gallery_images")
    .insert(rowsToInsert)
    .select("*")
    .order("position", { ascending: true });

  if (insertError || !data) {
    await supabase.storage.from("gallery").remove(uploadedPaths);
    return NextResponse.json({ error: "Salvarea în bază de date a eșuat" }, { status: 500 });
  }

  const created = data.map((row) => ({
    id: row.id,
    url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
    alt: row.alt,
    position: row.position,
  }));

  await logAdminAction({
    actorEmail: user.email ?? "necunoscut",
    action: "gallery.upload",
    entityType: "gallery_image",
    details: { count: created.length, alt },
  });

  return NextResponse.json({ images: created });
}

const reorderSchema = z.object({
  order: z.array(z.string().uuid()).min(1).max(500),
});

export async function PATCH(request: NextRequest) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const results = await Promise.all(
    parsed.data.order.map((id, index) =>
      supabase.from("gallery_images").update({ position: index }).eq("id", id)
    )
  );

  if (results.some((r) => r.error)) {
    return NextResponse.json({ error: "Eroare la salvarea ordinii" }, { status: 500 });
  }

  await logAdminAction({
    actorEmail: user.email ?? "necunoscut",
    action: "gallery.reorder",
    entityType: "gallery_image",
    details: { count: parsed.data.order.length },
  });

  return NextResponse.json({ ok: true });
}

