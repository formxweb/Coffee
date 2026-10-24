/** Logo yüklenmişse onu, yoksa yazı logosunu gösterir. */
export function Wordmark({ logoUrl, className = "", size = "md" }: { logoUrl?: string; className?: string; size?: "md" | "lg" }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="Coffee House" className={`${size === "lg" ? "h-16" : "h-8"} w-auto ${className}`} />
    );
  }
  return (
    <span
      className={`font-display font-medium uppercase ${size === "lg" ? "text-4xl tracking-[0.28em]" : "text-[1.05rem] tracking-[0.32em]"} ${className}`}
    >
      Coffee House
    </span>
  );
}
