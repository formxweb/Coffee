import type { Metadata } from "next";
import { signOut } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Yetki yok" };

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-svh items-center px-5">
      <div className="mx-auto max-w-lg">
        <p className="label text-copper-ink">Erişim yok</p>
        <h1 className="mt-4 text-5xl">Bu hesap yönetici değil.</h1>
        <p className="mt-6 text-lg text-stone">
          Giriş yaptığınız hesabın yönetim paneline erişim yetkisi bulunmuyor. Yetki için mevcut bir yöneticiyle iletişime geçin.
        </p>
        <form action={signOut} className="mt-10">
          <button type="submit" className="btn-line">
            Çıkış yap <span aria-hidden="true">↗</span>
          </button>
        </form>
      </div>
    </main>
  );
}
