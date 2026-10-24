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
    <footer className="on-dark bg-navy-deep pb-28 text-white lg:pb-0">
      <div className="shell grid gap-12 pb-12 pt-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <Wordmark logoUrl={text["brand.logo_url"]} size="lg" />
          <p className="mt-5 max-w-sm text-soft">Anahtar teslim Coffee House dükkânları. Corner, Mahal ve Agora yatırım modelleri.</p>
          <Link href="/basvuru" className="btn-white mt-8">
            Bayilik Başvurusu <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <nav aria-label="Yatırım modelleri" className="lg:col-span-2 lg:col-start-6">
          <p className="label text-blue-light">Modeller</p>
          <ul className="mt-4 grid gap-2.5">
            {concepts.map((c) => (
              <li key={c.slug}>
                <Link href={`/konseptler/${c.slug}`} className="text-soft hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Sayfalar" className="lg:col-span-2">
          <p className="label text-blue-light">Sayfalar</p>
          <ul className="mt-4 grid gap-2.5">
            <li>
              <Link href="/#yatirim-sureci" className="text-soft hover:text-white">
                Yatırım süreci
              </Link>
            </li>
            <li>
              <Link href="/#yatirim-secici" className="text-soft hover:text-white">
                Yatırım seçici
              </Link>
            </li>
            <li>
              <Link href="/#hakkimizda" className="text-soft hover:text-white">
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link href="/#iletisim" className="text-soft hover:text-white">
                İletişim
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Yasal" className="lg:col-span-3">
          <p className="label text-blue-light">Yasal</p>
          <ul className="mt-4 grid gap-2.5">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-soft hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="shell">
        <div className="grid gap-3 border-t border-line-dark py-6 text-sm text-soft lg:grid-cols-2">
          <p>
            © <CurrentYear /> Coffee House. Tüm hakları saklıdır.
          </p>
          <p className="lg:text-right">Yatırım bilgileri bilgilendirme amaçlıdır; kesin koşullar ön görüşmede paylaşılır. Kârlılık garantisi verilmez.</p>
        </div>
      </div>
    </footer>
  );
}
