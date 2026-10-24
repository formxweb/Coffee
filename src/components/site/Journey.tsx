import type { JourneyStep } from "@/lib/types";
import { SectionHead } from "./SectionHead";

/** Başvurudan açılışa kadar adımlar. Adımlar yönetim panelinden düzenlenir. */
export function Journey({ steps }: { steps: JourneyStep[] }) {
  return (
    <section id="yatirim-sureci" aria-labelledby="surec-baslik" className="on-dark bg-navy py-20 text-white sm:py-28">
      <div className="shell">
        <SectionHead id="surec-baslik" label="Yatırım Süreci" title={`${steps.length} adımda kendi Coffee House'unuz`} dark>
          Başvurudan açılış gününe kadar süreci sizinle birlikte yürütüyoruz.
        </SectionHead>

        <ol className="mt-14 grid gap-px border border-line-dark bg-line-dark sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.id} data-reveal style={{ ["--delay" as string]: (i % 3) * 80 }} className="bg-navy p-7 sm:p-9">
              <span className="font-display text-5xl font-bold leading-none text-blue-light tabular">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 text-2xl uppercase sm:text-3xl">{step.title}</h3>
              <p className="mt-3 text-soft">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
