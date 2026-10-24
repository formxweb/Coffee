import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

/** Çerezdeki oturumla çalışan istemci (yönetim paneli). RLS yöneticiyi doğrular. */
export async function createSessionClient() {
  const cookieStore = await cookies();
  // Oturum doğrulaması saat ve ağ çağrısı içerir; yalnızca istek anında çalışsın
  await connection();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component içinden çağrıldığında çerez yazılamaz; oturumu proxy yeniler.
        }
      },
    },
  });
}
