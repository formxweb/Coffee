"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { normalizePhone } from "@/lib/application-schema";
import { readAttribution } from "@/lib/attribution";
import { areaLabel, priceLabel } from "@/lib/format";
import { BUDGETS, PROPERTY_OPTIONS, budgetLabel, type BudgetValue, type PropertyValue } from "@/lib/options";
import { ILLER, IL_ILCE } from "@/lib/tr-locations";
import type { Concept } from "@/lib/types";

type Values = {
  concept: string;
  city: string;
  district: string;
  budget: string;
  property_status: string;
  full_name: string;
  phone: string;
  email: string;
  note: string;
  kvkk_consent: boolean;
  marketing_consent: boolean;
};

type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = {
  concept: "",
  city: "",
  district: "",
  budget: "",
  property_status: "",
  full_name: "",
  phone: "",
  email: "",
  note: "",
  kvkk_consent: false,
  marketing_consent: false,
};

const STEPS = [
  { key: "concept", label: "Konsept", question: "Hangi Coffee House konseptine yatırım yapmak istiyorsunuz?", fields: ["concept"] },
  { key: "location", label: "Lokasyon", question: "Yatırımınızı nerede planlıyorsunuz?", fields: ["city", "district"] },
  { key: "budget", label: "Bütçe", question: "Yatırım bütçeniz nedir?", fields: ["budget"] },
  { key: "property", label: "Mülk", question: "Mülk durumunuz nedir?", fields: ["property_status"] },
  { key: "contact", label: "İletişim", question: "Size nasıl ulaşabiliriz?", fields: ["full_name", "phone", "email", "note", "kvkk_consent"] },
] as const satisfies readonly { key: string; label: string; question: string; fields: readonly Field[] }[];

const DRAFT_KEY = "ch-basvuru-taslak";

function telDigits(value: string): string {
  let d = value.replace(/\D/g, "").replace(/^0+/, "");
  if (d.startsWith("90")) d = d.slice(2).replace(/^0+/, "");
  return d.slice(0, 10);
}

function formatTel(d: string): string {
  if (!d) return "";
  let s = "0 (" + d.slice(0, 3);
  if (d.length >= 3) s += ")";
  if (d.length > 3) s += " " + d.slice(3, 6);
  if (d.length > 6) s += " " + d.slice(6, 8);
  if (d.length > 8) s += " " + d.slice(8, 10);
  return s;
}

function validateField(field: Field, v: Values): string {
  switch (field) {
    case "concept":
      return v.concept ? "" : "Bir konsept seçin.";
    case "city":
      return v.city ? "" : "İl seçin.";
    case "district":
      return v.district ? "" : "İlçe seçin.";
    case "budget":
      return v.budget ? "" : "Bütçe aralığınızı seçin.";
    case "property_status":
      return v.property_status ? "" : "Mülk durumunuzu seçin.";
    case "full_name":
      return v.full_name.trim().length >= 3 ? "" : "Adınızı ve soyadınızı yazın.";
    case "phone":
      if (!telDigits(v.phone)) return "Telefon numaranızı yazın.";
      return normalizePhone(v.phone) ? "" : "Telefon numarası 0 (5XX) XXX XX XX biçiminde olmalı.";
    case "email":
      return !v.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()) ? "" : "E-posta adresi ornek@alanadi.com biçiminde olmalı.";
    case "note":
      return v.note.length <= 1000 ? "" : "Açıklama en fazla 1000 karakter olabilir.";
    case "kvkk_consent":
      return v.kvkk_consent ? "" : "Devam etmek için KVKK Aydınlatma Metni’ni onaylayın.";
    default:
      return "";
  }
}

const FIELD_STEP: Record<string, number> = Object.fromEntries(STEPS.flatMap((s, i) => s.fields.map((f) => [f, i])));

