import { ConceptList } from "@/components/site/ConceptList";
import { Hero } from "@/components/site/Hero";
import { About, Contact, CtaBand } from "@/components/site/HomeSections";
import { InvestmentSelector } from "@/components/site/InvestmentSelector";
import { Journey } from "@/components/site/Journey";
import { getSiteData } from "@/lib/content";
import { SITE_URL } from "@/lib/env";

export default async function HomePage() {
  const { concepts, journey, text } = await getSiteData();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Coffee House",
    url: SITE_URL,
    sameAs: [text["contact.instagram"], text["contact.website"]].filter(Boolean),
  };

  return (
    <>
      <Hero text={text} concepts={concepts} />
      <ConceptList concepts={concepts} />
      <About text={text} />
      <Journey steps={journey} />
      <InvestmentSelector concepts={concepts} />
      <CtaBand text={text} />
      <Contact text={text} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
