import { createHash, randomInt } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { applicationSchema } from "@/lib/application-schema";
import { getSiteData } from "@/lib/content";
import { notifyNewApplication } from "@/lib/notify";
import { conceptLabel } from "@/lib/options";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service";

const MAX_BODY = 8_000;
const MIN_FILL_MS = 1_500;
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function fail(status: number, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}

/** Botlara gerçek görünen ama kaydedilmeyen yanıt */
function decoy() {
  const yy = new Date().getFullYear().toString().slice(-2);
  const code = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return NextResponse.json({ ok: true, ref: `CH-${yy}-${code}` });
}

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "bilinmiyor";
}

export async function POST(req: NextRequest) {
  // Yalnızca bu siteden gönderilen istekler
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return fail(403, "İstek reddedildi.");
    } catch {
      return fail(403, "İstek reddedildi.");
    }
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return fail(413, "Başvuru içeriği çok uzun.");

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return fail(400, "Geçersiz istek.");
  }

  // Spam koruması: gizli alan dolu ya da form insanüstü bir hızla gönderildi
  if (typeof body.website === "string" && body.website.trim()) return decoy();
  const elapsed = Number(body.elapsed_ms);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return decoy();

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return fail(422, "Lütfen işaretli alanları kontrol edin.", { fields });
  }
  const data = parsed.data;

  if (!isServiceConfigured) {
    console.error("[başvuru] Supabase yapılandırılmamış: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SECRET_KEY gerekli.");
    return fail(503, "Başvuru sistemi şu anda hizmet veremiyor. Lütfen daha sonra tekrar deneyin.");
  }

  const salt = process.env.RATE_LIMIT_SALT ?? process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const ipHash = createHash("sha256").update(`${salt}:${clientIp(req)}`).digest("hex").slice(0, 40);
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);

  const { data: result, error } = await createServiceClient().rpc("submit_application", {
    p: {
      concept: data.concept,
      city: data.city,
      district: data.district,
      budget: data.budget,
      property_status: data.property_status,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      note: data.note,
      kvkk_consent: data.kvkk_consent,
      marketing_consent: data.marketing_consent,
      utm: data.utm,
      source_path: data.source_path,
    },
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
  });

  if (error || !result) {
    console.error("[başvuru] Kayıt hatası:", error);
    return fail(500, "Başvurunuz şu anda kaydedilemedi. Lütfen biraz sonra tekrar deneyin.");
  }
  if (!result.ok) {
    if (result.error === "rate_limited") {
      return fail(429, "Kısa sürede çok fazla başvuru denemesi yapıldı. Lütfen bir süre sonra tekrar deneyin.");
    }
    return fail(500, "Başvurunuz şu anda kaydedilemedi. Lütfen biraz sonra tekrar deneyin.");
  }

  if (!result.duplicate) {
    after(async () => {
      try {
        const { concepts } = await getSiteData();
        await notifyNewApplication(result.ref, data, conceptLabel(data.concept, concepts));
      } catch (e) {
        console.error("[bildirim] Hata:", e);
      }
    });
  }

  return NextResponse.json({ ok: true, ref: result.ref });
}
