import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationWizard } from "@/components/apply/ApplicationWizard";
import { getSiteData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Bayilik Başvurusu",
  description: "Coffee House bayilik başvurusu: konseptinizi, lokasyonunuzu ve bütçenizi seçin, başvurunuzu beş adımda tamamlayın.",
  alternates: { canonical: "/basvuru" },
};

function WizardShell() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-24 sm:px-8 sm:pt-32 lg:px-12" aria-busy="true">
      <div className="pt-4">
        <p className="label text-blue-ink">Adım 1 / 5 · Konsept</p>
        <div className="mt-3 h-px bg-line">
          <div className="h-px w-1/5 bg-blue" />
        </div>
      </div>
      <h1 className="mt-10 max-w-[18ch] text-title lg:mt-16">Hangi Coffee House konseptine yatırım yapmak istiyorsunuz?</h1>
    </div>
  );
}

export default async function ApplyPage() {
  const { concepts, text } = await getSiteData();
  return (
    <div className="min-h-svh bg-white">
      <Suspense fallback={<WizardShell />}>
        <ApplicationWizard
          concepts={concepts}
          contact={{ phone: text["contact.phone"], email: text["contact.email"], whatsapp: text["contact.whatsapp"] }}
        />
      </Suspense>
    </div>
  );
}
