import { z } from "zod";
import { BUDGET_VALUES, CONCEPT_CHOICES, PROPERTY_VALUES } from "@/lib/options";
import { isValidLocation } from "@/lib/tr-locations";

/** Türkiye cep telefonunu +905XXXXXXXXX biçimine çevirir; geçersizse null. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, "").replace(/^0+/, "");
  if (d.startsWith("90")) d = d.slice(2).replace(/^0+/, "");
  return /^5\d{9}$/.test(d) ? `+90${d}` : null;
}

const text = (max: number) => z.string().trim().max(max);

const utmSchema = z
  .object({
    utm_source: text(120),
    utm_medium: text(120),
    utm_campaign: text(120),
    utm_content: text(120),
    utm_term: text(120),
    fbclid: text(300),
    gclid: text(300),
    referrer: text(300),
  })
  .partial()
  .strip();

export const applicationSchema = z
  .object({
    concept: z.enum(CONCEPT_CHOICES, { error: "Bir konsept seçin." }),
    city: text(40).min(2, "İl seçin."),
    district: text(60).min(2, "İlçe seçin."),
    budget: z.enum(BUDGET_VALUES, { error: "Bütçe aralığınızı seçin." }),
    property_status: z.enum(PROPERTY_VALUES, { error: "Mülk durumunuzu seçin." }),
    full_name: text(100)
      .min(3, "Adınızı ve soyadınızı yazın.")
      .transform((v) => v.replace(/\s+/g, " ")),
    phone: z
      .string()
      .max(30)
      .transform((v, ctx) => {
        const phone = normalizePhone(v);
        if (!phone) {
          ctx.addIssue({ code: "custom", message: "Telefon numarası 0 (5XX) XXX XX XX biçiminde olmalı." });
          return z.NEVER;
        }
        return phone;
      }),
    email: z
      .union([z.literal(""), z.email({ error: "E-posta adresi ornek@alanadi.com biçiminde olmalı." }).max(160)])
      .optional()
      .transform((v) => (v ? v.toLowerCase() : "")),
    note: text(1000).optional().default(""),
    kvkk_consent: z.literal(true, { error: "Devam etmek için KVKK Aydınlatma Metni’ni onaylayın." }),
    marketing_consent: z.boolean().optional().default(false),
    utm: utmSchema.optional().default({}),
    source_path: text(300).optional().default(""),
  })
  .superRefine((v, ctx) => {
    if (!isValidLocation(v.city, v.district)) {
      ctx.addIssue({ code: "custom", path: ["district"], message: "İl ve ilçe seçimini kontrol edin." });
    }
  });

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationData = z.output<typeof applicationSchema>;

/** İstemcideki adım doğrulaması için alan bazlı şemalar */
export const stepFields = {
  concept: ["concept"],
  location: ["city", "district"],
  budget: ["budget"],
  property: ["property_status"],
  contact: ["full_name", "phone", "email", "note", "kvkk_consent"],
} as const;
