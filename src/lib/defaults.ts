import type { Concept, JourneyStep, SiteText } from "@/lib/types";

// Veritabanı bağlı değilken kullanılan içerik. supabase/migrations içindeki varsayılanlarla aynıdır.

export const DEFAULT_CONCEPTS: Concept[] = [
  {
    slug: "corner",
    sortOrder: 1,
    code: "01",
    name: "Corner CH",
    shortName: "CORNER",
    areaMin: 30,
    areaMax: 30,
    priceMin: 2_000_000,
    priceMax: 2_000_000,
    tagline: "Kompakt Coffee House konsepti.",
    description:
      "Corner CH, Coffee House deneyimini 30 m²'lik bir alana taşıyan kompakt konsepttir. Lokasyon ve yerleşim, ön görüşme ve lokasyon değerlendirmesinde birlikte belirlenir.",
    heroImageUrl: null,
    heroImageAlt: null,
    gallery: [],
    isPublished: true,
  },
  {
    slug: "mahal",
    sortOrder: 2,
    code: "02",
    name: "Mahal CH",
    shortName: "MAHAL",
    areaMin: 100,
    areaMax: 150,
    priceMin: 3_000_000,
    priceMax: 4_000_000,
    tagline: "Orta ölçekli Coffee House konsepti.",
    description:
      "Mahal CH, 100 ile 150 m² arasındaki alanlar için kurgulanan orta ölçekli Coffee House konseptidir. Lokasyon ve yerleşim, ön görüşme ve lokasyon değerlendirmesinde birlikte belirlenir.",
    heroImageUrl: null,
    heroImageAlt: null,
    gallery: [],
    isPublished: true,
  },
  {
    slug: "agora",
    sortOrder: 3,
    code: "03",
    name: "Agora CH",
    shortName: "AGORA",
    areaMin: 200,
    areaMax: 200,
    priceMin: 6_000_000,
    priceMax: 6_000_000,
    tagline: "Geniş ölçekli Coffee House konsepti.",
    description:
      "Agora CH, 200 m²'lik alanlar için kurgulanan geniş ölçekli Coffee House konseptidir. Lokasyon ve yerleşim, ön görüşme ve lokasyon değerlendirmesinde birlikte belirlenir.",
    heroImageUrl: null,
    heroImageAlt: null,
    gallery: [],
    isPublished: true,
  },
];

export const DEFAULT_JOURNEY: JourneyStep[] = [
  { id: "1", sortOrder: 1, title: "Başvuru", description: "Bayilik başvuru formunu doldurursunuz; başvurunuz bir referans numarasıyla kayda alınır." },
  { id: "2", sortOrder: 2, title: "Ön Görüşme", description: "Ekibimiz sizinle iletişime geçer; hedeflerinizi, bütçenizi ve beklentilerinizi konuşuruz." },
  { id: "3", sortOrder: 3, title: "Lokasyon Değerlendirmesi", description: "Hazır dükkânınızı ya da aday lokasyonları konseptin ihtiyaçlarına göre birlikte değerlendiririz." },
  { id: "4", sortOrder: 4, title: "Fizibilite Çalışması", description: "Lokasyona özel fizibilite çalışmasıyla yatırımın çerçevesini netleştiririz." },
  { id: "5", sortOrder: 5, title: "Planlama ve Sözleşme", description: "Konsept, takvim ve koşullar netleştiğinde franchise sözleşmesi imzalanır." },
  { id: "6", sortOrder: 6, title: "Kurulum ve Açılış", description: "Kurulum tamamlanır ve Coffee House işletmeniz misafirlerini karşılar." },
];

export const DEFAULT_TEXT: SiteText = {
  "hero.line1": "Bir marka.",
  "hero.line2": "Üç konsept.",
  "hero.line3": "Sınırsız vizyon.",
  "hero.subtitle": "Coffee House yatırım modelleriyle kendi işletmenizi hayata geçirin.",
  "about.title": "Kahve markası, franchise odağı.",
  "about.body":
    "Coffee House bir kahve dükkânı markasıdır; bugün odağında markayı franchise modeliyle yeni lokasyonlara taşımak var. Corner, Mahal ve Agora konseptleri, farklı ölçek ve bütçedeki yatırımcılara aynı marka deneyimini sunmak için üç ayrı ölçekte kurgulandı.",
  "cta.title": "Coffee House yatırımınızı birlikte planlayalım.",
  "cta.body": "Başvurunuzu bırakın; ekibimiz ön görüşme için sizinle iletişime geçsin.",
  "contact.phone": "",
  "contact.whatsapp": "",
  "contact.email": "",
  "contact.address": "",
  "contact.instagram": "https://www.instagram.com/_coffeehouse.tr",
  "contact.website": "https://www.coffeehousetr.com",
  "brand.logo_url": "",
  "legal.company_name": "",
  "legal.company_address": "",
  "legal.mersis": "",
  "legal.kvkk_email": "",
  "legal.retention": "2 yıl",
};
