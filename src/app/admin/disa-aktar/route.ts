import { NextResponse, type NextRequest } from "next/server";
import { applyFilters, parseFilters } from "@/lib/admin/filters";
import { getSiteData } from "@/lib/content";
import { formatDateTime, formatPhone } from "@/lib/format";
import { budgetLabel, conceptLabel, propertyLabel, statusLabel } from "@/lib/options";
import { createSessionClient } from "@/lib/supabase/server";

const MAX_ROWS = 10_000;

/** Excel uyumlu CSV: noktalı virgül ayırıcı, UTF-8 BOM, formül enjeksiyonuna karşı korumalı hücreler */
function cell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Giriş gerekli." }, { status: 401 });
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return NextResponse.json({ message: "Yetki yok." }, { status: 403 });

  const f = parseFilters(Object.fromEntries(req.nextUrl.searchParams.entries()));
  const { data, error } = await applyFilters(supabase.from("applications").select("*"), f)
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);
  if (error) return NextResponse.json({ message: "Başvurular okunamadı." }, { status: 500 });
  const { concepts } = await getSiteData();

  const header = [
    "Referans", "Tarih", "Durum", "Ad Soyad", "Telefon", "E-posta", "İl", "İlçe", "Konsept", "Bütçe", "Mülk durumu",
    "Ek açıklama", "KVKK onayı", "Ticari ileti onayı", "utm_source", "utm_medium", "utm_campaign", "Kaynak sayfa",
  ];
  const lines = (data ?? []).map((a) =>
    [
      a.ref_code,
      formatDateTime(a.created_at),
      statusLabel(a.status),
      a.full_name,
      formatPhone(a.phone),
      a.email ?? "",
      a.city,
      a.district,
      conceptLabel(a.concept, concepts),
      budgetLabel(a.budget),
      propertyLabel(a.property_status),
      a.note ?? "",
      a.kvkk_consent ? "Evet" : "Hayır",
      a.marketing_consent ? "Evet" : "Hayır",
      a.utm?.utm_source ?? "",
      a.utm?.utm_medium ?? "",
      a.utm?.utm_campaign ?? "",
      a.source_path ?? "",
    ]
      .map(cell)
      .join(";"),
  );
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="coffee-house-basvurular-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
