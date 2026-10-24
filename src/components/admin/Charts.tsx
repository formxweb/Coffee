"use client";

import { useId, useState } from "react";

export type Datum = { key: string; label: string; value: number; detail?: string };

function niceMax(max: number): number {
  if (max <= 1) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 2, 5, 10]) {
    if (m * pow >= max) return m * pow;
  }
  return 10 * pow;
}

const fmt = new Intl.NumberFormat("tr-TR");

/** Zaman serisi için sütun grafiği: tek seri, tek renk; her sütun üzerine gelince ve klavyeyle değer gösterir. */
export function ColumnChart({ data, title, unit = "başvuru" }: { data: Datum[]; title: string; unit?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const top = niceMax(Math.max(0, ...data.map((d) => d.value)));
  // Başvuru sayıları tam sayıdır; ara çizgi yalnızca tam sayıya denk geliyorsa çizilir
  const ticks = top <= 2 || (top / 2) % 1 !== 0 ? [0, top] : [0, top / 2, top];
  const total = data.reduce((s, d) => s + d.value, 0);
  const current = active !== null ? data[active] : null;
  const labelIdx = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <figure>
      <figcaption className="sr-only">
        {title}: toplam {fmt.format(total)} {unit}
      </figcaption>
      <div
        className="relative mt-2 grid grid-cols-[2.5rem_1fr] outline-none focus-visible:outline-2 focus-visible:outline-copper"
        tabIndex={0}
        role="group"
        aria-label={`${title}. Sol ve sağ ok tuşlarıyla günler arasında gezinin.`}
        aria-describedby={`${id}-okuma`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setActive((i) => Math.min(data.length - 1, (i ?? -1) + 1));
          else if (e.key === "ArrowLeft") setActive((i) => Math.max(0, (i ?? data.length) - 1));
          else if (e.key === "Escape") setActive(null);
          else return;
          e.preventDefault();
        }}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
      >
        <div className="relative h-56 text-right text-xs text-stone tabular" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-3" style={{ bottom: `${(t / top) * 100}%`, transform: "translateY(50%)" }}>
              {fmt.format(t)}
            </span>
          ))}
        </div>
        <div className="relative h-56">
          {ticks.map((t) => (
            <span key={t} aria-hidden="true" className="absolute inset-x-0 h-px bg-line" style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <div
                key={d.key}
                className="flex h-full flex-1 cursor-default items-end justify-center"
                onPointerEnter={() => setActive(i)}
                onPointerDown={() => setActive(i)}
              >
                <div
                  className={`w-full max-w-6 rounded-t-[4px] transition-opacity ${active === null || active === i ? "opacity-100" : "opacity-55"} bg-copper`}
                  style={{ height: d.value ? `${(d.value / top) * 100}%` : 0 }}
                />
              </div>
            ))}
          </div>
          {current && active !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-line bg-paper px-3 py-2 shadow-[0_10px_24px_-16px_rgba(27,20,17,0.5)]"
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
            >
              <p className="text-base font-medium text-ink tabular">
                {fmt.format(current.value)} {unit}
              </p>
              <p className="text-xs text-stone">{current.detail ?? current.label}</p>
            </div>
          )}
        </div>
        <div />
        <div className="relative mt-2 h-5 text-xs text-stone" aria-hidden="true">
          {data.map((d, i) =>
            labelIdx.has(i) ? (
              <span
                key={d.key}
                className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
                style={{ left: `${((i + 0.5) / data.length) * 100}%` }}
              >
                {d.label}
              </span>
            ) : null,
          )}
        </div>
      </div>
      <p id={`${id}-okuma`} className="sr-only" aria-live="polite">
        {current ? `${current.detail ?? current.label}: ${current.value} ${unit}` : ""}
      </p>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-stone hover:text-ink">Tablo olarak göster</summary>
        <div className="mt-3 max-h-64 overflow-auto border-t border-line">
          <table className="w-full text-left tabular">
            <thead className="sr-only">
              <tr>
                <th scope="col">Gün</th>
                <th scope="col">Başvuru</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.key} className="border-b border-line">
                  <td className="py-1.5 text-stone">{d.detail ?? d.label}</td>
                  <td className="py-1.5 text-right text-ink">{fmt.format(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

/** Kategori karşılaştırması için yatay çubuklar: tek renk, değer çubuğun ucunda. */
export function BarList({ data, title, empty = "Bu dönemde veri yok." }: { data: Datum[]; title: string; empty?: string }) {
  const max = Math.max(0, ...data.map((d) => d.value));
  if (max === 0) return <p className="py-6 text-sm text-stone">{empty}</p>;
  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <ul className="grid gap-3">
        {data.map((d) => (
          <li key={d.key} className="grid grid-cols-[minmax(7rem,9rem)_1fr] items-center gap-4">
            <span className="truncate text-sm text-ink" title={d.label}>
              {d.label}
            </span>
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="block h-3 rounded-r-[4px] bg-copper"
                style={{ width: d.value ? `max(4px, ${(d.value / max) * 85}%)` : 0 }}
              />
              <span className="text-sm text-stone tabular">
                <span className="sr-only">{d.label}: </span>
                {fmt.format(d.value)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
