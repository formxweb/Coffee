"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { priceLabel } from "@/lib/format";
import type { Concept } from "@/lib/types";
import { ConceptVisual } from "./ConceptVisual";

const PANEL_BG = "#261d18";

function CropMarks() {
  const c = "absolute h-4 w-4 border-copper-light/60";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-4 sm:inset-6">
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

export function ConceptShowcase({ concepts }: { concepts: Concept[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const total = concepts.length;

  // Masaüstünde: bölüm sabitlenir, dikey kaydırma konseptleri yatay geçirir (GSAP ScrollTrigger)
  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !pinRef.current || !trackRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        setPinned(true);
        const track = trackRef.current!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pinRef.current,
            pin: true,
            scrub: 0.6,
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => setIndex(Math.round(self.progress * (total - 1))),
          },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { clearProps: "transform" });
          setPinned(false);
        };
      });
      revert = () => mm.revert();
    })();
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [total]);

  // Mobilde ve azaltılmış harekette: yatay kaydırmalı galeri
  const onTrackScroll = () => {
    if (pinned || !trackRef.current) return;
    const el = trackRef.current;
    const panel = el.firstElementChild as HTMLElement | null;
    if (!panel) return;
    setIndex(Math.min(total - 1, Math.round(el.scrollLeft / panel.offsetWidth)));
  };

  const go = (dir: -1 | 1) => {
    const el = trackRef.current;
    const panel = el?.firstElementChild as HTMLElement | null;
    if (!el || !panel) return;
    el.scrollTo({ left: (index + dir) * panel.offsetWidth, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="konseptler" aria-labelledby="konseptler-baslik" className="on-dark bg-espresso text-ivory">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-5 pb-12 pt-24 sm:px-8 sm:pt-32 lg:grid-cols-12 lg:px-12">
        <p className="label text-copper-light lg:col-span-12">Konseptler</p>
        <h2 id="konseptler-baslik" data-reveal-lines className="text-title uppercase lg:col-span-7">
          <span className="line-mask">
            <span style={{ ["--i" as string]: 0 }}>Üç ölçek.</span>
          </span>
          <span className="line-mask">
            <span style={{ ["--i" as string]: 1 }}>Tek Coffee House.</span>
          </span>
        </h2>
        <p data-reveal className="max-w-md self-end text-lg text-mist lg:col-span-4 lg:col-start-9">
          Corner, Mahal ve Agora; aynı markayı farklı metrekare ve bütçelere taşıyan üç yatırım modeli.
        </p>
      </div>

      <div ref={pinRef} className={`relative ${pinned ? "h-svh overflow-hidden" : ""}`}>
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className={`flex ${pinned ? "h-full w-max" : "snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]"}`}
        >
          {concepts.map((c) => (
            <article
              key={c.slug}
              aria-label={`${c.code} / ${c.name}`}
              className={`grid flex-none border-t border-line-dark ${
                pinned ? "h-full w-screen grid-cols-12" : "w-[88vw] snap-start sm:w-[80vw] lg:grid-cols-12"
              } border-r`}
            >
              <div
                className={`relative bg-espresso-soft ${pinned ? "col-span-7 h-full" : "aspect-[10/7.2] lg:col-span-7 lg:aspect-auto lg:min-h-[70svh]"}`}
              >
                <ConceptVisual
                  concept={c}
                  background={PANEL_BG}
                  sizes="(min-width: 1024px) 58vw, 88vw"
                  className={`absolute inset-0 ${c.heroImageUrl ? "" : "p-4 text-copper-light sm:p-8"}`}
                />
                <CropMarks />
              </div>
              <div className={`flex flex-col gap-10 p-6 sm:p-10 ${pinned ? "col-span-5 justify-between p-14" : "lg:col-span-5 lg:justify-between lg:p-14"}`}>
                <p className="label text-copper-light">
                  {c.code} / {c.name}
                </p>
                <div>
                  <p className="whitespace-nowrap font-display text-giga leading-[1.1] tabular">
                    {c.areaMin}
                    {c.areaMax !== c.areaMin && (
                      <>
                        <span className="font-sans font-light">–</span>
                        {c.areaMax}
                      </>
                    )}
                    <span className="ml-3 text-[0.38em]">m²</span>
                  </p>
                  <dl className="mt-8 grid gap-5 border-t border-line-dark pt-6">
                    <div>
                      <dt className="label text-mist">Yatırım tutarı</dt>
                      <dd className="mt-1 font-display text-2xl tabular sm:text-3xl">{priceLabel(c)}</dd>
                    </div>
                    <div>
                      <dt className="label text-mist">Konsept</dt>
                      <dd className="mt-1 text-lg">{c.tagline}</dd>
                    </div>
                  </dl>
                </div>
                <div className="grid gap-3">
                  <Link href={`/konseptler/${c.slug}`} className="btn-line">
                    Konsepti incele <span aria-hidden="true">↗</span>
                  </Link>
                  <Link href={`/basvuru?konsept=${c.slug}`} className="btn-solid">
                    Bu modelle başvur <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          className={`flex items-center gap-6 px-5 py-6 sm:px-8 lg:px-12 ${
            pinned ? "pointer-events-none absolute inset-x-0 bottom-0 justify-end" : "mx-auto max-w-[1600px]"
          }`}
        >
          <p className="label tabular text-mist" aria-live="polite">
            <span className="text-ivory">{String(index + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
          </p>
          <span aria-hidden="true" className="relative h-px w-32 bg-line-dark">
            <span
              className="absolute inset-y-0 left-0 bg-copper-light transition-[width] duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </span>
          {!pinned && (
            <div className="ml-auto flex gap-2">
              <button type="button" className="btn-line !min-h-11 !px-4" onClick={() => go(-1)} disabled={index === 0} aria-label="Önceki konsept">
                ←
              </button>
              <button
                type="button"
                className="btn-line !min-h-11 !px-4"
                onClick={() => go(1)}
                disabled={index === total - 1}
                aria-label="Sonraki konsept"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
