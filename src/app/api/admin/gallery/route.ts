import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const alt = (formData?.get("alt") as string | null) ?? "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Lipsește fișierul imaginii" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format neacceptat (jpg, png, webp, avif)" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Imaginea depășește 8MB" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Încărcarea a eșuat" }, { status: 500 });
  }

  const { count } = await supabase
    .from("gallery_images")
    .select("id", { count: "exact", head: true });

  const { data, error: insertError } = await supabase
    .from("gallery_images")
    .insert({ storage_path: storagePath, alt, position: count ?? 0 })
    .select("*")
    .single();

  if (insertError || !data) {
    await supabase.storage.from("gallery").remove([storagePath]);
    return NextResponse.json({ error: "Salvarea în bază de date a eșuat" }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from("gallery").getPublicUrl(storagePath);

  return NextResponse.json({
    id: data.id,
    url: publicUrl.publicUrl,
    alt: data.alt,
    position: data.position,
  });
}
