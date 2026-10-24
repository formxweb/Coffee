"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { CONTENT_TAG } from "@/lib/content";
import { STATUS_VALUES } from "@/lib/options";
import { createSessionClient } from "@/lib/supabase/server";
import { CONTENT_KEYS } from "@/lib/types";

export type ActionState = { ok: boolean; message: string } | null;

// ---------------------------------------------------------------------------
// Oturum
// ---------------------------------------------------------------------------

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!email || !password) return { ok: false, message: "E-posta ve şifrenizi yazın." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      ok: false,
      message: error.status === 429 ? "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin." : "E-posta ya da şifre hatalı.",
    };
  }
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/giris");
}

// ---------------------------------------------------------------------------
// Başvurular
// ---------------------------------------------------------------------------

const uuid = z.uuid();

export async function updateStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  const status = z.enum(STATUS_VALUES).safeParse(formData.get("status"));
  if (!id.success || !status.success) return { ok: false, message: "Geçersiz durum." };
  const { error } = await supabase.from("applications").update({ status: status.data }).eq("id", id.data);
  if (error) return { ok: false, message: "Durum kaydedilemedi. Lütfen tekrar deneyin." };
  refresh();
  return { ok: true, message: "Durum güncellendi." };
}

export async function addNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!id.success) return { ok: false, message: "Başvuru bulunamadı." };
  if (!body) return { ok: false, message: "Not boş olamaz." };
  if (body.length > 4000) return { ok: false, message: "Not en fazla 4000 karakter olabilir." };
  const { error } = await supabase.from("application_activity").insert({ application_id: id.data, kind: "note", body });
  if (error) return { ok: false, message: "Not kaydedilemedi. Lütfen tekrar deneyin." };
  refresh();
  return { ok: true, message: "Not eklendi." };
}

export async function deleteApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  const confirm = String(formData.get("confirm") ?? "").trim().toUpperCase();
  if (!id.success) return { ok: false, message: "Başvuru bulunamadı." };
  const { data: row } = await supabase.from("applications").select("ref_code").eq("id", id.data).maybeSingle();
  if (!row) return { ok: false, message: "Başvuru bulunamadı." };
  if (confirm !== row.ref_code) return { ok: false, message: `Silmek için referans numarasını (${row.ref_code}) aynen yazın.` };
  const { error } = await supabase.from("applications").delete().eq("id", id.data);
  if (error) return { ok: false, message: "Başvuru silinemedi. Lütfen tekrar deneyin." };
  redirect("/admin/basvurular?silindi=1");
}

// ---------------------------------------------------------------------------
// İçerik
// ---------------------------------------------------------------------------

const httpsUrl = z.union([z.literal(""), z.url({ protocol: /^https$/, error: "Görsel adresi https:// ile başlamalı." })]);

const conceptSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]{2,32}$/),
    name: z.string().trim().min(2, "Konsept adı en az 2 karakter olmalı.").max(40),
    short_name: z.string().trim().min(2, "Kısa ad en az 2 karakter olmalı.").max(24),
    tagline: z.string().trim().max(160, "Kısa tanım en fazla 160 karakter olabilir."),
    description: z.string().trim().max(2000, "Açıklama en fazla 2000 karakter olabilir."),
    area_min: z.coerce.number({ error: "Metrekare sayı olmalı." }).int().positive("Metrekare 0'dan büyük olmalı."),
    area_max: z.coerce.number({ error: "Metrekare sayı olmalı." }).int().positive("Metrekare 0'dan büyük olmalı."),
    price_min: z.coerce.number({ error: "Fiyat sayı olmalı." }).int().positive("Fiyat 0'dan büyük olmalı."),
    price_max: z.coerce.number({ error: "Fiyat sayı olmalı." }).int().positive("Fiyat 0'dan büyük olmalı."),
    hero_image_url: httpsUrl,
    hero_image_alt: z.string().trim().max(200),
    gallery: z.array(z.object({ url: z.url({ protocol: /^https$/ }), alt: z.string().max(200) })).max(24),
    is_published: z.boolean(),
  })
  .refine((v) => v.area_max >= v.area_min, { message: "En büyük metrekare, en küçükten az olamaz.", path: ["area_max"] })
  .refine((v) => v.price_max >= v.price_min, { message: "En yüksek fiyat, en düşükten az olamaz.", path: ["price_max"] });

const digitsOnly = (v: FormDataEntryValue | null) => String(v ?? "").replace(/[^\d]/g, "");

