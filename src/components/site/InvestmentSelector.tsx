"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { areaLabel, priceLabel } from "@/lib/format";
import { BUDGETS, PROPERTY_OPTIONS, matchConcepts, type BudgetValue, type PropertyValue } from "@/lib/options";
import type { Concept } from "@/lib/types";

const FIT_LABEL = {
  match: "Bütçenizle uyumlu",
  edge: "Başlangıç tutarı bütçenizin üst sınırında",
  below: "Bütçenizin altında kalan konsept",
} as const;

function OptionRow({
  name,
  value,
  checked,
  onChange,
  title,
  detail,
  index,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail?: string;
  index: string;
}) {
  return (
    <label
      className={`group flex cursor-pointer items-baseline gap-5 border-b border-line py-5 transition-colors ${
        checked ? "text-ink" : "text-stone hover:text-ink"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="label w-8 shrink-0 tabular">{index}</span>
      <span className="flex-1 font-display text-3xl uppercase leading-none sm:text-4xl peer-focus-visible:underline peer-focus-visible:decoration-copper peer-focus-visible:underline-offset-8">
        {title}
        {detail && <span className="mt-2 block font-sans text-sm normal-case tracking-normal text-stone">{detail}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`h-3 w-3 shrink-0 border border-current transition-colors ${checked ? "border-copper bg-copper" : ""}`}
      />
    </label>
  );
}

export function InvestmentSelector({ concepts }: { concepts: Concept[] }) {
  const [budget, setBudget] = useState<BudgetValue | null>(null);
  const [property, setProperty] = useState<PropertyValue | null>(null);
  const id = useId();
  const results = budget ? matchConcepts(concepts, budget) : [];
  const ready = Boolean(budget && property);

  return (
    <section id="yatirim-secici" aria-labelledby={`${id}-baslik`} className="bg-ivory">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-12">
          <p className="label text-copper-ink">Yatırım seçici</p>
          <h2 id={`${id}-baslik`} data-reveal-lines className="mt-6 text-giga uppercase">
            <span className="line-mask">
              <span style={{ ["--i" as string]: 0 }}>Yatırımınızı</span>
            </span>
            <span className="line-mask">
              <span style={{ ["--i" as string]: 1 }}>şekillendirelim.</span>
            </span>
          </h2>
        </div>

        <p data-reveal className="max-w-sm text-lg text-stone lg:col-span-3">
          Bütçenizi ve mülk durumunuzu seçin; bütçe aralığınızla örtüşen Coffee House konseptlerini görün.
        </p>

        <div className="lg:col-span-7 lg:col-start-6">
          <fieldset>
            <legend className="label mb-2 text-copper-ink">01 · Bütçe aralığı</legend>
            <div className="border-t border-line">
              {BUDGETS.map((b, i) => (
                <OptionRow
                  key={b.value}
                  name={`${id}-butce`}
                  value={b.value}
                  index={String.fromCharCode(65 + i)}
                  title={b.label}
                  checked={budget === b.value}
                  onChange={() => setBudget(b.value)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-14">
            <legend className="label mb-2 text-copper-ink">02 · Mülk durumu</legend>
            <div className="border-t border-line">
              {PROPERTY_OPTIONS.map((p, i) => (
                <OptionRow
                  key={p.value}
                  name={`${id}-mulk`}
                  value={p.value}
                  index={String.fromCharCode(65 + i)}
                  title={p.label}
                  detail={p.detail}
                  checked={property === p.value}
                  onChange={() => setProperty(p.value)}
                />
              ))}
            </div>
          </fieldset>

          <div className="mt-14" aria-live="polite">
            <p className="label mb-2 text-copper-ink">03 · Ön eşleştirme</p>
            {!ready ? (
              <p className="border-t border-line py-6 text-stone">
                {budget ? "Mülk durumunuzu seçin." : "Bütçe aralığınızı ve mülk durumunuzu seçin; uyumlu konseptler burada listelenir."}
              </p>
            ) : results.length === 0 ? (
              <p className="border-t border-line py-6 text-stone">
                Bu bütçe aralığıyla örtüşen bir konsept bulunamadı. Başvurunuzu bırakın, seçenekleri ön görüşmede birlikte değerlendirelim.
              </p>
            ) : (
              <ul className="border-t border-line">
                {results.map(({ concept, fit }) => (
                  <li key={concept.slug} className="grid gap-4 border-b border-line py-6 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <p className={`label ${fit === "below" ? "text-stone" : "text-copper-ink"}`}>{FIT_LABEL[fit]}</p>
                      <p className="mt-2 font-display text-4xl uppercase leading-none">{concept.name}</p>
                      <p className="mt-2 text-stone tabular">
                        {areaLabel(concept)} · {priceLabel(concept)}
                      </p>
                    </div>
                    <Link
                      href={`/basvuru?konsept=${concept.slug}&butce=${encodeURIComponent(budget!)}&mulk=${property}`}
                      className="btn-line"
                    >
                      Bu modelle başvur <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {ready && (
              <p className="mt-6 text-sm text-stone">
                {property === "ready"
                  ? `Hazır dükkânınızın metrekaresi konsept seçiminde belirleyicidir: ${concepts
                      .map((c) => `${c.name} ${areaLabel(c)}`)
                      .join(", ")}. `
                  : "Dükkânınız yoksa aday lokasyonları ön görüşmeden sonra birlikte değerlendiririz. "}
                Bu sonuç yalnızca bütçe aralığına dayalı bir ön eşleştirmedir; kesin uygunluk ön görüşme ve fizibilite çalışmasıyla belirlenir.
                Kârlılık garantisi verilmez.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
