import Link from "next/link";
import { getImageProps } from "next/image";
import { HERO_VIDEO } from "@/lib/defaults";
import { areaLabel, priceShort } from "@/lib/format";
import type { Concept, SiteText } from "@/lib/types";
import { HeroVideo, HeroVideoToggle } from "./HeroVideo";

function Poster() {
  const common = { alt: "", sizes: "100vw", fetchPriority: "high" as const, loading: "eager" as const };
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: HERO_VIDEO.widePoster, width: 1920, height: 1130 });
  const {
    props: { srcSet: portrait, ...rest },
  } = getImageProps({ ...common, src: HERO_VIDEO.portraitPoster, width: 716, height: 1274 });
  return (
    <picture>
      <source media="(min-aspect-ratio: 1/1)" srcSet={wide} />
      <source srcSet={portrait} />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...rest} className="absolute inset-0 h-full w-full object-cover" />
    </picture>
  );
}

/** Tam ekran giriş: arka planda şube videosu, üzerinde başlık ve başvuru butonu */
export function Hero({ text, concepts }: { text: SiteText; concepts: Concept[] }) {
  const customPortrait = text["hero.video_url"];
  const customWide = text["hero.video_wide_url"];
  const custom = Boolean(customPortrait || customWide);
  const lines = [text["hero.line1"], text["hero.line2"], text["hero.line3"]].filter(Boolean);

  return (
    <section aria-labelledby="hero-baslik" className="on-dark relative isolate flex min-h-svh flex-col overflow-hidden bg-navy-deep text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {!custom && <Poster />}
        <HeroVideo
          portrait={custom ? customPortrait || customWide : HERO_VIDEO.portrait}
          wide={custom ? customWide || customPortrait : HERO_VIDEO.wide}
        />
        <div className="absolute inset-0 bg-navy-deep/60" />
      </div>

      <div className="shell relative flex flex-1 flex-col justify-center pb-12 pt-28 sm:pt-36">
        <p className="label fade-up text-white/85">
          Coffee House <span lang="en">Franchise</span>
        </p>
        <h1 id="hero-baslik" className="mt-5 text-hero uppercase">
          {lines.map((line, i) => (
            <span key={i} className="fade-up block" style={{ ["--delay" as string]: 120 + i * 120 }}>
              {line}
            </span>
          ))}
        </h1>
        <p className="fade-up mt-6 max-w-xl text-xl leading-snug text-white/90 sm:text-2xl" style={{ ["--delay" as string]: 500 }}>
          {text["hero.subtitle"]}
        </p>
        <div className="fade-up mt-9 flex flex-col gap-3 min-[420px]:flex-row" style={{ ["--delay" as string]: 620 }}>
          <Link href="/basvuru" className="btn-white">
            Bayilik Başvurusu <span aria-hidden="true">↗</span>
          </Link>
          <Link href="#konseptler" className="btn-line">
            Yatırım Modelleri
          </Link>
        </div>
        <HeroVideoToggle className="mt-8 self-start" />
      </div>

      <nav aria-label="Yatırım modelleri" className="relative hidden border-t border-line-dark bg-navy-deep/75 sm:block">
        <ul className="shell grid grid-cols-3">
          {concepts.map((c, i) => (
            <li key={c.slug} className={i > 0 ? "border-l border-line-dark" : ""}>
              <Link
                href={`/konseptler/${c.slug}`}
                className={`group flex h-full flex-col gap-1 py-5 lg:flex-row lg:items-end lg:justify-between lg:gap-4 ${i > 0 ? "pl-5 lg:pl-8" : ""} ${
                  i < concepts.length - 1 ? "pr-5 lg:pr-8" : ""
                }`}
              >
                <span>
                  <span className="block font-display text-2xl font-bold uppercase leading-none group-hover:underline group-hover:underline-offset-4 lg:text-3xl">
                    {c.name}
                  </span>
                  <span className="mt-1.5 block text-white/75 tabular">{areaLabel(c)}</span>
                </span>
                <span className="font-display text-xl font-semibold tabular text-blue-light lg:text-2xl">{priceShort(c)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
