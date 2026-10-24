import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/content";
import { SITE_URL } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { concepts } = await getSiteData();
  const pages = ["", "/basvuru", "/kvkk", "/gizlilik", "/kullanim-sartlari", "/cerez-politikasi"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : p === "/basvuru" ? 0.9 : 0.3 })),
    ...concepts.map((c) => ({ url: `${SITE_URL}/konseptler/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
