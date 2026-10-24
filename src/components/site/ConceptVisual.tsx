import Image from "next/image";
import { SUPABASE_URL } from "@/lib/env";
import type { Concept } from "@/lib/types";
import { PlanDrawing } from "./PlanDrawing";

type Props = {
  concept: Concept;
  /** Çizim modunda duvar boşlukları için zemin rengi */
  background: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  highlight?: "shell" | "bar" | "seating" | "dims" | null;
  showTitle?: boolean;
};

export function isOptimizable(url: string): boolean {
  try {
    return Boolean(SUPABASE_URL) && new URL(url).host === new URL(SUPABASE_URL).host;
  } catch {
    return false;
  }
}

export function RemoteImage({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (isOptimizable(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }
  // Yönetim panelinden girilen başka bir alan adındaki görsel: optimize edilmeden gösterilir
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className={`absolute inset-0 h-full w-full ${className}`} />;
}

/** Konseptin fotoğrafı varsa onu, yoksa temsili plan çizimini gösterir. */
export function ConceptVisual({ concept, background, className = "", sizes, priority, highlight, showTitle = true }: Props) {
  // Konumlandırma çağıranın sınıfından gelir; verilmemişse göreli konum kullanılır
  const position = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className) ? "" : "relative ";
  if (concept.heroImageUrl) {
    return (
      <div className={`${position}overflow-hidden ${className}`}>
        <RemoteImage src={concept.heroImageUrl} alt={concept.heroImageAlt ?? concept.name} sizes={sizes} priority={priority} />
      </div>
    );
  }
  return (
    <div className={`${position}${className}`}>
      <PlanDrawing concept={concept} background={background} highlight={highlight} showTitle={showTitle} className="h-full w-full" />
    </div>
  );
}
