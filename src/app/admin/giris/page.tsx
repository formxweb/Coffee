import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Wordmark } from "@/components/site/Wordmark";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="on-dark hidden flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link href="/" aria-label="Siteye dön">
          <Wordmark />
        </Link>
        <p className="font-display text-6xl uppercase leading-[1.14]">
          Yatırımcı
          <br />
          yönetimi.
        </p>
        <p className="label text-soft">
          Coffee House <span lang="en">franchise</span> platformu
        </p>
      </div>
      <main className="flex items-center px-5 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <p className="label text-blue-ink lg:hidden">Coffee House</p>
          <h1 className="mt-4 text-5xl">Yönetim paneli</h1>
          <p className="mt-4 text-muted">Başvuruları ve site içeriğini yönetmek için giriş yapın.</p>
          <div className="mt-12">
            {isSupabaseConfigured ? (
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            ) : (
              <p role="alert" className="border border-danger/50 px-4 py-3">
                Veritabanı bağlantısı yapılandırılmamış. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ortam değişkenlerini
                tanımlayın.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
