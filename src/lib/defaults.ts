import type { Concept, GalleryImage, JourneyStep, SiteText } from "@/lib/types";

// Veritabanı bağlı değilken kullanılan içerik. supabase/migrations içindeki varsayılanlarla aynıdır.

/** Coffee House şubesinin tanıtım videosundan alınan kareler (public/images/sube). */
export const SHOP_PHOTOS = {
  cephe: { url: "/images/sube/cephe.jpg", alt: "Coffee House şubesinin cephesi ve tabelası" },
  salon: { url: "/images/sube/salon.jpg", alt: "Coffee House şubesinde oturma alanı ve tezgâh" },
  giris: { url: "/images/sube/giris.jpg", alt: "Cam bölmede Kahvenin Evine Hoşgeldiniz yazısı" },
  duvar: { url: "/images/sube/duvar.jpg", alt: "Coffee House bardağı çizilmiş duvar ve oturma minderleri" },
  tezgah: { url: "/images/sube/tezgah.jpg", alt: "Coffee House tezgâhı ve pasta vitrini" },
  neonLogo: { url: "/images/sube/neon-logo.jpg", alt: "Duvarda neon Coffee House logosu" },
  vitrin: { url: "/images/sube/vitrin.jpg", alt: "Pasta ve tatlı vitrini" },
  oturma: { url: "/images/sube/oturma.jpg", alt: "Coffee House şubesinde masa ve sandalyeler" },
  koltuk: { url: "/images/sube/koltuk.jpg", alt: "Yeşil duvarın önünde koltuklu oturma köşesi" },
  espresso: { url: "/images/sube/espresso.jpg", alt: "Coffee House logolu fincana espresso akıyor" },
  latte: { url: "/images/sube/latte.jpg", alt: "Coffee House logolu bardakta buzlu latte hazırlanıyor" },
  limonata: { url: "/images/sube/limonata.jpg", alt: "Coffee House logolu bardakta limonata" },
  pasta: { url: "/images/sube/pasta.jpg", alt: "Tabakta dilim pasta" },
  kase: { url: "/images/sube/kase.jpg", alt: "Kâsede meyveli tatlı" },
  buzluLatte: { url: "/images/sube/buzlu-latte.jpg", alt: "Tezgâhta buzlu latte" },
} satisfies Record<string, GalleryImage>;

/** Şube tanıtım videosu: dikey sürüm telefonlarda, üç panelli yatay sürüm geniş ekranlarda oynar. */
export const HERO_VIDEO = {
  portrait: "/video/coffeehouse-dikey.mp4",
  portraitPoster: "/video/coffeehouse-dikey.jpg",
  wide: "/video/coffeehouse-yatay.mp4",
  widePoster: "/video/coffeehouse-yatay.jpg",
};

const P = SHOP_PHOTOS;
const CONCEPT_MEDIA: Record<string, { hero: GalleryImage; gallery: GalleryImage[] }> = {
  corner: { hero: P.tezgah, gallery: [P.tezgah, P.espresso, P.latte, P.limonata] },
  mahal: { hero: P.oturma, gallery: [P.oturma, P.koltuk, P.vitrin, P.buzluLatte] },
  agora: { hero: P.salon, gallery: [P.salon, P.cephe, P.duvar, P.pasta] },
};

/** Panelden görsel yüklenmemiş konseptlere şube fotoğraflarını atar. */
export function withDefaultMedia(concept: Concept): Concept {
  const media = CONCEPT_MEDIA[concept.slug];
  if (!media) return concept;
  return {
    ...concept,
    heroImageUrl: concept.heroImageUrl || media.hero.url,
    heroImageAlt: concept.heroImageUrl ? concept.heroImageAlt : media.hero.alt,
    gallery: concept.gallery.length > 0 ? concept.gallery : media.gallery,
  };
}

const BASE_CONCEPTS: Concept[] = [
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
    tagline: "30 m²'lik kompakt Coffee House.",
    description:
      "Küçük bir alanda Coffee House menüsünü ve servisini sunmak isteyen yatırımcılar için kompakt model. Dükkânın yerleşimi, lokasyon değerlendirmesinden sonra alanın ölçülerine göre hazırlanır.",
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
    tagline: "100–150 m²'lik mahalle Coffee House'u.",
    description:
      "Semtinde misafir ağırlayan, oturma alanı olan bir Coffee House açmak isteyen yatırımcılar için orta ölçekli model. Dükkânın yerleşimi, lokasyon değerlendirmesinden sonra alanın ölçülerine göre hazırlanır.",
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
    tagline: "200 m²'lik geniş Coffee House.",
    description:
      "Geniş oturma alanı isteyen cadde ve merkez lokasyonları için en büyük Coffee House modeli. Dükkânın yerleşimi, lokasyon değerlendirmesinden sonra alanın ölçülerine göre hazırlanır.",
    heroImageUrl: null,
    heroImageAlt: null,
    gallery: [],
    isPublished: true,
  },
];

export const DEFAULT_CONCEPTS = BASE_CONCEPTS.map(withDefaultMedia);

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
  "hero.video_url": "",
  "hero.video_wide_url": "",
  "about.title": "Kendi dükkânımızı işletiyor, aynısını sizin için kuruyoruz.",
  "about.body":
    "Coffee House kendi şubesini işleten bir kahve markasıdır. Asıl işimiz, yatırımcılarımıza anahtar teslim Coffee House dükkânı kurmaktır.\n\n" +
    "Şubemizde ne sunuyorsak sizin dükkânınızda da onu kuruyoruz: aynı marka, aynı menü, aynı düzen. Lokasyon değerlendirmesinden açılış gününe kadar süreci birlikte yürütüyoruz.",
  "cta.title": "Bilgilerinizi bırakın, fizibilite raporuyla sizi arayalım.",
  "cta.body": "Başvuru formu birkaç dakika sürer. Ekibimiz başvurunuzu inceleyip ön görüşme için sizinle iletişime geçer.",
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
