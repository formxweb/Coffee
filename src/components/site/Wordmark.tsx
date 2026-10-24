/** Logo yüklenmişse onu, yoksa tabeladaki gibi dar ve kalın harfli yazı logosunu gösterir. */
export function Wordmark({ logoUrl, className = "", size = "md" }: { logoUrl?: string; className?: string; size?: "md" | "lg" }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="Coffee House" className={`${size === "lg" ? "h-16" : "h-10"} w-auto ${className}`} />
    );
  }
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className={`font-display font-bold uppercase tracking-[0.04em] ${size === "lg" ? "text-4xl" : "text-[1.6rem]"}`}>
        Coffee House
      </span>
      <span lang="en" className={`mt-1 font-sans font-semibold uppercase tracking-[0.3em] opacity-75 ${size === "lg" ? "text-xs" : "text-[0.62rem]"}`}>
        Franchise
      </span>
    </span>
  );
}
