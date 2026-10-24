export type GalleryImage = { url: string; alt: string };

export type Concept = {
  slug: string;
  sortOrder: number;
  code: string;
  name: string;
  shortName: string;
  areaMin: number;
  areaMax: number;
  priceMin: number;
  priceMax: number;
  tagline: string;
  description: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  gallery: GalleryImage[];
  isPublished: boolean;
};

export type JourneyStep = {
  id: string;
  sortOrder: number;
  title: string;
  description: string;
};

export const CONTENT_KEYS = [
  "hero.line1",
  "hero.line2",
  "hero.line3",
  "hero.subtitle",
  "about.title",
  "about.body",
  "cta.title",
  "cta.body",
  "contact.phone",
  "contact.whatsapp",
  "contact.email",
  "contact.address",
  "contact.instagram",
  "contact.website",
  "brand.logo_url",
  "legal.company_name",
  "legal.company_address",
  "legal.mersis",
  "legal.kvkk_email",
  "legal.retention",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

export type SiteText = Record<ContentKey, string>;

export type SiteData = {
  concepts: Concept[];
  journey: JourneyStep[];
  text: SiteText;
  source: "database" | "defaults";
};
