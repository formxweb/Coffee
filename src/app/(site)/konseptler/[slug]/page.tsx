import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConceptNarrative } from "@/components/site/ConceptNarrative";
import { ConceptVisual, RemoteImage } from "@/components/site/ConceptVisual";
import { getSiteData } from "@/lib/content";
import { areaLabel, priceLabel } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { concepts } = await getSiteData();
  return concepts.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { concepts } = await getSiteData();
  const c = concepts.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.name} · ${areaLabel(c)}`,
    description: `${c.name}: ${c.tagline} ${areaLabel(c)}, yatırım tutarı ${priceLabel(c)}. Coffee House bayilik başvurusu.`,
    alternates: { canonical: `/konseptler/${c.slug}` },
  };
}

const HERO_BG = "#1b1411";

export default function ConceptPage({ params }: Props) {
  return (
    <Suspense fallback={<section aria-busy="true" className="min-h-svh bg-espresso" />}>
      <ConceptContent params={params} />
    </Suspense>
  );
}

async function ConceptContent({ params }: Props) {
  const { slug } = await params;
  const { concepts } = await getSiteData();
  const index = concepts.findIndex((c) => c.slug === slug);
  if (index < 0) notFound();
  const concept = concepts[index];
  const others = concepts.filter((c) => c.slug !== slug);

  return (
    <>
      <section className="on-dark relative flex min-h-svh flex-col overflow-hidden bg-espresso text-ivory">
        <div aria-hidden="true" className="absolute inset-0">
          {concept.heroImageUrl ? (
            <>
              <ConceptVisual concept={concept} background={HERO_BG} className="absolute inset-0" priority sizes="100vw" />
              <div className="absolute inset-0 bg-espresso/60" />
            </>
          ) : (
            <ConceptVisual
              concept={concept}
              background={HERO_BG}
              showTitle={false}
              className="fade-in absolute inset-y-[12%] right-[-12%] w-[min(1150px,100vw)] text-copper-light/25 lg:right-[1%] lg:w-[56vw]"
            />
          )}
        </div>
        <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [--grid-color:var(--color-line-dark)]" />

        <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pt-28 sm:px-8 sm:pt-36 lg:px-12">
          <nav aria-label="Sayfa konumu" className="label flex gap-3 text-mist">
            <Link href="/#konseptler" className="hover:text-ivory">
              Konseptler
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-copper-light" aria-current="page">
              {concept.code} · {concept.name}
            </span>
          </nav>
          <h1 className="mt-10 text-mega uppercase leading-[1.02]">
            <span className="line-mask">
              <span className="rise">{concept.shortName}</span>
            </span>
          </h1>
          <p className="fade-in mt-6 max-w-xl text-xl text-mist" style={{ ["--delay" as string]: 300 }}>
            {concept.tagline}
          </p>

          <dl className="fade-in mt-auto grid grid-cols-2 border-t border-line-dark lg:grid-cols-4" style={{ ["--delay" as string]: 450 }}>
            <div className="py-6 pr-6">
              <dt className="label text-mist">Konsept</dt>
              <dd className="mt-2 font-display text-2xl sm:text-3xl">
                {concept.code} / {String(concepts.length).padStart(2, "0")}
              </dd>
            </div>
            <div className="border-l border-line-dark py-6 pl-6">
              <dt className="label text-mist">Alan</dt>
              <dd className="mt-2 font-display text-2xl tabular sm:text-3xl">{areaLabel(concept)}</dd>
            </div>
            <div className="col-span-2 border-t border-line-dark py-6 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-6">
              <dt className="label text-mist">Yatırım tutarı</dt>
              <dd className="mt-2 font-display text-2xl tabular sm:text-3xl">{priceLabel(concept)}</dd>
            </div>
            <div className="col-span-2 flex items-center border-t border-line-dark py-6 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-6">
              <Link href={`/basvuru?konsept=${concept.slug}`} className="btn-solid w-full">
                Bu modelle başvur <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </dl>
        </div>
      </section>

      <ConceptNarrative concept={concept} />

      {concept.gallery.length > 0 && (
        <section aria-labelledby="galeri-baslik" className="on-dark bg-espresso text-ivory">
          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12">
            <h2 id="galeri-baslik" className="label text-copper-light">
              Galeri
            </h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-12">
              {concept.gallery.map((img, i) => (
                <figure
                  key={img.url}
                  className={`relative overflow-hidden bg-espresso-soft ${
                    i % 3 === 0 ? "aspect-[4/5] lg:col-span-7 lg:row-span-2" : "aspect-[4/3] lg:col-span-5"
                  }`}
                >
                  <RemoteImage src={img.url} alt={img.alt || `${concept.name} görseli ${i + 1}`} sizes="(min-width: 1024px) 50vw, 100vw" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="diger-baslik" className="bg-paper">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:px-12">
          <h2 id="diger-baslik" className="label text-copper-ink lg:col-span-3">
            Diğer konseptler
          </h2>
          <ul className="border-t border-line lg:col-span-9">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/konseptler/${c.slug}`}
                  className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-line py-6 sm:grid-cols-[4rem_1fr_10rem_auto]"
                >
                  <span className="label tabular text-stone">{c.code}</span>
                  <span className="font-display text-4xl uppercase transition-colors group-hover:text-copper-ink sm:text-5xl">
                    {c.shortName}
                  </span>
                  <span className="hidden text-stone tabular sm:block">{areaLabel(c)}</span>
                  <span aria-hidden="true" className="font-display text-3xl">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
