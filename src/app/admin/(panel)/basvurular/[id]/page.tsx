import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeleteForm, NoteForm, StatusForm } from "@/components/admin/ApplicationForms";
import { PanelSkeleton } from "@/components/admin/PageHeader";
import { StatusMark } from "@/components/admin/Status";
import { requireAdmin } from "@/lib/admin/auth";
import { getSiteData } from "@/lib/content";
import { formatDateTime, formatPhone, waNumber } from "@/lib/format";
import { budgetLabel, conceptLabel, propertyLabel, statusLabel } from "@/lib/options";

export const metadata: Metadata = { title: "Başvuru" };

type Activity = {
  id: string;
  created_at: string;
  author_email: string | null;
  kind: "note" | "status";
  body: string | null;
  from_status: string | null;
  to_status: string | null;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="label text-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

async function Detail({ id }: { id: string }) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: a }, { data: activity }, { concepts }] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("application_activity")
      .select("id, created_at, author_email, kind, body, from_status, to_status")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
    getSiteData(),
  ]);
  if (!a) notFound();

  const phoneDigits = a.phone.replace(/\D/g, "");
  const utm = (a.utm ?? {}) as Record<string, string>;
  const source = [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" / ");

  return (
    <>
      <header className="border-b border-line px-5 pb-8 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <Link href="/admin/basvurular" className="label text-muted hover:text-ink">
          ← Başvurular
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label tabular text-blue-ink">{a.ref_code}</p>
            <h1 className="mt-3 text-5xl">{a.full_name}</h1>
            <p className="mt-3 text-muted">
              {formatDateTime(a.created_at)} tarihinde başvurdu · <StatusMark status={a.status} />
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${a.phone}`} className="btn-line !min-h-11">
              Ara <span aria-hidden="true">↗</span>
            </a>
            <a
              href={`https://wa.me/${waNumber(phoneDigits)}?text=${encodeURIComponent(`Merhaba ${a.full_name.split(" ")[0]}, Coffee House bayilik başvurunuz (${a.ref_code}) hakkında yazıyoruz.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-line !min-h-11"
            >
              WhatsApp <span aria-hidden="true">↗</span>
            </a>
            {a.email && (
              <a href={`mailto:${a.email}?subject=${encodeURIComponent(`Coffee House bayilik başvurunuz ${a.ref_code}`)}`} className="btn-line !min-h-11">
                E-posta <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-7">
          <h2 className="label text-muted">Başvuru bilgileri</h2>
          <dl className="mt-4 border-t border-line">
            <Row label="Konsept">{conceptLabel(a.concept, concepts)}</Row>
            <Row label="Lokasyon">
              {a.district}, {a.city}
            </Row>
            <Row label="Bütçe">{budgetLabel(a.budget)}</Row>
            <Row label="Mülk durumu">{propertyLabel(a.property_status)}</Row>
            <Row label="Telefon">
              <a href={`tel:${a.phone}`} className="underline-offset-4 hover:underline tabular">
                {formatPhone(a.phone)}
              </a>
            </Row>
            <Row label="E-posta">
              {a.email ? (
                <a href={`mailto:${a.email}`} className="underline-offset-4 hover:underline">
                  {a.email}
                </a>
              ) : (
                <span className="text-muted">Belirtilmedi</span>
              )}
            </Row>
            <Row label="Ek açıklama">{a.note ? <span className="whitespace-pre-line">{a.note}</span> : <span className="text-muted">Yok</span>}</Row>
            <Row label="KVKK onayı">{a.kvkk_consent ? `Verildi (${formatDateTime(a.created_at)})` : "Yok"}</Row>
            <Row label="Ticari ileti onayı">{a.marketing_consent ? "Verildi" : "Verilmedi"}</Row>
            <Row label="Kaynak">{source || (utm.referrer ? utm.referrer : <span className="text-muted">Doğrudan</span>)}</Row>
            {a.source_path && <Row label="Başvuru sayfası">{a.source_path}</Row>}
          </dl>

          <h2 className="label mt-14 text-muted">Geçmiş ve notlar</h2>
          {activity && activity.length > 0 ? (
            <ol className="mt-4 border-t border-line">
              {(activity as Activity[]).map((item) => (
                <li key={item.id} className="border-b border-line py-4">
                  <p className="text-xs text-muted tabular">
                    {formatDateTime(item.created_at)} · {item.author_email ?? "Sistem"}
                  </p>
                  {item.kind === "note" ? (
                    <p className="mt-2 whitespace-pre-line text-ink">{item.body}</p>
                  ) : (
                    <p className="mt-2 text-ink">
                      Durum değişti: {statusLabel(item.from_status ?? "")} → {statusLabel(item.to_status ?? "")}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 border-t border-line pt-4 text-muted">Henüz not ya da durum değişikliği yok.</p>
          )}
        </div>

        <aside className="grid content-start gap-10 lg:col-span-4 lg:col-start-9">
          <StatusForm id={a.id} status={a.status} />
          <NoteForm id={a.id} />
          <DeleteForm id={a.id} refCode={a.ref_code} />
        </aside>
      </div>
    </>
  );
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PanelSkeleton rows={10} />}>
      {params.then(({ id }) => (
        <Detail id={id} />
      ))}
    </Suspense>
  );
}
