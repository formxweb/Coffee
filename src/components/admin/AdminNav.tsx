"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveCount } from "./LiveNotifications";

const ITEMS = [
  { href: "/admin", label: "Genel bakış", exact: true },
  { href: "/admin/basvurular", label: "Başvurular", live: true },
  { href: "/admin/icerik", label: "İçerik ve fiyatlar" },
];

export function AdminNav() {
  return <AdminNavInner pathname={usePathname()} />;
}

export function AdminNavFallback() {
  return <AdminNavInner pathname="" />;
}

function AdminNavInner({ pathname }: { pathname: string }) {
  const live = useLiveCount();
  return (
    <nav aria-label="Yönetim menüsü">
      <ul className="flex gap-1 overflow-x-auto lg:grid lg:gap-0 lg:border-t lg:border-line-dark">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="lg:border-b lg:border-line-dark">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-3 whitespace-nowrap px-3 py-3 text-sm lg:px-0 ${
                  active ? "text-ivory" : "text-mist hover:text-ivory"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className={`h-1.5 w-1.5 ${active ? "bg-copper-light" : "bg-transparent"}`} />
                  {item.label}
                </span>
                {item.live && live > 0 && (
                  <span className="label tabular text-copper-light" aria-label={`${live} yeni başvuru`}>
                    +{live}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        <li className="lg:border-b lg:border-line-dark">
          <Link href="/" target="_blank" className="flex items-center gap-3 whitespace-nowrap px-3 py-3 text-sm text-mist hover:text-ivory lg:px-0">
            <span aria-hidden="true" className="h-1.5 w-1.5" />
            Siteyi görüntüle ↗
          </Link>
        </li>
      </ul>
    </nav>
  );
}
