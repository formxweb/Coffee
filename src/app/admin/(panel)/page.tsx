import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BarList, ColumnChart, type Datum } from "@/components/admin/Charts";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { StatusMark } from "@/components/admin/Status";
import { requireAdmin } from "@/lib/admin/auth";
import { getSiteData } from "@/lib/content";
import { formatDateTime } from "@/lib/format";
import { APPLICATION_STATUSES, BUDGETS, PROPERTY_OPTIONS, budgetLabel, conceptLabel } from "@/lib/options";

export const metadata: Metadata = { title: "Genel bakış" };

const PERIODS = [
  { value: "7", label: "Son 7 gün" },
  { value: "30", label: "Son 30 gün" },
  { value: "90", label: "Son 90 gün" },
  { value: "tum", label: "Tüm zamanlar" },
] as const;

type Stats = {
  days: number | null;
  total_all: number;
  period: number;
  prev_period: number | null;
  new: number;
  in_progress: number;
  by_status: Record<string, number>;
  by_concept: Record<string, number>;
  by_budget: Record<string, number>;
  by_property: Record<string, number>;
  top_cities: { city: string; count: number }[];
  daily: { day: string; count: number }[];
};

const fmt = new Intl.NumberFormat("tr-TR");
const dayShort = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const dayLong = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "UTC" });

function Tile({ label, value, children, hero = false }: { label: string; value: number; children?: React.ReactNode; hero?: boolean }) {
  return (
    <div className="border-b border-line py-6 sm:border-b-0 sm:border-r sm:pr-6 sm:last:border-r-0">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-sans font-medium text-ink ${hero ? "text-6xl" : "text-4xl"}`}>{fmt.format(value)}</p>
      {children}
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border-t border-line pt-6 ${className}`}>
      <h2 className="label text-muted">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.donem) ? sp.donem[0] : sp.donem;
  const period = PERIODS.find((p) => p.value === raw)?.value ?? "30";
  const { supabase } = await requireAdmin();
  const [{ data, error }, recent, { concepts }] = await Promise.all([
    supabase.rpc("application_stats", { p_days: period === "tum" ? null : Number(period) }),
    supabase
      .from("applications")
      .select("id, ref_code, created_at, full_name, city, district, concept, budget, status")
      .order("created_at", { ascending: false })
      .limit(8),
    getSiteData(),
  ]);

  if (error || !data) {
    return <p className="px-5 py-10 text-danger sm:px-8 lg:px-12">İstatistikler yüklenemedi. Sayfayı yenileyin.</p>;
  }
  const s = data as Stats;
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLocaleLowerCase("tr-TR");
  const delta = s.prev_period === null ? null : s.period - s.prev_period;

  const daily: Datum[] = s.daily.map((d) => {
    const date = new Date(`${d.day}T00:00:00Z`);
    return { key: d.day, label: dayShort.format(date), detail: dayLong.format(date), value: d.count };
  });
  const byConcept: Datum[] = [...concepts.map((c) => ({ key: c.slug, label: c.name })), { key: "undecided", label: "Kararsız" }].map((c) => ({
    ...c,
    value: s.by_concept[c.key] ?? 0,
  }));
  const byBudget: Datum[] = BUDGETS.map((b) => ({ key: b.value, label: b.label, value: s.by_budget[b.value] ?? 0 }));
  const byStatus: Datum[] = APPLICATION_STATUSES.map((st) => ({ key: st.value, label: st.label, value: s.by_status[st.value] ?? 0 }));
  const byProperty: Datum[] = PROPERTY_OPTIONS.map((p) => ({
    key: p.value,
    label: p.value === "ready" ? "Hazır dükkânı var" : "Lokasyon desteği",
    value: s.by_property[p.value] ?? 0,
  }));
  const byCity: Datum[] = s.top_cities.map((c) => ({ key: c.city, label: c.city, value: c.count }));

  return (
    <div className="px-5 pb-16 sm:px-8 lg:px-12">
      <nav aria-label="Dönem" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line py-5">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={p.value === "30" ? "/admin" : `/admin?donem=${p.value}`}
            aria-current={p.value === period ? "page" : undefined}
            className={`text-sm ${p.value === period ? "font-medium text-ink underline decoration-blue decoration-2 underline-offset-8" : "text-muted hover:text-ink"}`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <div className="grid sm:grid-cols-4">
        <Tile label={`Başvurular (${periodLabel})`} value={s.period} hero>
          {delta !== null && (
            <p className={`mt-2 text-sm ${delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted"}`}>
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "■"} {delta > 0 ? "+" : ""}
              {fmt.format(delta)} önceki döneme göre
            </p>
          )}
        </Tile>
        <Tile label="Yanıt bekleyen (yeni)" value={s.new}>
          {s.new > 0 && (
            <Link href="/admin/basvurular?durum=new" className="mt-2 inline-block text-sm text-blue-ink underline underline-offset-4">
              Listeyi aç
            </Link>
          )}
        </Tile>
        <Tile label="Süreçte" value={s.in_progress} />
        <Tile label="Toplam başvuru (tüm zamanlar)" value={s.total_all} />
      </div>

      <Panel title="Günlük başvurular" className="mt-4">
        <ColumnChart data={daily} title={`Günlük başvurular, ${periodLabel}`} />
      </Panel>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <Panel title="Konsepte göre">
          <BarList data={byConcept} title="Konsepte göre başvurular" />
        </Panel>
        <Panel title="Bütçe aralığına göre">
          <BarList data={byBudget} title="Bütçe aralığına göre başvurular" />
        </Panel>
        <Panel title="Başvuru durumu">
          <BarList data={byStatus} title="Duruma göre başvurular" />
        </Panel>
        <div className="grid gap-12">
          <Panel title="En çok başvuru gelen iller">
            <BarList data={byCity} title="İllere göre başvurular" />
          </Panel>
          <Panel title="Mülk durumu">
            <BarList data={byProperty} title="Mülk durumuna göre başvurular" />
          </Panel>
        </div>
      </div>

      <Panel title="Son başvurular" className="mt-12">
        {recent.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th scope="col" className="py-3 pr-4 font-normal">Tarih</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Ad Soyad</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Lokasyon</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Konsept</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Bütçe</th>
                  <th scope="col" className="py-3 font-normal">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recent.data.map((a) => (
                  <tr key={a.id} className="border-b border-line">
                    <td className="py-3 pr-4 text-muted tabular">{formatDateTime(a.created_at)}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/basvurular/${a.id}`} className="text-ink underline-offset-4 hover:underline">
                        {a.full_name}
                      </Link>
                    </td>
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
          <p className="text-muted">Henüz başvuru yok. Yeni başvurular geldiğinde burada ve bildirim olarak görünür.</p>
        )}
      </Panel>
    </div>
  );
}

export default function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <>
      <PageHeader title="Genel bakış" eyebrow="Yatırımcı yönetimi" />
      <Suspense fallback={<PanelSkeleton rows={8} />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </>
  );
}
