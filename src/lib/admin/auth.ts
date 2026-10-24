import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Oturumdaki kullanıcıyı doğrular ve yönetici olduğunu kontrol eder.
 * Yetki asıl olarak veritabanındaki RLS kurallarıyla sağlanır; bu kontrol arayüzü korur.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/giris");

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/yetkisiz");

  return { supabase, user: { id: user.id, email: user.email ?? "" } };
});
