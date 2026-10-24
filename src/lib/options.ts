import type { Concept } from "@/lib/types";

export const BUDGETS = [
  { value: "2-3", label: "2–3 milyon TL", min: 2_000_000, max: 3_000_000 },
  { value: "3-4", label: "3–4 milyon TL", min: 3_000_000, max: 4_000_000 },
  { value: "4-6", label: "4–6 milyon TL", min: 4_000_000, max: 6_000_000 },
  { value: "6+", label: "6 milyon TL ve üzeri", min: 6_000_000, max: Number.POSITIVE_INFINITY },
] as const;

export type BudgetValue = (typeof BUDGETS)[number]["value"];
export const BUDGET_VALUES = BUDGETS.map((b) => b.value) as [BudgetValue, ...BudgetValue[]];

export const PROPERTY_OPTIONS = [
  { value: "ready", label: "Hazır dükkânım var", detail: "Kiralık ya da mülkiyetimde bir dükkân" },
  { value: "need_location", label: "Dükkânım yok", detail: "Lokasyon desteği istiyorum" },
] as const;

export type PropertyValue = (typeof PROPERTY_OPTIONS)[number]["value"];
export const PROPERTY_VALUES = PROPERTY_OPTIONS.map((p) => p.value) as [PropertyValue, ...PropertyValue[]];

export const CONCEPT_CHOICES = ["corner", "mahal", "agora", "undecided"] as const;
export type ConceptChoice = (typeof CONCEPT_CHOICES)[number];

export const APPLICATION_STATUSES = [
  { value: "new", label: "Yeni" },
  { value: "contacted", label: "İletişime geçildi" },
  { value: "meeting", label: "Ön görüşme" },
  { value: "location", label: "Lokasyon değerlendirmesi" },
  { value: "feasibility", label: "Fizibilite" },
  { value: "contract", label: "Planlama ve sözleşme" },
  { value: "opening", label: "Kurulum ve açılış" },
  { value: "on_hold", label: "Beklemede" },
  { value: "rejected", label: "Olumsuz" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]["value"];
export const STATUS_VALUES = APPLICATION_STATUSES.map((s) => s.value) as [ApplicationStatus, ...ApplicationStatus[]];

export function budgetLabel(value: string): string {
  return BUDGETS.find((b) => b.value === value)?.label ?? value;
}

export function propertyLabel(value: string): string {
  const p = PROPERTY_OPTIONS.find((o) => o.value === value);
  if (!p) return value;
  return p.value === "need_location" ? "Dükkânı yok, lokasyon desteği istiyor" : "Hazır dükkânı var";
}

export function statusLabel(value: string): string {
  return APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function conceptLabel(value: string, concepts: Pick<Concept, "slug" | "name">[]): string {
  if (value === "undecided") return "Kararsız";
  return concepts.find((c) => c.slug === value)?.name ?? value;
}

export type ConceptFit = "match" | "edge" | "below";

/**
 * Bütçe aralığına göre ön eşleştirme. Yalnızca fiyat aralıklarını karşılaştırır;
 * kesin uygunluk veya kârlılık hakkında bir şey söylemez.
 */
export function matchConcepts(concepts: Concept[], budget: BudgetValue): { concept: Concept; fit: ConceptFit }[] {
  const range = BUDGETS.find((b) => b.value === budget);
  if (!range) return [];
  const results: { concept: Concept; fit: ConceptFit }[] = [];
  for (const concept of concepts) {
    if (concept.priceMax < range.min) {
      results.push({ concept, fit: "below" });
    } else if (concept.priceMin <= range.max) {
      const edge = concept.priceMin === range.max && Number.isFinite(range.max);
      results.push({ concept, fit: edge ? "edge" : "match" });
    }
  }
  const order: Record<ConceptFit, number> = { match: 0, edge: 1, below: 2 };
  return results.sort((a, b) => order[a.fit] - order[b.fit] || b.concept.priceMin - a.concept.priceMin);
}
