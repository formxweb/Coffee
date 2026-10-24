import { BUDGET_VALUES, CONCEPT_CHOICES, PROPERTY_VALUES, STATUS_VALUES } from "@/lib/options";
import { ILLER } from "@/lib/tr-locations";

export type ApplicationFilters = {
  q: string;
  durum: string;
  konsept: string;
  butce: string;
  mulk: string;
  il: string;
  ilce: string;
  baslangic: string;
  bitis: string;
  sayfa: number;
};

const pick = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const oneOf = (v: unknown, allowed: readonly string[]) => {
  const s = String(pick(v) ?? "");
  return allowed.includes(s) ? s : "";
};
const isoDate = (v: unknown) => {
  const s = String(pick(v) ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
};

export function parseFilters(sp: Record<string, string | string[] | undefined>): ApplicationFilters {
  return {
    q: String(pick(sp.q) ?? "").slice(0, 80).trim(),
    durum: oneOf(sp.durum, STATUS_VALUES),
    konsept: oneOf(sp.konsept, CONCEPT_CHOICES),
    butce: oneOf(sp.butce, BUDGET_VALUES),
    mulk: oneOf(sp.mulk, PROPERTY_VALUES),
    il: oneOf(sp.il, ILLER),
    ilce: String(pick(sp.ilce) ?? "").slice(0, 60).trim(),
    baslangic: isoDate(sp.baslangic),
    bitis: isoDate(sp.bitis),
    sayfa: Math.max(1, Math.min(10_000, Number.parseInt(String(pick(sp.sayfa) ?? "1"), 10) || 1)),
  };
}

export function filtersToQuery(f: ApplicationFilters, overrides: Partial<ApplicationFilters> = {}): string {
  const merged = { ...f, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (k === "sayfa" ? Number(v) > 1 : v) params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

// PostgREST filtresinde anlamı olan karakterleri arama metninden çıkar
const clean = (s: string) => s.replace(/[,()*%\\:"']/g, " ").trim();

// Supabase sorgu oluşturucusunun türü çok derin olduğundan burada gevşek tür kullanılır
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

export function applyFilters<Q>(query: Q, f: ApplicationFilters): Q {
  let q: AnyQuery = query;
  if (f.durum) q = q.eq("status", f.durum);
  if (f.konsept) q = q.eq("concept", f.konsept);
  if (f.butce) q = q.eq("budget", f.butce);
  if (f.mulk) q = q.eq("property_status", f.mulk);
  if (f.il) q = q.eq("city", f.il);
  if (f.ilce) q = q.ilike("district", `%${clean(f.ilce)}%`);
  if (f.baslangic) q = q.gte("created_at", `${f.baslangic}T00:00:00+03:00`);
  if (f.bitis) {
    const end = new Date(`${f.bitis}T00:00:00+03:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    q = q.lt("created_at", end.toISOString());
  }
  const text = clean(f.q);
  if (text) {
    const digits = text.replace(/\D/g, "").replace(/^0+/, "").replace(/^90/, "");
    const parts = [`full_name.ilike.%${text}%`, `ref_code.ilike.%${text}%`, `email.ilike.%${text}%`];
    if (digits.length >= 3) parts.push(`phone.ilike.%${digits}%`);
    q = q.or(parts.join(","));
  }
  return q as Q;
}
