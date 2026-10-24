"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { areaLabel, priceLabel } from "@/lib/format";
import type { Concept } from "@/lib/types";
import { ConceptVisual } from "./ConceptVisual";

type Props = {
  concepts: Concept[];
  lines: [string, string, string];
  subtitle: string;
};

const BG = "#242422";

export function Hero({ concepts, lines, subtitle }: Props) {
  const [active, setActive] = useState(0);
  const visualRef = useRef<HTMLDivElement>(null);
  const current = concepts[active];

  // Fare hareketine hafif tepki veren çizim (dokunmatik ve azaltılmış hareket tercihinde kapalı)
  useEffect(() => {
    const el = visualRef.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!fine.matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -18;
        const y = (e.clientY / window.innerHeight - 0.5) * -12;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section id="top" className="on-dark relative flex min-h-[640px] flex-col overflow-hidden bg-anthracite text-ivory h-svh">
      {/* Konsept görselleri: seçime göre yumuşak geçiş */}
      <div ref={visualRef} className="absolute inset-[-24px] transition-transform duration-700 ease-out will-change-transform">
        {concepts.map((c, i) => (
          <div
            key={c.slug}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-arch)] ${
              i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
            }`}
          >
            {c.heroImageUrl ? (
              <>
                <ConceptVisual concept={c} background={BG} className="absolute inset-0" priority={i === 0} sizes="100vw" />
                <div className="absolute inset-0 bg-espresso/55" />
              </>
            ) : (
              <ConceptVisual
                concept={c}
                background={BG}
                showTitle={false}
                className="absolute inset-y-[10%] right-[-10%] w-[min(1100px,96vw)] text-copper-light/25 lg:right-[1%] lg:w-[58vw]"
              />
            )}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [--grid-color:var(--color-line-dark)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pt-28 sm:px-8 sm:pt-36 lg:px-12">
        <h1 className="text-mega max-w-[14ch] uppercase leading-[1.12] tracking-[-0.02em]">
          {lines.map((line, i) => (
            <span key={i} className="line-mask">
              <span className="rise" style={{ ["--delay" as string]: 120 + i * 110 }}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p className="fade-in mt-8 max-w-md text-lg leading-relaxed text-mist sm:text-xl" style={{ ["--delay" as string]: 520 }}>
          {subtitle}
        </p>

        <div className="mt-auto pb-0 pt-10">
          <div className="fade-in grid grid-cols-3 border-t border-line-dark" style={{ ["--delay" as string]: 700 }}>
            {concepts.map((c, i) => {
              const isActive = i === active;
              return (
                <div key={c.slug} className={`relative border-line-dark ${i > 0 ? "border-l" : ""}`}>
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-[-1px] h-px bg-copper-light transition-[width] duration-700 ease-[var(--ease-arch)] ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={`block w-full py-5 text-left sm:px-6 sm:py-7 ${i > 0 ? "pl-3" : "pr-3"}`}
                  >
                    <span className={`label block transition-colors ${isActive ? "text-copper-light" : "text-mist"}`}>{c.code}</span>
                    <span className="mt-2 block font-display text-xl uppercase tracking-[0.04em] min-[400px]:text-2xl sm:text-4xl">{c.shortName}</span>
                    <span
                      className={`mt-2 hidden text-sm text-mist transition-opacity duration-500 sm:block ${isActive ? "opacity-100" : "opacity-0"}`}
                    >
                      {areaLabel(c)} · {priceLabel(c)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          {current && (
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line-dark py-4 text-sm text-mist sm:hidden">
              <span>
                {areaLabel(current)} · {priceLabel(current)}
              </span>
              <Link href={`/konseptler/${current.slug}`} className="label text-ivory">
                İncele <span aria-hidden="true">↗</span>
              </Link>
            </div>
          )}
          <div className="hidden items-center justify-between border-t border-line-dark py-4 sm:flex">
            <p className="label text-mist" aria-live="polite">
              {current ? `${current.name} · ${current.tagline}` : ""}
            </p>
            {current && (
              <Link href={`/konseptler/${current.slug}`} className="label text-ivory underline-offset-8 hover:underline">
                Konsepti incele <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
