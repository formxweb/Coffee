"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { areaLabel, priceShort } from "@/lib/format";
import { BUDGETS, PROPERTY_OPTIONS, matchConcepts, type BudgetValue, type PropertyValue } from "@/lib/options";
import type { Concept } from "@/lib/types";
import { SectionHead } from "./SectionHead";

const FIT_LABEL = {
  match: "Bütçenize uygun",
  edge: "Bütçenizin üst sınırında",
  below: "Bütçenizin altında kalan model",
} as const;

function Choice({
  name,
  checked,
  onChange,
  title,
  detail,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail?: string;
}) {
  return (
    <label
      className={`flex min-h-16 cursor-pointer flex-col justify-center border-2 px-5 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
        checked ? "border-blue bg-blue text-white" : "border-line bg-white hover:border-blue"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className="font-display text-2xl font-semibold uppercase leading-tight">{title}</span>
      {detail && <span className={`mt-0.5 ${checked ? "text-white/85" : "text-muted"}`}>{detail}</span>}
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
    <section id="yatirim-secici" aria-labelledby={`${id}-baslik`} className="bg-white py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <SectionHead id={`${id}-baslik`} label="Yatırım Seçici" title="Yatırımınızı şekillendirelim." className="lg:col-span-4">
          İki soruyu yanıtlayın, bütçenize uyan Coffee House modelini görün.
        </SectionHead>

        <div className="grid gap-10 lg:col-span-7 lg:col-start-6">
          <fieldset>
            <legend className="font-display text-2xl font-semibold uppercase">1. Bütçeniz ne kadar?</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {BUDGETS.map((b) => (
                <Choice key={b.value} name={`${id}-butce`} title={b.label} checked={budget === b.value} onChange={() => setBudget(b.value)} />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl font-semibold uppercase">2. Dükkânınız var mı?</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PROPERTY_OPTIONS.map((p) => (
                <Choice
                  key={p.value}
                  name={`${id}-mulk`}
                  title={p.label}
                  detail={p.detail}
                  checked={property === p.value}
                  onChange={() => setProperty(p.value)}
                />
              ))}
            </div>
          </fieldset>

          <div aria-live="polite" className="border-t-2 border-navy pt-8">
            <p className="font-display text-2xl font-semibold uppercase">Size uygun model</p>
            {!ready ? (
              <p className="mt-3 text-lg text-muted">
                {budget ? "Dükkân durumunuzu seçin." : "Bütçenizi ve dükkân durumunuzu seçtiğinizde uygun model burada görünür."}
              </p>
            ) : results.length === 0 ? (
              <p className="mt-3 text-lg text-muted">
                Bu bütçeyle örtüşen bir model bulunamadı. Başvurunuzu bırakın, seçenekleri ön görüşmede birlikte değerlendirelim.
              </p>
            ) : (
              <ul className="mt-5 grid gap-3">
                {results.map(({ concept, fit }) => (
                  <li
                    key={concept.slug}
                    className="grid gap-4 border border-line bg-paper p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"
                  >
                    <div>
                      <p className={`label ${fit === "below" ? "text-muted" : "text-blue"}`}>{FIT_LABEL[fit]}</p>
                      <p className="mt-1 font-display text-4xl font-bold uppercase leading-none">{concept.name}</p>
                      <p className="mt-2 text-lg text-muted tabular">
                        {areaLabel(concept)} · {priceShort(concept)}
                      </p>
                    </div>
                    <Link
                      href={`/basvuru?konsept=${concept.slug}&butce=${encodeURIComponent(budget!)}&mulk=${property}`}
                      className={fit === "below" ? "btn-line" : "btn-solid"}
                    >
                      Bu modelle başvur <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {ready && (
              <p className="mt-5 text-muted">
                {property === "ready"
                  ? "Hazır dükkânınızın metrekaresi model seçiminde belirleyicidir. "
                  : "Dükkânınız yoksa uygun lokasyonu ön görüşmeden sonra birlikte arıyoruz. "}
                Bu sonuç bütçeye dayalı bir ön eşleştirmedir; kesin tutar fizibilite çalışmasıyla netleşir. Kârlılık garantisi verilmez.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
