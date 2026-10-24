import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { StatusMark } from "@/components/admin/Status";
import { requireAdmin } from "@/lib/admin/auth";
import { applyFilters, filtersToQuery, parseFilters, type ApplicationFilters } from "@/lib/admin/filters";
import { getSiteData } from "@/lib/content";
import { formatDateTime, formatPhone } from "@/lib/format";
import { APPLICATION_STATUSES, BUDGETS, budgetLabel, conceptLabel } from "@/lib/options";
import { ILLER } from "@/lib/tr-locations";

export const metadata: Metadata = { title: "Başvurular" };

const PAGE_SIZE = 25;
type SP = Promise<Record<string, string | string[] | undefined>>;

function FilterBar({ f, concepts }: { f: ApplicationFilters; concepts: { slug: string; name: string }[] }) {
  const field = "w-full border-0 border-b border-line bg-transparent py-2 text-sm focus:border-blue focus:outline-none";
  return (
    <form method="get" className="grid gap-x-6 gap-y-5 border-b border-line py-6 sm:grid-cols-2 lg:grid-cols-6" role="search">
      <div className="sm:col-span-2">
        <label htmlFor="f-q" className="label text-muted">Ara</label>
        <input id="f-q" name="q" defaultValue={f.q} placeholder="Ad, telefon, e-posta ya da referans" className={field} />
      </div>
      <div>
        <label htmlFor="f-durum" className="label text-muted">Durum</label>
        <select id="f-durum" name="durum" defaultValue={f.durum} className={field}>
          <option value="">Tümü</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-konsept" className="label text-muted">Konsept</label>
        <select id="f-konsept" name="konsept" defaultValue={f.konsept} className={field}>
          <option value="">Tümü</option>
          {concepts.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
          <option value="undecided">Kararsız</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-butce" className="label text-muted">Bütçe</label>
        <select id="f-butce" name="butce" defaultValue={f.butce} className={field}>
          <option value="">Tümü</option>
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-mulk" className="label text-muted">Mülk</label>
        <select id="f-mulk" name="mulk" defaultValue={f.mulk} className={field}>
          <option value="">Tümü</option>
          <option value="ready">Hazır dükkânı var</option>
          <option value="need_location">Lokasyon desteği</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-il" className="label text-muted">İl</label>
        <select id="f-il" name="il" defaultValue={f.il} className={field}>
          <option value="">Tümü</option>
          {ILLER.map((il) => (
            <option key={il} value={il}>{il}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-ilce" className="label text-muted">İlçe</label>
        <input id="f-ilce" name="ilce" defaultValue={f.ilce} className={field} />
      </div>
      <div>
        <label htmlFor="f-bas" className="label text-muted">Başlangıç</label>
        <input id="f-bas" name="baslangic" type="date" defaultValue={f.baslangic} className={field} />
      </div>
      <div>
        <label htmlFor="f-bit" className="label text-muted">Bitiş</label>
        <input id="f-bit" name="bitis" type="date" defaultValue={f.bitis} className={field} />
      </div>
      <div className="flex items-end gap-4 sm:col-span-2">
        <button type="submit" className="btn-line !min-h-11 flex-1">
          Filtrele <span aria-hidden="true">↗</span>
        </button>
        <Link href="/admin/basvurular" className="label py-3 text-muted hover:text-ink">
          Temizle
        </Link>
      </div>
    </form>
  );
}

async function ApplicationList({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const { supabase } = await requireAdmin();
  const { concepts } = await getSiteData();
  const from = (f.sayfa - 1) * PAGE_SIZE;
  const query = applyFilters(
    supabase
      .from("applications")
      .select("id, ref_code, created_at, status, concept, city, district, budget, property_status, full_name, phone", { count: "exact" }),
    f,
  )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  const { data, count, error } = await query;
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const deleted = sp.silindi === "1";

  return (
    <>
      <PageHeader title="Başvurular" eyebrow="Yatırımcı yönetimi">
        <a href={`/admin/disa-aktar${filtersToQuery(f, { sayfa: 1 })}`} className="btn-line !min-h-11">
          CSV olarak indir <span aria-hidden="true">↓</span>
        </a>
      </PageHeader>
      <div className="px-5 pb-16 sm:px-8 lg:px-12">
        {deleted && (
          <p role="status" className="mt-6 border border-success/50 px-4 py-3 text-ink">
            Başvuru kalıcı olarak silindi.
          </p>
        )}
        <FilterBar f={f} concepts={concepts} />
        <p className="py-4 text-sm text-muted" aria-live="polite">
          {error ? "Başvurular yüklenemedi." : `${new Intl.NumberFormat("tr-TR").format(total)} başvuru`}
        </p>
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-y border-line text-muted">
                  <th scope="col" className="py-3 pr-4 font-normal">Tarih</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Referans</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Ad Soyad</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Telefon</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Lokasyon</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Konsept</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Bütçe</th>
                  <th scope="col" className="py-3 font-normal">Durum</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id} className="border-b border-line align-top">
                    <td className="py-3 pr-4 text-muted tabular">{formatDateTime(a.created_at)}</td>
                    <td className="py-3 pr-4 tabular">{a.ref_code}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/basvurular/${a.id}`} className="font-medium text-ink underline-offset-4 hover:underline">
                        {a.full_name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 tabular">{formatPhone(a.phone)}</td>
                    <td className="py-3 pr-4">
                      {a.district}, {a.city}
                    </td>
                    <td className="py-3 pr-4">{conceptLabel(a.concept, concepts)}</td>
                    <td className="py-3 pr-4">{budgetLabel(a.budget)}</td>
                    <td className="py-3">
                      <StatusMark status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && (
            <div className="border-y border-line py-12">
              <p className="text-lg text-ink">Bu filtrelerle eşleşen başvuru yok.</p>
              <Link href="/admin/basvurular" className="mt-3 inline-block text-blue-ink underline underline-offset-4">
                Filtreleri temizleyin
              </Link>
            </div>
          )
        )}
        {pages > 1 && (
          <nav aria-label="Sayfalar" className="mt-8 flex items-center justify-between gap-4 text-sm">
            {f.sayfa > 1 ? (
              <Link href={`/admin/basvurular${filtersToQuery(f, { sayfa: f.sayfa - 1 })}`} className="label hover:text-blue-ink">
                ← Önceki
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted tabular">
              Sayfa {f.sayfa} / {pages}
            </span>
            {f.sayfa < pages ? (
              <Link href={`/admin/basvurular${filtersToQuery(f, { sayfa: f.sayfa + 1 })}`} className="label hover:text-blue-ink">
                Sonraki →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </>
  );
}

export default function ApplicationsPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<><PageHeader title="Başvurular" eyebrow="Yatırımcı yönetimi" /><PanelSkeleton rows={10} /></>}>
      <ApplicationList searchParams={searchParams} />
    </Suspense>
  );
}
