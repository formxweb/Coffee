import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_CONCEPTS, DEFAULT_JOURNEY, DEFAULT_TEXT } from "@/lib/defaults";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import { CONTENT_KEYS, type Concept, type GalleryImage, type SiteData, type SiteText } from "@/lib/types";

export const CONTENT_TAG = "site-content";

type ConceptRow = {
  slug: string;
  sort_order: number;
  code: string;
  name: string;
  short_name: string;
  area_min: number;
  area_max: number;
  price_min: number;
  price_max: number;
  tagline: string;
  description: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  gallery: unknown;
  is_published: boolean;
};

export function mapConcept(row: ConceptRow): Concept {
  const gallery = Array.isArray(row.gallery)
    ? (row.gallery as Partial<GalleryImage>[])
        .filter((g) => typeof g?.url === "string" && g.url.startsWith("https://"))
        .map((g) => ({ url: g.url as string, alt: typeof g.alt === "string" ? g.alt : "" }))
    : [];
  return {
    slug: row.slug,
    sortOrder: row.sort_order,
    code: row.code,
    name: row.name,
    shortName: row.short_name,
    areaMin: row.area_min,
    areaMax: row.area_max,
    priceMin: Number(row.price_min),
    priceMax: Number(row.price_max),
    tagline: row.tagline,
    description: row.description,
    heroImageUrl: row.hero_image_url,
    heroImageAlt: row.hero_image_alt,
    gallery,
    isPublished: row.is_published,
  };
}

const DEFAULT_DATA: SiteData = {
  concepts: DEFAULT_CONCEPTS,
  journey: DEFAULT_JOURNEY,
  text: DEFAULT_TEXT,
  source: "defaults",
};

/** Sitenin tüm içeriği: konseptler, süreç adımları ve metinler. Yönetim panelinde değişince yenilenir. */
export async function getSiteData(): Promise<SiteData> {
  "use cache";
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured) {
    cacheLife("max");
    return DEFAULT_DATA;
  }

  try {
    const supabase = createPublicClient();
    const [concepts, journey, text] = await Promise.all([
      supabase.from("concepts").select("*").eq("is_published", true).order("sort_order"),
      supabase.from("journey_steps").select("id, sort_order, title, description").order("sort_order"),
      supabase.from("site_content").select("key, value"),
    ]);
    if (concepts.error || journey.error || text.error) {
      throw concepts.error ?? journey.error ?? text.error;
    }

    const siteText: SiteText = { ...DEFAULT_TEXT };
    for (const row of text.data ?? []) {
      if ((CONTENT_KEYS as readonly string[]).includes(row.key)) {
        siteText[row.key as keyof SiteText] = row.value;
      }
    }

    cacheLife("hours");
    return {
      concepts: (concepts.data as ConceptRow[]).map(mapConcept),
      journey: (journey.data ?? []).map((s) => ({
        id: s.id,
        sortOrder: s.sort_order,
        title: s.title,
        description: s.description,
      })),
      text: siteText,
      source: "database",
    };
  } catch (error) {
    console.error("[içerik] Supabase okunamadı, varsayılan içerik kullanılıyor:", error);
    cacheLife("minutes");
    return DEFAULT_DATA;
  }
}
