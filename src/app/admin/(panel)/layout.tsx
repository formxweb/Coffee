import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/admin/actions";
import { AdminNav, AdminNavFallback } from "@/components/admin/AdminNav";
import { LiveNotifications } from "@/components/admin/LiveNotifications";
import { Wordmark } from "@/components/site/Wordmark";
import { requireAdmin } from "@/lib/admin/auth";

async function AdminUser() {
  const { user } = await requireAdmin();
  return (
    <div className="grid gap-3">
      <p className="truncate text-sm text-soft" title={user.email}>
        {user.email}
      </p>
      <form action={signOut}>
        <button type="submit" className="label text-soft hover:text-white">
          Çıkış yap ↗
        </button>
      </form>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiveNotifications>
      <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="on-dark bg-navy text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-between lg:p-8">
          <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:p-0">
            <div>
              <Link href="/admin" aria-label="Genel bakış">
                <Wordmark />
              </Link>
              <p className="label mt-2 hidden text-soft lg:block">Yönetim paneli</p>
            </div>
            <form action={signOut} className="lg:hidden">
              <button type="submit" className="label text-soft">
                Çıkış
              </button>
            </form>
          </div>
          <div className="border-t border-line-dark px-2 lg:mt-12 lg:flex-1 lg:border-t-0 lg:px-0">
            <Suspense fallback={<AdminNavFallback />}>
              <AdminNav />
            </Suspense>
          </div>
          <div className="hidden lg:block">
            <Suspense fallback={<p className="text-sm text-soft">Oturum kontrol ediliyor…</p>}>
              <AdminUser />
            </Suspense>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </LiveNotifications>
  );
}
