import type { Concept } from "@/lib/types";

const tl = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

/** 2000000 → "2.000.000 TL" */
export function formatTL(value: number): string {
  return `${tl.format(value)} TL`;
}

/** Konsept fiyatı: "2.000.000 TL" ya da "3.000.000–4.000.000 TL" */
export function priceLabel(c: Pick<Concept, "priceMin" | "priceMax">): string {
  return c.priceMin === c.priceMax ? formatTL(c.priceMin) : `${tl.format(c.priceMin)}–${tl.format(c.priceMax)} TL`;
}

/** Konsept alanı: "30 m²" ya da "100–150 m²" */
export function areaLabel(c: Pick<Concept, "areaMin" | "areaMax">): string {
  return c.areaMin === c.areaMax ? `${c.areaMin} m²` : `${c.areaMin}–${c.areaMax} m²`;
}

/** Milyon olarak kısa gösterim: 2000000 → "2", 3500000 → "3,5" */
export function millions(value: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value / 1_000_000);
}

export function millionsLabel(c: Pick<Concept, "priceMin" | "priceMax">): string {
  return c.priceMin === c.priceMax ? millions(c.priceMin) : `${millions(c.priceMin)}–${millions(c.priceMax)}`;
}

/** "+905321234567" → "0 (532) 123 45 67" */
export function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, "").replace(/^90/, "");
  if (d.length !== 10) return e164;
  return `0 (${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(
    new Date(iso),
  );
}

/** WhatsApp bağlantısı için yalnızca rakamlar: "+90 532 ..." → "90532..." */
export function waNumber(value: string): string {
  return value.replace(/\D/g, "");
}
