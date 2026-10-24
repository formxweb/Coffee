import Link from "next/link";
import { SHOP_PHOTOS } from "@/lib/defaults";
import { waNumber } from "@/lib/format";
import type { SiteText } from "@/lib/types";
import { Photo } from "./Photo";
import { SectionHead } from "./SectionHead";

const P = SHOP_PHOTOS;
const ABOUT_PHOTOS = [P.cephe, P.salon, P.neonLogo, P.vitrin, P.latte, P.koltuk];

/** Metin alanındaki boş satırlar paragraf olarak gösterilir */
function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function About({ text }: { text: SiteText }) {
  return (
    <section id="hakkimizda" aria-labelledby="hakkimizda-baslik" className="bg-paper py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="label text-blue">Hakkımızda</p>
          <h2 id="hakkimizda-baslik" className="mt-4 text-title uppercase">
            {text["about.title"]}
          </h2>
          {paragraphs(text["about.body"]).map((p, i) => (
            <p key={i} className="mt-6 text-lg text-muted sm:text-xl">
              {p}
            </p>
          ))}
          <Link href="/basvuru" className="btn-solid mt-10">
            Bayilik Başvurusu <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <figure className="lg:col-span-7">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ABOUT_PHOTOS.map((photo, i) => (
              <li key={photo.url} data-reveal style={{ ["--delay" as string]: (i % 3) * 80 }} className="relative aspect-[3/4] overflow-hidden bg-white">
                <Photo src={photo.url} alt={photo.alt} sizes="(min-width: 1280px) 240px, (min-width: 640px) 30vw, 50vw" />
              </li>
            ))}
          </ul>
          <figcaption className="mt-3 text-muted">Fotoğraflar Coffee House şubesinden.</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function CtaBand({ text }: { text: SiteText }) {
  return (
    <section aria-labelledby="cta-baslik" className="on-dark bg-blue text-white">
      <div className="shell grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-8">
          <h2 id="cta-baslik" className="text-title uppercase">
            {text["cta.title"]}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/90 sm:text-xl">{text["cta.body"]}</p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end">
          <Link href="/basvuru" className="btn-white w-full sm:w-auto">
            Bayilik Başvurusu <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Contact({ text }: { text: SiteText }) {
  const items = [
    text["contact.phone"] && { label: "Telefon", value: text["contact.phone"], href: `tel:${text["contact.phone"].replace(/[^\d+]/g, "")}` },
    text["contact.whatsapp"] && {
      label: "WhatsApp",
      value: text["contact.whatsapp"],
      href: `https://wa.me/${waNumber(text["contact.whatsapp"])}?text=${encodeURIComponent("Merhaba, Coffee House bayilik hakkında bilgi almak istiyorum.")}`,
      external: true,
    },
    text["contact.email"] && { label: "E-posta", value: text["contact.email"], href: `mailto:${text["contact.email"]}` },
    text["contact.instagram"] && {
      label: "Instagram",
      value: "@" + text["contact.instagram"].replace(/\/+$/, "").split("/").pop(),
      href: text["contact.instagram"],
      external: true,
    },
    text["contact.address"] && { label: "Adres", value: text["contact.address"] },
  ].filter(Boolean) as { label: string; value: string; href?: string; external?: boolean }[];

  return (
    <section id="iletisim" aria-labelledby="iletisim-baslik" className="bg-paper py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <SectionHead id="iletisim-baslik" label="İletişim" title="Bize ulaşın" className="lg:col-span-5">
          Sorularınız için bize yazın ya da doğrudan başvurunuzu bırakın.
        </SectionHead>
        <dl className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {items.map((item) => (
            <div key={item.label} className="border border-line bg-white p-6">
              <dt className="label text-muted" lang={item.label === "Instagram" || item.label === "WhatsApp" ? "en" : undefined}>
                {item.label}
              </dt>
              <dd className="mt-2 break-words text-xl font-semibold">
                {item.href ? (
                  <a
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-blue underline-offset-4 hover:underline"
                  >
                    {item.value}
                    {item.external && <span aria-hidden="true"> ↗</span>}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
