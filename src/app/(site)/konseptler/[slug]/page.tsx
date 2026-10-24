import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CtaBand } from "@/components/site/HomeSections";
import { Photo } from "@/components/site/Photo";
import { getSiteData } from "@/lib/content";
import { areaLabel, priceLabel, priceShort } from "@/lib/format";

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
    description: `${c.name}: ${c.tagline} Yatırım tutarı ${priceLabel(c)}. Coffee House bayilik başvurusu.`,
    alternates: { canonical: `/konseptler/${c.slug}` },
  };
}

export default function ConceptPage({ params }: Props) {
  return (
    <Suspense fallback={<section aria-busy="true" className="min-h-svh bg-navy" />}>
      <ConceptContent params={params} />
    </Suspense>
  );
}

async function ConceptContent({ params }: Props) {
  const { slug } = await params;
  const { concepts, text } = await getSiteData();
  const concept = concepts.find((c) => c.slug === slug);
  if (!concept) notFound();
  const others = concepts.filter((c) => c.slug !== slug);
  const shopPhotos = concept.gallery.every((g) => g.url.startsWith("/images/sube/"));

  return (
    <>
      <section className="on-dark bg-navy pt-16 text-white sm:pt-20">
        <div className="shell grid gap-10 py-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
          <div className="lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden bg-navy-soft sm:aspect-[4/3] lg:aspect-[4/5]">
              {concept.heroImageUrl ? (
                <Photo src={concept.heroImageUrl} alt={concept.heroImageAlt ?? ""} sizes="(min-width: 1024px) 50vw, 100vw" eager />
              ) : (
                <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-7xl font-bold uppercase text-white/15">
                  {concept.shortName}
                </span>
              )}
            </div>
          </div>

          <div>
            <nav aria-label="Sayfa konumu" className="flex flex-wrap gap-2 text-soft">
              <Link href="/#konseptler" className="underline-offset-4 hover:text-white hover:underline">
                Yatırım modelleri
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white" aria-current="page">
                {concept.name}
              </span>
            </nav>
            <p className="label fade-up mt-8 text-blue-light">Model {concept.code}</p>
            <h1 className="fade-up mt-3 text-hero uppercase" style={{ ["--delay" as string]: 100 }}>
              {concept.name}
            </h1>
            <p className="fade-up mt-5 max-w-lg text-xl text-white/90 sm:text-2xl" style={{ ["--delay" as string]: 200 }}>
              {concept.tagline}
            </p>

            <dl className="fade-up mt-9 grid grid-cols-2 border-y border-line-dark" style={{ ["--delay" as string]: 300 }}>
              <div className="py-5 pr-4">
                <dt className="text-soft">Alan</dt>
                <dd className="mt-1 whitespace-nowrap font-display text-4xl font-semibold tabular">{areaLabel(concept)}</dd>
              </div>
              <div className="border-l border-line-dark py-5 pl-5 sm:pl-6">
                <dt className="text-soft">Yatırım</dt>
                <dd className="mt-1 font-display text-4xl font-semibold tabular text-blue-light">{priceShort(concept)}</dd>
              </div>
            </dl>

            <div className="fade-up mt-9 flex flex-col gap-3 min-[420px]:flex-row" style={{ ["--delay" as string]: 400 }}>
              <Link href={`/basvuru?konsept=${concept.slug}`} className="btn-white">
                Bu modelle başvur <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/#yatirim-sureci" className="btn-line">
                Yatırım süreci
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="model-baslik" className="bg-white py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-blue">Model hakkında</p>
            <h2 id="model-baslik" className="mt-4 text-title uppercase">
              {concept.name} kimler için?
            </h2>
            <p className="mt-6 text-lg text-muted sm:text-xl">{concept.description}</p>
          </div>
          <aside aria-label="Yatırım bilgisi" className="border border-line bg-paper p-7 sm:p-8 lg:col-span-5">
            <h3 className="text-2xl uppercase">Yatırım bilgisi</h3>
            <dl className="mt-5 grid gap-4">
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                <dt className="text-muted">Alan</dt>
                <dd className="text-lg font-semibold tabular">{areaLabel(concept)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                <dt className="text-muted">Yatırım tutarı</dt>
                <dd className="text-right text-lg font-semibold tabular">{priceLabel(concept)}</dd>
              </div>
            </dl>
            <p className="mt-5 text-muted">
              Tutarın kapsamı ve koşulları ön görüşmede paylaşılır. Kesin tutar, lokasyon değerlendirmesi ve fizibilite çalışmasıyla netleşir.
            </p>
            <Link href={`/basvuru?konsept=${concept.slug}`} className="btn-solid mt-7 w-full">
              Bu modelle başvur <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        </div>
      </section>

      {concept.gallery.length > 0 && (
        <section aria-labelledby="galeri-baslik" className="bg-paper py-20 sm:py-24">
          <div className="shell">
            <p className="label text-blue">Galeri</p>
            <h2 id="galeri-baslik" className="mt-4 text-title uppercase">
              {shopPhotos ? "Şubemizden kareler" : `${concept.name} fotoğrafları`}
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {concept.gallery.map((img, i) => (
                <li key={img.url} data-reveal style={{ ["--delay" as string]: (i % 4) * 80 }} className="relative aspect-[3/4] overflow-hidden bg-white">
                  <Photo src={img.url} alt={img.alt || `${concept.name} fotoğrafı ${i + 1}`} sizes="(min-width: 1024px) 25vw, 50vw" />
                </li>
              ))}
            </ul>
            {shopPhotos && (
              <p className="mt-4 text-muted">Fotoğraflar Coffee House şubesinden. Dükkânınızın yerleşimi kendi ölçülerine göre hazırlanır.</p>
            )}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="diger-baslik" className="bg-white py-20 sm:py-24">
          <div className="shell">
            <h2 id="diger-baslik" className="text-title uppercase">
              Diğer modeller
            </h2>
            <ul className="mt-10 grid gap-3 md:grid-cols-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <Link href={`/konseptler/${c.slug}`} className="group grid grid-cols-[6rem_1fr] border border-line transition-colors hover:border-blue sm:grid-cols-[8rem_1fr]">
                    <span className="relative block aspect-[3/4] overflow-hidden bg-navy">
                      {c.heroImageUrl && <Photo src={c.heroImageUrl} alt="" sizes="8rem" />}
                    </span>
                    <span className="flex flex-col justify-center gap-1 p-5 sm:p-6">
                      <span className="font-display text-3xl font-bold uppercase leading-none group-hover:text-blue sm:text-4xl">{c.name}</span>
                      <span className="text-lg text-muted tabular">
                        {areaLabel(c)} · {priceShort(c)}
                      </span>
                      <span className="mt-2 font-semibold text-blue">
                        İncele <span aria-hidden="true">↗</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand text={text} />
    </>
  );
}
