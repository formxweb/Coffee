/** Ana sayfa açılışı: oturumda bir kez, yalnızca CSS ile oynar ve içeriği bloklamaz. */
export function IntroOverlay() {
  return (
    <div aria-hidden="true" className="intro-overlay pointer-events-none fixed inset-0 z-[80] hidden items-center justify-center bg-espresso text-ivory">
      <div className="flex flex-col items-center gap-5">
        <span className="line-mask">
          <span className="intro-word font-display text-3xl font-medium uppercase tracking-[0.42em] sm:text-5xl">Coffee House</span>
        </span>
        <span className="intro-rule block h-px w-40 origin-left bg-copper-light sm:w-64" />
        <span className="intro-sub label text-mist">
          <span lang="en">Franchise</span> · 2026
        </span>
      </div>
    </div>
  );
}
