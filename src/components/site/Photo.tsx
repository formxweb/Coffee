import Image from "next/image";
import { SUPABASE_URL } from "@/lib/env";

/** Sitedeki yerel görseller ve Supabase depolamasındaki görseller optimize edilir; diğer adresler olduğu gibi gösterilir. */
function isOptimizable(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    return Boolean(SUPABASE_URL) && new URL(url).host === new URL(SUPABASE_URL).host;
  } catch {
    return false;
  }
}

/** Kabı dolduran fotoğraf. Kap `relative` olmalı ve bir yüksekliği ya da en-boy oranı bulunmalı. */
export function Photo({
  src,
  alt,
  sizes = "100vw",
  eager = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
}) {
  if (isOptimizable(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
