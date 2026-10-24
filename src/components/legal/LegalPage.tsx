import Link from "next/link";
import type { SiteText } from "@/lib/types";

export const LEGAL_UPDATED = "24 Ekim 2026";

const LINKS = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
];

export function controller(text: SiteText) {
  return {
    name: text["legal.company_name"] || "Coffee House",
    address: text["legal.company_address"],
    mersis: text["legal.mersis"],
    email: text["legal.kvkk_email"] || text["contact.email"],
    retention: text["legal.retention"] || "2 yıl",
  };
}

export function LegalPage({ title, current, children }: { title: string; current: string; children: React.ReactNode }) {
  return (
    <div className="bg-ivory pt-28 sm:pt-36">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 pb-24 sm:px-8 lg:grid-cols-12 lg:px-12">
        <aside className="lg:col-span-3">
          <nav aria-label="Yasal metinler" className="lg:sticky lg:top-32">
            <ul className="border-t border-line">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={l.href === current ? "page" : undefined}
                    className={`block border-b border-line py-3 text-sm ${l.href === current ? "text-ink" : "text-stone hover:text-ink"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <article className="legal max-w-3xl lg:col-span-8 lg:col-start-5">
          <h1 className="text-title">{title}</h1>
          <p className="label mt-6 text-stone">Son güncelleme: {LEGAL_UPDATED}</p>
          <div className="mt-12 grid gap-10 text-lg leading-relaxed text-stone [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-ink [&_li]:mt-2 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-[square] [&_ul]:pl-5 [&_a]:text-copper-ink [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
