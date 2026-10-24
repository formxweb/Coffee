import Link from "next/link";
import { cacheLife } from "next/cache";
import type { SiteText } from "@/lib/types";
import { Wordmark } from "./Wordmark";

const LEGAL = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
];

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter({ text, concepts }: { text: SiteText; concepts: { slug: string; name: string }[] }) {
  return (
    <footer className="on-dark bg-espresso pb-28 text-ivory lg:pb-0">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 pb-12 pt-20 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-5">
          <Wordmark logoUrl={text["brand.logo_url"]} size="lg" />
          <p className="mt-6 max-w-sm text-mist">Coffee House franchise ve yatırım platformu.</p>
        </div>
        <nav aria-label="Konseptler" className="lg:col-span-2 lg:col-start-7">
          <p className="label text-copper-light">Konseptler</p>
          <ul className="mt-5 grid gap-3">
            {concepts.map((c) => (
              <li key={c.slug}>
                <Link href={`/konseptler/${c.slug}`} className="text-mist hover:text-ivory">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Yatırım" className="lg:col-span-2">
          <p className="label text-copper-light">Yatırım</p>
          <ul className="mt-5 grid gap-3">
            <li>
              <Link href="/#yatirim-secici" className="text-mist hover:text-ivory">
                Yatırım seçici
              </Link>
            </li>
            <li>
              <Link href="/#yatirim-sureci" className="text-mist hover:text-ivory">
                Yatırım süreci
              </Link>
            </li>
            <li>
              <Link href="/basvuru" className="text-mist hover:text-ivory">
                Bayilik başvurusu
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Yasal" className="lg:col-span-2">
          <p className="label text-copper-light">Yasal</p>
          <ul className="mt-5 grid gap-3">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-mist hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-3 border-t border-line-dark py-6 text-sm text-mist lg:grid-cols-2">
          <p>
            © <CurrentYear /> Coffee House. Tüm hakları saklıdır.
          </p>
          <p className="lg:text-right">
            Sitedeki yatırım bilgileri bilgilendirme amaçlıdır; kesin koşullar ön görüşmede paylaşılır. Kârlılık garantisi verilmez.
          </p>
        </div>
      </div>
    </footer>
  );
}
