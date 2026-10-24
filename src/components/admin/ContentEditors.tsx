"use client";

import { useActionState, useId, useState } from "react";
import { saveConcept, saveJourney, saveSiteText, type ActionState } from "@/app/admin/actions";
import { formatTL } from "@/lib/format";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { Concept, GalleryImage, JourneyStep, SiteText } from "@/lib/types";

const input = "field-input !min-h-11 !py-2 !text-base";

function Message({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>
      {state.message}
    </p>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label text-muted">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

type MediaKind = "image" | "video";

const MEDIA = {
  image: { accept: "image/jpeg,image/png,image/webp,image/avif,image/svg+xml", prefix: "image/", maxMb: 10, name: "Görsel" },
  video: { accept: "video/mp4,video/webm", prefix: "video/", maxMb: 50, name: "Video" },
} as const;

/** Supabase Storage'a görsel ya da video yükler ve herkese açık adresini döndürür. */
async function uploadMedia(file: File, folder: string, kind: MediaKind): Promise<string> {
  const m = MEDIA[kind];
  if (!file.type.startsWith(m.prefix)) throw new Error(kind === "image" ? "Yalnızca görsel dosyaları yüklenebilir." : "Yalnızca MP4 ya da WebM video yüklenebilir.");
  if (file.size > m.maxMb * 1024 * 1024) throw new Error(`${m.name} en fazla ${m.maxMb} MB olabilir.`);
  const supabase = createBrowserSupabase();
  const ext = (file.name.split(".").pop() || (kind === "image" ? "jpg" : "mp4")).toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`${m.name} yüklenemedi. Depolama alanının kurulu olduğundan emin olun.`);
  return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}

function UploadButton({
  folder,
  onUploaded,
  label = "Görsel yükle",
  kind = "image",
}: {
  folder: string;
  onUploaded: (url: string) => void;
  label?: string;
  kind?: MediaKind;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <label htmlFor={id} className={`btn-line !min-h-10 cursor-pointer !py-2 ${busy ? "opacity-60" : ""}`}>
        {busy ? "Yükleniyor…" : label} <span aria-hidden="true">↑</span>
      </label>
      <input
        id={id}
        type="file"
        accept={MEDIA[kind].accept}
        className="sr-only"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setError("");
          try {
            onUploaded(await uploadMedia(file, folder, kind));
          } catch (err) {
            setError(err instanceof Error ? err.message : `${MEDIA[kind].name} yüklenemedi.`);
          } finally {
            setBusy(false);
          }
        }}
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Preview({ url, alt }: { url: string; alt: string }) {
  if (!url) return <div className="grid aspect-[4/3] w-40 place-items-center border border-dashed border-line text-xs text-muted">Görsel yok</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className="aspect-[4/3] w-40 border border-line object-cover" />;
}

export function ConceptEditor({ concept }: { concept: Concept }) {
  const id = useId();
  const [state, action, pending] = useActionState<ActionState, FormData>(saveConcept, null);
  const [hero, setHero] = useState(concept.heroImageUrl ?? "");
  const [heroAlt, setHeroAlt] = useState(concept.heroImageAlt ?? "");
  const [gallery, setGallery] = useState<GalleryImage[]>(concept.gallery);
  const [prices, setPrices] = useState({ min: String(concept.priceMin), max: String(concept.priceMax) });
  const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;

  return (
    <form action={action} className="border-t border-line pt-8" aria-labelledby={`${id}-baslik`}>
      <input type="hidden" name="slug" value={concept.slug} />
      <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 id={`${id}-baslik`} className="font-display text-3xl uppercase">
          {concept.code} · {concept.name}
        </h3>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={concept.isPublished} className="h-4 w-4 accent-[var(--color-blue)]" />
          Sitede yayında
        </label>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Konsept adı" htmlFor={`${id}-name`}>
          <input id={`${id}-name`} name="name" defaultValue={concept.name} required maxLength={40} className={input} />
        </Field>
        <Field label="Kısa ad (büyük harf)" htmlFor={`${id}-short`}>
          <input id={`${id}-short`} name="short_name" defaultValue={concept.shortName} required maxLength={24} className={input} />
        </Field>
        <Field label="En küçük alan (m²)" htmlFor={`${id}-amin`}>
          <input id={`${id}-amin`} name="area_min" inputMode="numeric" defaultValue={concept.areaMin} required className={`${input} tabular`} />
        </Field>
        <Field label="En büyük alan (m²)" htmlFor={`${id}-amax`}>
          <input id={`${id}-amax`} name="area_max" inputMode="numeric" defaultValue={concept.areaMax} required className={`${input} tabular`} />
        </Field>
        <Field label="Yatırım tutarı, en düşük (TL)" htmlFor={`${id}-pmin`} hint={num(prices.min) ? formatTL(num(prices.min)) : undefined}>
          <input
            id={`${id}-pmin`}
            name="price_min"
            inputMode="numeric"
            value={prices.min}
            onChange={(e) => setPrices((p) => ({ ...p, min: e.target.value }))}
            required
            className={`${input} tabular`}
          />
        </Field>
        <Field
          label="Yatırım tutarı, en yüksek (TL)"
          htmlFor={`${id}-pmax`}
          hint={num(prices.max) ? `${formatTL(num(prices.max))} · Tek fiyat için iki alana aynı tutarı yazın.` : undefined}
        >
          <input
            id={`${id}-pmax`}
            name="price_max"
            inputMode="numeric"
            value={prices.max}
            onChange={(e) => setPrices((p) => ({ ...p, max: e.target.value }))}
            required
            className={`${input} tabular`}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Kısa tanım" htmlFor={`${id}-tagline`}>
            <input id={`${id}-tagline`} name="tagline" defaultValue={concept.tagline} maxLength={160} className={input} />
          </Field>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Field label="Açıklama" htmlFor={`${id}-desc`}>
            <textarea id={`${id}-desc`} name="description" defaultValue={concept.description} rows={3} maxLength={2000} className={`${input} resize-y`} />
          </Field>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="label text-muted">Ana görsel</p>
          <p className="mt-1 text-xs text-muted">Yüklenmezse sitede temsili plan çizimi gösterilir.</p>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            <Preview url={hero} alt={heroAlt} />
            <div className="grid flex-1 gap-3">
              <UploadButton folder={`konseptler/${concept.slug}`} onUploaded={setHero} />
              <input name="hero_image_url" value={hero} onChange={(e) => setHero(e.target.value)} placeholder="https://… ya da yükleyin" aria-label="Ana görsel adresi" className={input} />
              <input name="hero_image_alt" value={heroAlt} onChange={(e) => setHeroAlt(e.target.value)} placeholder="Görselin kısa açıklaması" aria-label="Ana görsel açıklaması" maxLength={200} className={input} />
              {hero && (
                <button type="button" className="justify-self-start text-sm text-danger underline underline-offset-4" onClick={() => setHero("")}>
                  Ana görseli kaldır
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <p className="label text-muted">Galeri ({gallery.length})</p>
          <ul className="mt-3 grid gap-3">
            {gallery.map((g, i) => (
              <li key={`${g.url}-${i}`} className="flex flex-wrap items-start gap-3 border-b border-line pb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt={g.alt} className="aspect-[4/3] w-24 border border-line object-cover" />
                <input
                  value={g.alt}
                  onChange={(e) => setGallery((list) => list.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                  placeholder="Görsel açıklaması"
                  aria-label={`Galeri görseli ${i + 1} açıklaması`}
                  maxLength={200}
                  className={`${input} min-w-40 flex-1`}
                />
                <button type="button" className="text-sm text-danger underline underline-offset-4" onClick={() => setGallery((list) => list.filter((_, j) => j !== i))}>
                  Kaldır
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <UploadButton folder={`konseptler/${concept.slug}/galeri`} label="Galeriye görsel ekle" onUploaded={(url) => setGallery((list) => [...list, { url, alt: "" }])} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <button type="submit" className="btn-solid" disabled={pending}>
          {pending ? "Kaydediliyor…" : `${concept.name} bilgilerini kaydet`} <span aria-hidden="true">↗</span>
        </button>
        <Message state={state} />
      </div>
    </form>
  );
}

type EditableStep = { id: string; title: string; description: string };

export function JourneyEditor({ steps: initial }: { steps: JourneyStep[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveJourney, null);
  const [steps, setSteps] = useState<EditableStep[]>(initial.map((s) => ({ id: s.id, title: s.title, description: s.description })));
  const [counter, setCounter] = useState(1);
  const move = (i: number, dir: -1 | 1) =>
    setSteps((list) => {
      const next = [...list];
      const j = i + dir;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form action={action}>
      <input type="hidden" name="steps" value={JSON.stringify(steps)} />
      <ol className="border-t border-line">
        {steps.map((s, i) => (
          <li key={s.id} className="grid gap-4 border-b border-line py-5 lg:grid-cols-[3rem_1fr_2fr_auto] lg:items-start">
            <span className="label pt-3 tabular text-blue-ink">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <label htmlFor={`adim-${s.id}-baslik`} className="sr-only">
                {i + 1}. adım başlığı
              </label>
              <input
                id={`adim-${s.id}-baslik`}
                value={s.title}
                maxLength={80}
                placeholder="Adım başlığı"
                onChange={(e) => setSteps((list) => list.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)))}
                className={input}
              />
            </div>
            <div>
              <label htmlFor={`adim-${s.id}-aciklama`} className="sr-only">
                {i + 1}. adım açıklaması
              </label>
              <textarea
                id={`adim-${s.id}-aciklama`}
                value={s.description}
                maxLength={600}
                rows={2}
                placeholder="Kısa açıklama"
                onChange={(e) => setSteps((list) => list.map((x) => (x.id === s.id ? { ...x, description: e.target.value } : x)))}
                className={`${input} resize-y`}
              />
            </div>
            <div className="flex gap-2 text-sm lg:pt-2">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="border border-line px-3 py-2 disabled:opacity-30" aria-label={`${i + 1}. adımı yukarı taşı`}>
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === steps.length - 1}
                className="border border-line px-3 py-2 disabled:opacity-30"
                aria-label={`${i + 1}. adımı aşağı taşı`}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => setSteps((list) => list.filter((x) => x.id !== s.id))}
                disabled={steps.length === 1}
                className="border border-line px-3 py-2 text-danger disabled:opacity-30"
                aria-label={`${i + 1}. adımı sil`}
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <button
          type="button"
          className="btn-line"
          disabled={steps.length >= 12}
          onClick={() => {
            setSteps((list) => [...list, { id: `yeni-${counter}`, title: "", description: "" }]);
            setCounter((c) => c + 1);
          }}
        >
          Adım ekle <span aria-hidden="true">+</span>
        </button>
        <button type="submit" className="btn-solid" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Süreci kaydet"} <span aria-hidden="true">↗</span>
        </button>
        <Message state={state} />
      </div>
    </form>
  );
}

const TEXT_GROUPS: { title: string; fields: { key: keyof SiteText; label: string; long?: boolean; hint?: string }[] }[] = [
  {
    title: "Ana sayfa",
    fields: [
      { key: "hero.line1", label: "Başlık, 1. satır" },
      { key: "hero.line2", label: "Başlık, 2. satır" },
      { key: "hero.line3", label: "Başlık, 3. satır" },
      { key: "hero.subtitle", label: "Alt başlık", long: true },
      {
        key: "hero.video_url",
        label: "Giriş videosu, dikey (telefon)",
        hint: "MP4, en fazla 50 MB. Boş bırakılırsa şube tanıtım videosu oynar.",
      },
      {
        key: "hero.video_wide_url",
        label: "Giriş videosu, yatay (bilgisayar)",
        hint: "Boş bırakılırsa bilgisayarda da dikey video kullanılır.",
      },
      { key: "about.title", label: "Hakkımızda başlığı" },
      { key: "about.body", label: "Hakkımızda metni", long: true },
      { key: "cta.title", label: "Başvuru çağrısı başlığı" },
      { key: "cta.body", label: "Başvuru çağrısı metni", long: true },
    ],
  },
  {
    title: "İletişim",
    fields: [
      { key: "contact.phone", label: "Telefon", hint: "Örn. +90 532 123 45 67. Boş bırakılırsa sitede gösterilmez." },
      { key: "contact.whatsapp", label: "WhatsApp", hint: "Ülke koduyla, örn. +90 532 123 45 67" },
      { key: "contact.email", label: "E-posta" },
      { key: "contact.address", label: "Adres", long: true },
      { key: "contact.instagram", label: "Instagram adresi" },
      { key: "contact.website", label: "Web sitesi" },
    ],
  },
  {
    title: "Marka ve yasal bilgiler",
    fields: [
      { key: "brand.logo_url", label: "Logo adresi", hint: "SVG ya da PNG. Boşsa yazı logosu kullanılır." },
      { key: "legal.company_name", label: "Şirket unvanı (veri sorumlusu)" },
      { key: "legal.company_address", label: "Şirket adresi", long: true },
      { key: "legal.mersis", label: "MERSİS numarası" },
      { key: "legal.kvkk_email", label: "KVKK başvuru e-postası" },
      { key: "legal.retention", label: "Başvuru saklama süresi", hint: "Örn. 2 yıl" },
    ],
  },
];

/** Adresi elle yazılabilen ya da dosya yüklenerek doldurulan alanlar */
const MEDIA_FIELDS: Partial<Record<keyof SiteText, { folder: string; label: string; kind: MediaKind }>> = {
  "brand.logo_url": { folder: "marka", label: "Logo yükle", kind: "image" },
  "hero.video_url": { folder: "video", label: "Dikey video yükle", kind: "video" },
  "hero.video_wide_url": { folder: "video", label: "Yatay video yükle", kind: "video" },
};

export function SiteTextEditor({ text }: { text: SiteText }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSiteText, null);
  const [media, setMedia] = useState<Partial<Record<keyof SiteText, string>>>(() =>
    Object.fromEntries(Object.keys(MEDIA_FIELDS).map((k) => [k, text[k as keyof SiteText]])),
  );
  return (
    <form action={action} className="grid gap-12">
      {TEXT_GROUPS.map((group) => (
        <fieldset key={group.title} className="border-t border-line pt-6">
          <legend className="label pr-4 text-blue-ink">{group.title}</legend>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {group.fields.map((f) => {
              const upload = MEDIA_FIELDS[f.key];
              return (
                <div key={f.key} className={f.long ? "lg:col-span-2" : ""}>
                  <Field label={f.label} htmlFor={`metin-${f.key}`} hint={f.hint}>
                    {upload ? (
                      <div className="grid gap-3">
                        <input
                          id={`metin-${f.key}`}
                          name={f.key}
                          value={media[f.key] ?? ""}
                          onChange={(e) => setMedia((m) => ({ ...m, [f.key]: e.target.value }))}
                          className={input}
                        />
                        <UploadButton
                          folder={upload.folder}
                          label={upload.label}
                          kind={upload.kind}
                          onUploaded={(url) => setMedia((m) => ({ ...m, [f.key]: url }))}
                        />
                      </div>
                    ) : f.long ? (
                      <textarea id={`metin-${f.key}`} name={f.key} defaultValue={text[f.key]} rows={3} maxLength={4000} className={`${input} resize-y`} />
                    ) : (
                      <input id={`metin-${f.key}`} name={f.key} defaultValue={text[f.key]} maxLength={400} className={input} />
                    )}
                  </Field>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" className="btn-solid" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Metinleri kaydet"} <span aria-hidden="true">↗</span>
        </button>
        <Message state={state} />
      </div>
    </form>
  );
}
