"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { priceLabel } from "@/lib/format";
import type { Concept } from "@/lib/types";
import { ConceptVisual } from "./ConceptVisual";
import { roomSize } from "./PlanDrawing";

type Layer = "shell" | "bar" | "seating" | "dims";

const m = (n: number) => n.toFixed(2).replace(".", ",");

/** Kaydırma tabanlı anlatım: soldaki çizim sabit kalır, sağdaki bölümler ilerledikçe ilgili katman öne çıkar. */
export function ConceptNarrative({ concept }: { concept: Concept }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const size = roomSize(concept);

  const chapters: { title: string; layer: Layer; body: React.ReactNode }[] = [
    {
      title: "Ölçek",
      layer: "dims",
      body: (
        <>
          <p className="whitespace-nowrap font-display text-giga leading-none tabular">
            {concept.areaMin}
            {concept.areaMax !== concept.areaMin && (
              <>
                <span className="font-sans font-light">–</span>
                {concept.areaMax}
              </>
            )}
            <span className="ml-3 text-[0.38em]">m²</span>
          </p>
          <p className="mt-6 max-w-md text-lg text-stone">
            Çizim, yaklaşık {m(size.w)} × {m(size.h)} metrelik bir alan üzerinden hazırlanmış temsili bir yerleşimdir. Gerçek proje,
            lokasyon değerlendirmesinden sonra dükkânın ölçülerine göre hazırlanır.
          </p>
        </>
      ),
    },
    {
      title: "Konsept",
      layer: "bar",
      body: (
        <>
          <p className="font-display text-4xl leading-tight sm:text-5xl">{concept.tagline}</p>
          {concept.description && <p className="mt-6 max-w-md text-lg text-stone">{concept.description}</p>}
        </>
      ),
    },
    {
      title: "Yatırım",
      layer: "seating",
      body: (
        <>
          <p className="font-display text-5xl leading-none tabular sm:text-6xl">{priceLabel(concept)}</p>
          <p className="mt-6 max-w-md text-lg text-stone">
            Yatırım tutarının kapsamı ve koşulları ön görüşmede ayrıntılı olarak paylaşılır. Kesin yatırım tutarı lokasyon değerlendirmesi ve
            fizibilite çalışmasıyla netleşir.
          </p>
          <Link href={`/basvuru?konsept=${concept.slug}`} className="btn-solid mt-10">
            Bu modelle başvur <span aria-hidden="true">↗</span>
          </Link>
        </>
      ),
    },
  ];

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.chapter));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section aria-label={`${concept.name} ayrıntıları`} className="bg-ivory">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-7">
          <div className="sticky top-16 flex h-[46svh] items-center border-b border-line bg-ivory py-6 text-copper-ink sm:top-20 lg:h-[calc(100svh-5rem)] lg:border-b-0 lg:border-r lg:pr-10">
            <ConceptVisual
              concept={{ ...concept, heroImageUrl: null }}
              background="#f2ece3"
              highlight={chapters[active]?.layer}
              className="h-full w-full"
            />
          </div>
        </div>
        <div className="lg:col-span-5">
          {chapters.map((ch, i) => (
            <article
              key={ch.title}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-chapter={i}
              className={`flex min-h-[70svh] flex-col justify-center border-b border-line py-16 transition-opacity duration-500 last:border-b-0 lg:min-h-svh ${
                active === i ? "opacity-100" : "opacity-40"
              }`}
            >
              <p className="label tabular text-copper-ink">
                {String(i + 1).padStart(2, "0")} · {ch.title}
              </p>
              <div className="mt-8">{ch.body}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
