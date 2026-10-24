import Link from "next/link";
import { areaLabel } from "@/lib/format";
import { waNumber } from "@/lib/format";
import type { Concept, SiteText } from "@/lib/types";

export function About({ text, concepts }: { text: SiteText; concepts: Concept[] }) {
  return (
    <section id="hakkimizda" aria-labelledby="hakkimizda-baslik" className="bg-paper">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:px-12">
        <p className="label text-copper-ink lg:col-span-12">Hakkımızda</p>
        <h2 id="hakkimizda-baslik" data-reveal className="text-giga lg:col-span-8">
          {text["about.title"]}
        </h2>
        <div className="lg:col-span-5 lg:col-start-8">
          <p data-reveal className="text-xl leading-relaxed text-stone">
            {text["about.body"]}
          </p>
          <ul className="mt-12 border-t border-line">
            {concepts.map((c) => (
              <li key={c.slug} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <Link href={`/konseptler/${c.slug}`} className="font-display text-2xl uppercase underline-offset-8 hover:underline">
                  {c.name}
                </Link>
                <span className="label tabular text-stone">{areaLabel(c)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ text }: { text: SiteText }) {
  return (
    <section aria-labelledby="cta-baslik" className="on-dark bg-espresso text-ivory">
      <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <p id="cta-baslik" className="text-2xl text-mist lg:col-span-6">
            {text["cta.title"]}
          </p>
          <p className="text-mist lg:col-span-4 lg:col-start-9">{text["cta.body"]}</p>
        </div>
        <Link
          href="/basvuru"
          className="group mt-14 flex items-end justify-between gap-6 border-y border-line-dark py-8 sm:py-12"
        >
          <span className="font-display text-giga uppercase leading-[1.14] transition-colors duration-500 group-hover:text-copper-light">
            Bayilik başvurusu
          </span>
          <span aria-hidden="true" className="font-display text-giga leading-[0.9] text-copper-light">
            ↗
          </span>
        </Link>
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
    text["contact.website"] && {
      label: "Web sitesi",
      value: text["contact.website"].replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: text["contact.website"],
      external: true,
    },
    text["contact.address"] && { label: "Adres", value: text["contact.address"] },
  ].filter(Boolean) as { label: string; value: string; href?: string; external?: boolean }[];

  return (
    <section id="iletisim" aria-labelledby="iletisim-baslik" className="bg-ivory">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-4">
          <p className="label text-copper-ink">İletişim</p>
          <h2 id="iletisim-baslik" className="mt-6 text-title uppercase">
            Bize ulaşın.
          </h2>
        </div>
        <dl className="grid border-t border-line sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {items.map((item) => (
            <div key={item.label} className="border-b border-line py-6 sm:odd:border-r sm:odd:pr-8 sm:even:pl-8">
              <dt className="label text-stone" lang={item.label === "Instagram" ? "en" : undefined}>
                {item.label}
              </dt>
              <dd className="mt-2 break-words font-display text-2xl">
                {item.href ? (
                  <a
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="underline-offset-8 hover:underline"
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
