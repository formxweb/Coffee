import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Coffee House Franchise | Bayilik ve Yatırım Fırsatları",
    template: "%s | Coffee House Franchise",
  },
  description:
    "Coffee House franchise modelleri: Corner CH (30 m²), Mahal CH (100–150 m²) ve Agora CH (200 m²). Konseptleri inceleyin, bayilik başvurunuzu yapın.",
  applicationName: "Coffee House Franchise",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Coffee House Franchise",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Coffee House Franchise" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0f1d38",
  colorScheme: "light",
};

// İlk boyamadan önce: kaydırınca beliren öğeler yalnızca JS çalışıyorsa gizlenir
const bootScript = `document.documentElement.classList.add('js');`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${barlow.variable} ${barlowCondensed.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