function ChoiceRow({
  name,
  value,
  checked,
  onSelect,
  onPick,
  title,
  meta,
  index,
  describedBy,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  onPick: () => void;
  title: string;
  meta?: string;
  index: string;
  describedBy?: string;
}) {
  return (
    <label
      className={`group grid cursor-pointer grid-cols-[2rem_1fr_auto] items-baseline gap-4 border-b border-line py-5 transition-colors sm:grid-cols-[3rem_1fr_auto] ${
        checked ? "text-ink" : "text-stone hover:text-ink"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        onClick={(e) => {
          // Fare ya da dokunmayla seçildiyse sonraki adıma geç; klavyeyle gezinirken geçme
          if (e.detail > 0) onPick();
        }}
        aria-describedby={describedBy}
        className="peer sr-only"
      />
      <span className="label tabular">{index}</span>
      <span className="font-display text-3xl uppercase leading-none peer-focus-visible:underline peer-focus-visible:decoration-copper peer-focus-visible:underline-offset-8 sm:text-5xl">
        {title}
        {meta && <span className="mt-2 block font-sans text-sm normal-case tracking-normal text-stone tabular">{meta}</span>}
      </span>
      <span aria-hidden="true" className={`h-3.5 w-3.5 border border-current ${checked ? "border-copper bg-copper" : ""}`} />
    </label>
  );
}

type Props = {
  concepts: Concept[];
  contact: { phone: string; email: string; whatsapp: string };
};

export function ApplicationWizard({ concepts, contact }: Props) {
  const params = useSearchParams();
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [serverError, setServerError] = useState("");
  const [refCode, setRefCode] = useState("");
  const [hp, setHp] = useState("");
  const startedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const lastDigits = useRef("");

  // Başlangıç: oturum taslağı + bağlantıdan gelen seçimler
  useEffect(() => {
    startedAt.current = Date.now();
    let next = { ...EMPTY };
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
      if (draft && typeof draft === "object") next = { ...next, ...draft, kvkk_consent: false };
    } catch {}
    const k = params.get("konsept");
    if (k && (k === "undecided" || concepts.some((c) => c.slug === k))) next.concept = k;
    const b = params.get("butce");
    if (b && BUDGETS.some((x) => x.value === b)) next.budget = b;
    const m = params.get("mulk");
    if (m && PROPERTY_OPTIONS.some((x) => x.value === m)) next.property_status = m;
    if (next.city && !IL_ILCE[next.city]) next.city = next.district = "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcıya özel başlangıç değerleri (oturum taslağı, sorgu)
    setValues(next);
    const firstEmpty = STEPS.findIndex((s) => s.fields.some((f) => f !== "email" && f !== "note" && validateField(f, next)));
    setStep(firstEmpty === -1 ? STEPS.length - 1 : Math.min(firstEmpty, STEPS.length - 1));
  }, [params, concepts]);

  // Taslağı oturumda sakla (onaylar hariç)
  useEffect(() => {
    if (status === "done") return;
    try {
      const draft: Partial<Values> = { ...values };
      delete draft.kvkk_consent;
      delete draft.marketing_consent;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [values, status]);

  // Adım değişince soruya odaklan (ekran okuyucular için)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, status]);

  const set = <F extends Field>(field: F, value: Values[F]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: "" } : e));
  };

  const validateStep = (index: number, v = values) => {
    const stepErrors: Errors = {};
    for (const f of STEPS[index].fields) {
      const msg = validateField(f, v);
      if (msg) stepErrors[f] = msg;
    }
    setErrors((e) => ({ ...e, ...Object.fromEntries(STEPS[index].fields.map((f) => [f, stepErrors[f] ?? ""])) }));
    return stepErrors;
  };

  const focusField = (f: string) => {
    const el =
      document.querySelector<HTMLInputElement>(`input[name="${uid}-${f}"]:checked`) ??
      document.querySelector<HTMLInputElement>(`input[name="${uid}-${f}"]`) ??
      document.getElementById(`${uid}-${f}`);
    el?.focus();
  };

  const goNext = (v = values) => {
    const errs = validateStep(step, v);
    const first = Object.keys(errs)[0];
    if (first) {
      focusField(first);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const choose = <F extends Field>(field: F, value: Values[F]) => {
    const next = { ...values, [field]: value };
    set(field, value);
    // Tek seçimli adımlarda kısa bir gecikmeyle sonraki adıma geç
    window.setTimeout(() => goNext(next), 180);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    // Tüm adımları kontrol et
    for (let i = 0; i < STEPS.length; i++) {
      const errs = validateStep(i);
      const first = Object.keys(errs)[0];
      if (first) {
        setStep(i);
        window.setTimeout(() => focusField(first), 350);
        return;
      }
    }
    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch("/api/basvuru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          utm: readAttribution(),
          source_path: window.location.pathname + window.location.search,
          website: hp,
          elapsed_ms: Date.now() - startedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.ref) {
        setRefCode(data.ref);
        setStatus("done");
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {}
        return;
      }
      if (data.fields && typeof data.fields === "object") {
        setErrors(data.fields);
        const firstField = Object.keys(data.fields)[0];
        if (firstField && FIELD_STEP[firstField] !== undefined) setStep(FIELD_STEP[firstField]);
      }
      setServerError(
        data.message ||
          (res.status === 429
            ? "Kısa sürede çok fazla başvuru denemesi yapıldı. Lütfen bir süre sonra tekrar deneyin."
            : "Başvurunuz şu anda gönderilemedi. Lütfen tekrar deneyin."),
      );
    } catch {
      setServerError("Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.");
    }
    setStatus("idle");
  };

  const districts = useMemo(() => (values.city ? IL_ILCE[values.city] ?? [] : []), [values.city]);
  const conceptName = (slug: string) => (slug === "undecided" ? "Kararsızım" : concepts.find((c) => c.slug === slug)?.name ?? "");
  const progress = status === "done" ? 1 : (step + 1) / STEPS.length;
  const errId = (f: Field) => `${uid}-${f}-hata`;
  const fieldError = (f: Field) =>
    errors[f] ? (
      <p id={errId(f)} className="mt-3 text-sm font-medium text-danger">
        {errors[f]}
      </p>
    ) : null;

  const summary = [
    { step: 0, label: "Konsept", value: conceptName(values.concept) },
    { step: 1, label: "Lokasyon", value: values.city && values.district ? `${values.district}, ${values.city}` : "" },
    { step: 2, label: "Bütçe", value: values.budget ? budgetLabel(values.budget) : "" },
    {
      step: 3,
      label: "Mülk",
      value: PROPERTY_OPTIONS.find((p) => p.value === values.property_status)?.label ?? "",
    },
  ];

  if (status === "done") {
    return (
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-28 sm:px-8 sm:pt-36 lg:px-12" aria-live="polite">
        <div className="h-px w-full bg-copper" aria-hidden="true" />
        <div className="grid gap-12 pt-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-copper-ink">Başvurunuz alındı</p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-giga uppercase outline-none">
              Teşekkürler{values.full_name ? `, ${values.full_name.trim().split(/\s+/)[0]}` : ""}.
            </h1>
            <p className="mt-8 max-w-lg text-xl text-stone">
              Bayilik başvurunuz kaydedildi. Ekibimiz ön görüşme için verdiğiniz telefon numarasından sizinle iletişime geçecek.
            </p>
          </div>
          <div className="lg:col-span-5">
            <p className="label text-stone">Başvuru referans numarası</p>
            <p className="mt-4 select-all font-display text-5xl tabular tracking-[0.04em] sm:text-6xl" data-testid="ref-code">
              {refCode}
            </p>
            <p className="mt-4 text-stone">Bu numarayı not edin; görüşmelerde başvurunuzu hızlıca bulmamızı sağlar.</p>
            <div className="mt-10 grid gap-3">
              <Link href="/#yatirim-sureci" className="btn-line">
                Yatırım sürecini inceleyin <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/" className="btn-line">
                Ana sayfaya dönün <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const current = STEPS[step];

  return (
    <MotionConfig reducedMotion="user">
      <form onSubmit={submit} noValidate className="mx-auto max-w-[1600px] px-5 pb-24 pt-24 sm:px-8 sm:pt-32 lg:px-12">
        {/* İlerleme çizgisi */}
        <div className="sticky top-16 z-20 -mx-5 bg-ivory px-5 pb-4 pt-4 sm:top-20 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="flex items-baseline justify-between gap-4">
            <p className="label tabular text-copper-ink">
              Adım {step + 1} / {STEPS.length} · {current.label}
            </p>
            <ol className="hidden gap-6 lg:flex" aria-label="Başvuru adımları">
              {STEPS.map((s, i) => (
                <li key={s.key}>
                  <button
                    type="button"
                    disabled={i > step}
                    onClick={() => setStep(i)}
                    aria-current={i === step ? "step" : undefined}
                    className={`label ${i === step ? "text-ink" : i < step ? "text-stone hover:text-ink" : "text-stone/50"}`}
                  >
                    {String(i + 1).padStart(2, "0")} {s.label}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div
            className="relative mt-3 h-px bg-line"
            role="progressbar"
            aria-label="Başvuru ilerlemesi"
            aria-valuemin={0}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
          >
            <motion.div
              className="absolute inset-y-[-1px] left-0 origin-left bg-copper"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 0.8, 0.2, 1] }}
            />
          </div>
        </div>

        <div className="grid gap-14 pt-10 lg:grid-cols-12 lg:pt-16">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.fieldset
                key={current.key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
              >
                <legend className="sr-only">{current.question}</legend>
                <h1 ref={headingRef} tabIndex={-1} className="max-w-[18ch] text-title outline-none">
                  {current.question}
                </h1>

                <div className="mt-12">
                  {current.key === "concept" && (
                    <div role="radiogroup" aria-labelledby={`${uid}-concept-label`} className="border-t border-line">
                      <span id={`${uid}-concept-label`} className="sr-only">
                        Konsept
                      </span>
                      {[...concepts.map((c) => ({ value: c.slug, title: c.name, meta: `${areaLabel(c)} · ${priceLabel(c)}` })), { value: "undecided", title: "Kararsızım", meta: "Ön görüşmede birlikte belirleyelim" }].map(
                        (o, i) => (
                          <ChoiceRow
                            key={o.value}
                            name={`${uid}-concept`}
                            value={o.value}
                            index={String(i + 1).padStart(2, "0")}
                            title={o.title}
                            meta={o.meta}
                            checked={values.concept === o.value}
                            onSelect={() => set("concept", o.value)}
                            onPick={() => choose("concept", o.value)}
                            describedBy={errors.concept ? errId("concept") : undefined}
                          />
                        ),
                      )}
                                            {fieldError("concept")}
                    </div>
                  )}

                  {current.key === "location" && (
                    <div className="grid gap-10 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`${uid}-city`} className="label text-stone">
                          İl
                        </label>
                        <select
                          id={`${uid}-city`}
                          className="field-input mt-2"
                          value={values.city}
                          autoComplete="address-level1"
                          aria-invalid={Boolean(errors.city)}
                          aria-describedby={errors.city ? errId("city") : undefined}
                          onChange={(e) => {
                            set("city", e.target.value);
                            set("district", "");
                          }}
                        >
                          <option value="">İl seçin</option>
                          {ILLER.map((il) => (
                            <option key={il} value={il}>
                              {il}
                            </option>
                          ))}
                        </select>
                        {fieldError("city")}
                      </div>
                      <div>
                        <label htmlFor={`${uid}-district`} className="label text-stone">
                          İlçe
                        </label>
                        <select
                          id={`${uid}-district`}
                          className="field-input mt-2"
                          value={values.district}
                          disabled={!values.city}
                          autoComplete="address-level2"
                          aria-invalid={Boolean(errors.district)}
                          aria-describedby={errors.district ? errId("district") : undefined}
                          onChange={(e) => set("district", e.target.value)}
                        >
                          <option value="">{values.city ? "İlçe seçin" : "Önce il seçin"}</option>
                          {districts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        {fieldError("district")}
                      </div>
                    </div>
                  )}

                  {current.key === "budget" && (
                    <div role="radiogroup" aria-label="Bütçe aralığı" className="border-t border-line">
                      {BUDGETS.map((b, i) => (
                        <ChoiceRow
                          key={b.value}
                          name={`${uid}-budget`}
                          value={b.value}
                          index={String.fromCharCode(65 + i)}
                          title={b.label}
                          checked={values.budget === b.value}
                          onSelect={() => set("budget", b.value as BudgetValue)}
                          onPick={() => choose("budget", b.value as BudgetValue)}
                          describedBy={errors.budget ? errId("budget") : undefined}
                        />
                      ))}
                                            {fieldError("budget")}
                    </div>
                  )}

                  {current.key === "property" && (
                    <div role="radiogroup" aria-label="Mülk durumu" className="border-t border-line">
                      {PROPERTY_OPTIONS.map((p, i) => (
                        <ChoiceRow
                          key={p.value}
                          name={`${uid}-property_status`}
                          value={p.value}
                          index={String.fromCharCode(65 + i)}
                          title={p.value === "ready" ? "Hazır dükkânım var" : "Dükkânım yok"}
                          meta={p.value === "ready" ? "Kiralık ya da mülkiyetimde bir dükkân" : "Lokasyon desteği istiyorum"}
                          checked={values.property_status === p.value}
                          onSelect={() => set("property_status", p.value as PropertyValue)}
                          onPick={() => choose("property_status", p.value as PropertyValue)}
                          describedBy={errors.property_status ? errId("property_status") : undefined}
                        />
                      ))}
                                            {fieldError("property_status")}
                    </div>
                  )}

                  {current.key === "contact" && (
                    <div className="grid gap-10 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor={`${uid}-full_name`} className="label text-stone">
                          Ad Soyad
                        </label>
                        <input
                          id={`${uid}-full_name`}
                          className="field-input mt-2"
                          type="text"
                          autoComplete="name"
                          autoCapitalize="words"
                          maxLength={100}
                          value={values.full_name}
                          aria-invalid={Boolean(errors.full_name)}
                          aria-describedby={errors.full_name ? errId("full_name") : undefined}
                          onChange={(e) => set("full_name", e.target.value)}
                          onBlur={() => setErrors((er) => ({ ...er, full_name: values.full_name ? validateField("full_name", values) : er.full_name }))}
                        />
                        {fieldError("full_name")}
                      </div>
                      <div>
                        <label htmlFor={`${uid}-phone`} className="label text-stone">
                          Telefon
                        </label>
                        <input
                          id={`${uid}-phone`}
                          className="field-input mt-2 tabular"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          placeholder="0 (5XX) XXX XX XX"
                          maxLength={20}
                          value={values.phone}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={`${uid}-phone-ipucu${errors.phone ? ` ${errId("phone")}` : ""}`}
                          onChange={(e) => {
                            let d = telDigits(e.target.value);
                            const native = e.nativeEvent as InputEvent;
                            if (native.inputType === "deleteContentBackward" && d === lastDigits.current) d = d.slice(0, -1);
                            lastDigits.current = d;
                            set("phone", formatTel(d));
                          }}
                          onBlur={() => setErrors((er) => ({ ...er, phone: values.phone ? validateField("phone", values) : er.phone }))}
                        />
                        <p id={`${uid}-phone-ipucu`} className="mt-3 text-sm text-stone">
                          Ön görüşme için sizi bu numaradan arayacağız.
                        </p>
                        {fieldError("phone")}
                      </div>
                      <div>
                        <label htmlFor={`${uid}-email`} className="label text-stone">
                          E-posta <span className="normal-case tracking-normal">(isteğe bağlı)</span>
                        </label>
                        <input
                          id={`${uid}-email`}
                          className="field-input mt-2"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          maxLength={160}
                          value={values.email}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? errId("email") : undefined}
                          onChange={(e) => set("email", e.target.value)}
                          onBlur={() => setErrors((er) => ({ ...er, email: validateField("email", values) }))}
                        />
                        {fieldError("email")}
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor={`${uid}-note`} className="label text-stone">
                          Ek açıklama <span className="normal-case tracking-normal">(isteğe bağlı)</span>
                        </label>
                        <textarea
                          id={`${uid}-note`}
                          className="field-input mt-2 min-h-28 resize-y"
                          maxLength={1000}
                          rows={3}
                          value={values.note}
                          aria-describedby={`${uid}-note-sayac`}
                          onChange={(e) => set("note", e.target.value)}
                        />
                        <p id={`${uid}-note-sayac`} className="mt-2 text-right text-xs text-stone tabular">
                          {values.note.length} / 1000
                        </p>
                      </div>
                      <div className="grid gap-5 sm:col-span-2">
                        <label className="flex cursor-pointer items-start gap-4 text-base">
                          <input
                            id={`${uid}-kvkk_consent`}
                            type="checkbox"
                            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-copper)]"
                            checked={values.kvkk_consent}
                            aria-invalid={Boolean(errors.kvkk_consent)}
                            aria-describedby={errors.kvkk_consent ? errId("kvkk_consent") : undefined}
                            onChange={(e) => set("kvkk_consent", e.target.checked)}
                          />
                          <span>
                            <Link href="/kvkk" target="_blank" className="text-copper-ink underline underline-offset-4">
                              KVKK Aydınlatma Metni
                            </Link>
                            ’ni okudum; başvurumun değerlendirilmesi için benimle iletişime geçilmesini kabul ediyorum.
                          </span>
                        </label>
                        {fieldError("kvkk_consent")}
                        <label className="flex cursor-pointer items-start gap-4 text-base text-stone">
                          <input
                            type="checkbox"
                            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-copper)]"
                            checked={values.marketing_consent}
                            onChange={(e) => set("marketing_consent", e.target.checked)}
                          />
                          <span>Yeni yatırım fırsatları hakkında SMS ve e-posta almak istiyorum. (isteğe bağlı)</span>
                        </label>
                      </div>
                      {/* Bot tuzağı: insanlar görmez, doldurulursa başvuru kaydedilmez */}
                      <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
                        <label htmlFor={`${uid}-website`}>Web siteniz</label>
                        <input id={`${uid}-website`} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.fieldset>
            </AnimatePresence>

            {serverError && (
              <div role="alert" className="mt-10 border border-danger/50 bg-paper px-5 py-4 text-ink">
                <p>{serverError}</p>
                {(contact.phone || contact.whatsapp || contact.email) && (
                  <p className="mt-2 text-sm text-stone">
                    Dilerseniz bize doğrudan ulaşın:{" "}
                    {[contact.phone && `Telefon ${contact.phone}`, contact.whatsapp && `WhatsApp ${contact.whatsapp}`, contact.email]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            )}

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
              <button
                type="button"
                className="label py-3 text-stone hover:text-ink disabled:invisible"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || status === "submitting"}
              >
                ← Geri
              </button>
              {step < STEPS.length - 1 ? (
                <button type="submit" className="btn-line min-w-48">
                  Devam <span aria-hidden="true">↗</span>
                </button>
              ) : (
                <button type="submit" className="btn-solid w-full sm:w-auto sm:min-w-[22rem]" disabled={status === "submitting"}>
                  {status === "submitting" ? "Gönderiliyor…" : "Yatırım başvurumu tamamla"} <span aria-hidden="true">↗</span>
                </button>
              )}
            </div>
          </div>

          <aside className="lg:col-span-3 lg:col-start-10" aria-label="Seçimleriniz">
            <div className="lg:sticky lg:top-44">
              <p className="label text-stone">Seçimleriniz</p>
              <dl className="mt-4 border-t border-line">
                {summary.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
                    <dt className="label text-stone">{s.label}</dt>
                    <dd className="text-right">
                      {s.value ? (
                        <button type="button" onClick={() => setStep(s.step)} className="text-ink underline-offset-4 hover:underline">
                          {s.value}
                        </button>
                      ) : (
                        <span className="text-stone/70">Seçilmedi</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-stone">Başvuru formu herhangi bir ödeme ya da bağlayıcı taahhüt içermez.</p>
            </div>
          </aside>
        </div>
      </form>
    </MotionConfig>
  );
}
