"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { JourneyStep } from "@/lib/types";

/** Yatırım süreci: kaydırdıkça çizgi ilerler ve ekranın ortasındaki aşama vurgulanır. */
export function Journey({ steps }: { steps: JourneyStep[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 60%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-step]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <section id="yatirim-sureci" aria-labelledby="surec-baslik" className="on-dark bg-anthracite text-ivory">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="label text-copper-light">Yatırım süreci</p>
            <h2 id="surec-baslik" data-reveal-lines className="mt-6 text-title uppercase">
              <span className="line-mask">
                <span style={{ ["--i" as string]: 0 }}>Başvurudan</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--i" as string]: 1 }}>açılışa.</span>
              </span>
            </h2>
            <p className="mt-8 max-w-sm text-lg text-mist">
              Coffee House yatırımınız {steps.length} aşamada ilerler. Her aşamada ekibimiz sizinle birlikte çalışır.
            </p>
            <p aria-hidden="true" className="mt-12 hidden font-display text-[9rem] leading-none text-copper-light tabular lg:block">
              {String(active + 1).padStart(2, "0")}
            </p>
          </div>
        </div>

        <ol ref={listRef} className="relative lg:col-span-6 lg:col-start-7">
          <span aria-hidden="true" className="absolute bottom-0 left-[0.55rem] top-0 w-px bg-line-dark" />
          <motion.span
            aria-hidden="true"
            className="absolute left-[0.55rem] top-0 h-full w-px origin-top bg-copper-light"
            style={{ scaleY: progress }}
          />
          {steps.map((step, i) => {
            const isActive = i <= active;
            return (
              <li
                key={step.id}
                data-step={i}
                className={`relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-16 transition-opacity duration-500 last:pb-0 ${
                  i === active ? "opacity-100" : "opacity-45"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`relative z-10 mt-2 h-[1.1rem] w-[1.1rem] border transition-colors duration-500 ${
                    isActive ? "border-copper-light bg-copper-light" : "border-mist bg-anthracite"
                  }`}
                />
                <div>
                  <p className="label tabular text-copper-light">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-display text-2xl uppercase sm:text-4xl lg:text-5xl">{step.title}</h3>
                  {step.description && <p className="mt-4 max-w-md text-lg text-mist">{step.description}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