export async function saveConcept(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  let gallery: unknown = [];
  try {
    gallery = JSON.parse(String(formData.get("gallery") ?? "[]"));
  } catch {
    return { ok: false, message: "Galeri verisi okunamadı." };
  }
  const parsed = conceptSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    short_name: formData.get("short_name"),
    tagline: formData.get("tagline") ?? "",
    description: formData.get("description") ?? "",
    area_min: digitsOnly(formData.get("area_min")),
    area_max: digitsOnly(formData.get("area_max")),
    price_min: digitsOnly(formData.get("price_min")),
    price_max: digitsOnly(formData.get("price_max")),
    hero_image_url: String(formData.get("hero_image_url") ?? "").trim(),
    hero_image_alt: formData.get("hero_image_alt") ?? "",
    gallery,
    is_published: formData.get("is_published") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  const { slug, ...values } = parsed.data;
  const { error } = await supabase
    .from("concepts")
    .update({ ...values, hero_image_url: values.hero_image_url || null, hero_image_alt: values.hero_image_alt || null })
    .eq("slug", slug);
  if (error) return { ok: false, message: "Konsept kaydedilemedi. Lütfen tekrar deneyin." };
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Konsept kaydedildi; sitede güncellendi." };
}

const journeySchema = z
  .array(
    z.object({
      id: z.string().max(64),
      title: z.string().trim().min(1, "Her adımın bir başlığı olmalı.").max(80, "Adım başlığı en fazla 80 karakter olabilir."),
      description: z.string().trim().max(600, "Adım açıklaması en fazla 600 karakter olabilir."),
    }),
  )
  .min(1, "En az bir adım olmalı.")
  .max(12, "En fazla 12 adım eklenebilir.");

export async function saveJourney(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("steps") ?? "[]"));
  } catch {
    return { ok: false, message: "Adımlar okunamadı." };
  }
  const parsed = journeySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Adımları kontrol edin." };

  const { data: existing, error: readError } = await supabase.from("journey_steps").select("id");
  if (readError) return { ok: false, message: "Adımlar okunamadı." };
  const keep = new Set(parsed.data.filter((s) => uuid.safeParse(s.id).success).map((s) => s.id));
  const remove = (existing ?? []).map((r) => r.id).filter((id) => !keep.has(id));

  const rows = parsed.data.map((s, i) => ({
    ...(uuid.safeParse(s.id).success ? { id: s.id } : {}),
    sort_order: i + 1,
    title: s.title,
    description: s.description,
  }));
  const updates = rows.filter((r) => "id" in r);
  const inserts = rows.filter((r) => !("id" in r));
  if (updates.length) {
    const { error } = await supabase.from("journey_steps").upsert(updates);
    if (error) return { ok: false, message: "Adımlar kaydedilemedi." };
  }
  if (inserts.length) {
    const { error } = await supabase.from("journey_steps").insert(inserts);
    if (error) return { ok: false, message: "Yeni adımlar eklenemedi." };
  }
  if (remove.length) {
    const { error } = await supabase.from("journey_steps").delete().in("id", remove);
    if (error) return { ok: false, message: "Silinen adımlar kaldırılamadı." };
  }
  updateTag(CONTENT_TAG);
  refresh();
  return { ok: true, message: "Yatırım süreci kaydedildi; sitede güncellendi." };
}

const URL_KEYS = new Set<string>(["contact.instagram", "contact.website", "brand.logo_url", "hero.video_url", "hero.video_wide_url"]);

export async function saveSiteText(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const rows: { key: string; value: string }[] = [];
  for (const key of CONTENT_KEYS) {
    const v = formData.get(key);
    if (v === null) continue;
    const value = String(v).trim();
    if (value.length > 4000) return { ok: false, message: "Metinler en fazla 4000 karakter olabilir." };
    if (URL_KEYS.has(key) && value && !/^https:\/\//.test(value)) {
      return { ok: false, message: "Bağlantılar https:// ile başlamalı." };
    }
    if (key === "contact.email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return { ok: false, message: "E-posta adresini kontrol edin." };
    }
    if (key.startsWith("hero.line") && !value) return { ok: false, message: "Ana başlık satırları boş bırakılamaz." };
    rows.push({ key, value });
  }
  const { error } = await supabase.from("site_content").upsert(rows);
  if (error) return { ok: false, message: "Metinler kaydedilemedi. Lütfen tekrar deneyin." };
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Site metinleri kaydedildi; sitede güncellendi." };
}
