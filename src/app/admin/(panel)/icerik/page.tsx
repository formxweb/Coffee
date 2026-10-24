import type { Metadata } from "next";
import { Suspense } from "react";
import { ConceptEditor, JourneyEditor, SiteTextEditor } from "@/components/admin/ContentEditors";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { mapConcept } from "@/lib/content";
import { DEFAULT_TEXT } from "@/lib/defaults";
import { CONTENT_KEYS, type SiteText } from "@/lib/types";

export const metadata: Metadata = { title: "İçerik ve fiyatlar" };

async function Editors() {
  const { supabase } = await requireAdmin();
  const [concepts, journey, text] = await Promise.all([
    supabase.from("concepts").select("*").order("sort_order"),
    supabase.from("journey_steps").select("id, sort_order, title, description").order("sort_order"),
    supabase.from("site_content").select("key, value"),
  ]);
  if (concepts.error || journey.error || text.error) {
    return <p className="px-5 py-10 text-danger sm:px-8 lg:px-12">İçerik yüklenemedi. Sayfayı yenileyin.</p>;
  }
  const siteText: SiteText = { ...DEFAULT_TEXT };
  for (const row of text.data ?? []) {
    if ((CONTENT_KEYS as readonly string[]).includes(row.key)) siteText[row.key as keyof SiteText] = row.value;
  }

  return (
    <div className="grid gap-20 px-5 pb-20 pt-8 sm:px-8 lg:px-12">
      <section id="konseptler" aria-labelledby="konseptler-baslik">
        <h2 id="konseptler-baslik" className="text-4xl">Konseptler ve fiyatlar</h2>
        <p className="mt-3 max-w-2xl text-stone">
          Fiyat, metrekare ve metin değişiklikleri kaydedildiği anda sitede görünür. Yatırım tutarı tek ise en düşük ve en yüksek alanlara aynı tutarı yazın.
        </p>
        <div className="mt-8 grid gap-14">
          {concepts.data.map((row) => {
            const c = mapConcept(row);
            return <ConceptEditor key={c.slug} concept={c} />;
          })}
        </div>
      </section>
      <section id="surec" aria-labelledby="surec-baslik">
        <h2 id="surec-baslik" className="text-4xl">Yatırım süreci</h2>
        <p className="mt-3 max-w-2xl text-stone">Ana sayfadaki süreç adımları. Sıralamayı oklarla değiştirebilir, adım ekleyip silebilirsiniz.</p>
        <div className="mt-8">
          <JourneyEditor
            steps={(journey.data ?? []).map((s) => ({ id: s.id, sortOrder: s.sort_order, title: s.title, description: s.description }))}
          />
        </div>
      </section>
      <section id="metinler" aria-labelledby="metinler-baslik">
        <h2 id="metinler-baslik" className="text-4xl">Site metinleri</h2>
        <p className="mt-3 max-w-2xl text-stone">Ana sayfa metinleri, iletişim bilgileri ve yasal metinlerde kullanılan şirket bilgileri.</p>
        <div className="mt-8">
          <SiteTextEditor text={siteText} />
        </div>
      </section>
    </div>
  );
}

export default function ContentPage() {
  return (
    <>
      <PageHeader title="İçerik ve fiyatlar" eyebrow="Site yönetimi">
        <nav aria-label="Bölümler" className="flex flex-wrap gap-6 text-sm">
          <a href="#konseptler" className="text-stone hover:text-ink">Konseptler</a>
          <a href="#surec" className="text-stone hover:text-ink">Yatırım süreci</a>
          <a href="#metinler" className="text-stone hover:text-ink">Site metinleri</a>
        </nav>
      </PageHeader>
      <Suspense fallback={<PanelSkeleton rows={12} />}>
        <Editors />
      </Suspense>
    </>
  );
}
