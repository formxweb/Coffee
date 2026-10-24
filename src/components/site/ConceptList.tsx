import Link from "next/link";
import { areaLabel, priceShort } from "@/lib/format";
import type { Concept } from "@/lib/types";
import { Photo } from "./Photo";
import { SectionHead } from "./SectionHead";

/** Yatırım modelleri: her konsept fotoğrafı, alanı ve yatırım tutarıyla ayrı bir satırda */
export function ConceptList({ concepts }: { concepts: Concept[] }) {
  return (
    <section id="konseptler" aria-labelledby="konseptler-baslik" className="bg-white py-20 sm:py-28">
      <div className="shell">
        <SectionHead id="konseptler-baslik" label="Yatırım Modelleri" title="Bütçenize uygun Coffee House'u seçin">
          Üç farklı büyüklükte, anahtar teslim kurulan Coffee House dükkânları. Size uygun modeli seçin, gerisini birlikte planlayalım.
        </SectionHead>

        <div className="mt-14 grid gap-16 sm:mt-20 sm:gap-24">
          {concepts.map((c, i) => (
            <article key={c.slug} aria-labelledby={`konsept-${c.slug}`} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <Link
                href={`/konseptler/${c.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                data-reveal
                className={`group relative block aspect-[4/5] overflow-hidden bg-navy sm:aspect-[4/3] lg:aspect-[5/6] ${i % 2 ? "lg:order-2" : ""}`}
              >
                {c.heroImageUrl ? (
                  <Photo
                    src={c.heroImageUrl}
                    alt=""
                    sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                    className="transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center font-display text-6xl font-bold uppercase text-white/20">
                    {c.shortName}
                  </span>
                )}
              </Link>

              <div data-reveal>
                <p className="label text-blue">Model {c.code}</p>
                <h3 id={`konsept-${c.slug}`} className="mt-3 text-5xl uppercase sm:text-6xl">
                  {c.name}
                </h3>
                <dl className="mt-7 grid grid-cols-2 border-y border-line">
                  <div className="py-4 pr-4">
                    <dt className="text-muted">Alan</dt>
                    <dd className="mt-1 whitespace-nowrap font-display text-3xl font-semibold tabular sm:text-4xl">{areaLabel(c)}</dd>
                  </div>
                  <div className="border-l border-line py-4 pl-5 sm:pl-6">
                    <dt className="text-muted">Yatırım</dt>
                    <dd className="mt-1 font-display text-3xl font-semibold tabular text-blue sm:text-4xl">{priceShort(c)}</dd>
                  </div>
                </dl>
                <p className="mt-6 max-w-xl text-lg text-muted">{c.description}</p>
                <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
                  <Link href={`/basvuru?konsept=${c.slug}`} className="btn-solid">
                    Bu modelle başvur <span aria-hidden="true">↗</span>
                  </Link>
                  <Link href={`/konseptler/${c.slug}`} className="btn-line">
                    Detayları incele
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
