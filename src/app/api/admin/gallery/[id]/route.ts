import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: image, error: fetchError } = await supabase
    .from("gallery_images")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !image) {
    return NextResponse.json({ error: "Imaginea nu a fost găsită" }, { status: 404 });
  }

  await supabase.storage.from("gallery").remove([image.storage_path]);

  const { error: deleteError } = await supabase.from("gallery_images").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: "Ștergerea a eșuat" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
