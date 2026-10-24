"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/#konseptler", label: "Konseptler" },
  { href: "/#yatirim-sureci", label: "Yatırım Süreci" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#iletisim", label: "İletişim" },
];

/** Koyu bir açılış ekranı üzerinde başlayan sayfalarda menü şeffaf ve açık renkli başlar. */
const DARK_TOP = [/^\/$/, /^\/konseptler\/[^/]+$/];

export function SiteHeader({ logoUrl }: { logoUrl?: string }) {
  return <HeaderInner logoUrl={logoUrl} pathname={usePathname()} />;
}

/** Adres henüz bilinmezken (akış sırasında) gösterilen başlık */
export function SiteHeaderFallback({ logoUrl }: { logoUrl?: string }) {
  return <HeaderInner logoUrl={logoUrl} pathname="" />;
}

function HeaderInner({ logoUrl, pathname }: { logoUrl?: string; pathname: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overDark = DARK_TOP.some((r) => r.test(pathname)) && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        open
          ? "bg-espresso text-ivory on-dark"
          : overDark
            ? "bg-transparent text-ivory on-dark"
            : "border-b border-line bg-ivory text-ink"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-5 sm:h-20 sm:px-8 lg:px-12">
        <Link href="/" className="mr-auto" aria-label="Coffee House ana sayfa" onClick={() => setOpen(false)}>
          <Wordmark logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Ana menü" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="label opacity-80 transition-opacity hover:opacity-100">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/basvuru" className="btn-solid hidden !min-h-11 !py-2.5 sm:inline-flex">
          Bayilik Başvurusu <span aria-hidden="true">↗</span>
        </Link>

        <button
          type="button"
          className="relative grid h-11 w-11 place-items-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobil-menu"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`absolute h-px w-6 bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1"}`} />
          <span className={`absolute h-px w-6 bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1"}`} />
        </button>
      </div>

      <div id="mobil-menu" hidden={!open} className="h-[calc(100svh-4rem)] overflow-y-auto bg-espresso px-5 pb-10 sm:h-[calc(100svh-5rem)] sm:px-8 lg:hidden">
        <nav aria-label="Mobil menü" className="border-t border-line-dark">
          <ul>
            {NAV.map((item, i) => (
              <li key={item.href} className="border-b border-line-dark">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-5 py-5 font-display text-4xl uppercase"
                >
                  <span className="label text-mist">0{i + 1}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/basvuru" onClick={() => setOpen(false)} className="btn-solid mt-8 w-full">
          Bayilik Başvurusu <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
