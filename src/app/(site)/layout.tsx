import { AttributionCapture } from "@/components/site/AttributionCapture";
import { Suspense } from "react";
import { MobileApplyBar } from "@/components/site/MobileApplyBar";
import { RevealObserver } from "@/components/site/RevealObserver";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader, SiteHeaderFallback } from "@/components/site/SiteHeader";
import { getSiteData } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { text, concepts } = await getSiteData();
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-ivory focus:px-4 focus:py-3 focus:text-ink"
      >
        İçeriğe geç
      </a>
      <Suspense fallback={<SiteHeaderFallback logoUrl={text["brand.logo_url"]} />}>
        <SiteHeader logoUrl={text["brand.logo_url"]} />
      </Suspense>
      <main id="icerik">{children}</main>
      <SiteFooter text={text} concepts={concepts} />
      <Suspense fallback={null}>
        <MobileApplyBar />
        <RevealObserver />
      </Suspense>
      <AttributionCapture />
    </>
  );
}
