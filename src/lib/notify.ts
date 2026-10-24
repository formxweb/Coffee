import "server-only";
import { SITE_URL } from "@/lib/env";
import { formatPhone } from "@/lib/format";
import { budgetLabel, propertyLabel } from "@/lib/options";
import type { ApplicationData } from "@/lib/application-schema";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Yeni başvuruyu e-postayla bildirir (Resend). RESEND_API_KEY, NOTIFY_EMAIL_TO ve NOTIFY_EMAIL_FROM tanımlı değilse
 * hiçbir şey yapmaz; başvurular yine panelde ve canlı bildirimde görünür.
 */
export async function notifyNewApplication(ref: string, a: ApplicationData, conceptName: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM;
  if (!key || !to || !from) return;

  const rows: [string, string][] = [
    ["Referans", ref],
    ["Ad Soyad", a.full_name],
    ["Telefon", formatPhone(a.phone)],
    ["E-posta", a.email || "Belirtilmedi"],
    ["Konsept", conceptName],
    ["Lokasyon", `${a.district}, ${a.city}`],
    ["Bütçe", budgetLabel(a.budget)],
    ["Mülk durumu", propertyLabel(a.property_status)],
    ["Ek açıklama", a.note || "Yok"],
  ];
  const link = `${SITE_URL}/admin/basvurular?q=${encodeURIComponent(ref)}`;
  const html = `<div style="font-family:Arial,sans-serif;color:#0f1a2e">
<h2 style="font-weight:normal">Yeni bayilik başvurusu</h2>
<table cellpadding="8" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="border-bottom:1px solid #dbe1ea;color:#4a566b">${esc(k)}</td><td style="border-bottom:1px solid #dbe1ea">${esc(v)}</td></tr>`)
    .join("")}</table>
<p><a href="${esc(link)}">Başvuruyu yönetim panelinde açın</a></p></div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject: `Yeni başvuru ${ref}: ${a.full_name}, ${a.city}, ${budgetLabel(a.budget)}`,
      html,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${link}`,
      ...(a.email ? { reply_to: a.email } : {}),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("[bildirim] E-posta gönderilemedi:", res.status, await res.text().catch(() => ""));
}
