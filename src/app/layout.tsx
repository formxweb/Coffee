import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
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
  themeColor: "#1b1411",
  colorScheme: "light",
};

// İlk boyamadan önce: JS sınıfı ve oturumda bir kez oynayan açılış animasyonu
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(location.pathname==='/'&&!sessionStorage.getItem('ch-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-play');sessionStorage.setItem('ch-intro','1');setTimeout(function(){d.classList.remove('intro-play')},3200)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${bodoni.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
