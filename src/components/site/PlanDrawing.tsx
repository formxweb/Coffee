import type { Concept } from "@/lib/types";

// Konseptlerin temsili plan çizimi. Gerçek proje çizimi değildir; ölçüler konseptin m² bilgisinden türetilir.

type Layer = "shell" | "bar" | "seating" | "dims";

type Props = {
  concept: Pick<Concept, "slug" | "name" | "areaMin" | "areaMax">;
  /** Silinecek duvar boşlukları için zemin rengi */
  background: string;
  highlight?: Layer | null;
  className?: string;
  showTitle?: boolean;
};

type Size = { w: number; h: number };

export function roomSize(c: Props["concept"]): Size {
  if (c.slug === "corner") return { w: 6, h: 5 };
  if (c.slug === "mahal") return { w: 12.5, h: 10 };
  if (c.slug === "agora") return { w: 16, h: 12.5 };
  const area = (c.areaMin + c.areaMax) / 2;
  const w = Math.sqrt(area * 1.25);
  return { w: Math.round(w * 2) / 2, h: Math.round((area / w) * 2) / 2 };
}

const VB_W = 1000;
const VB_H = 720;
const PAD = { left: 110, right: 60, top: 56, bottom: 128 };

const m = (n: number) => n.toFixed(2).replace(".", ",");

function Table2({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={0.36} />
      <circle cx={x - 0.62} cy={y} r={0.2} />
      <circle cx={x + 0.62} cy={y} r={0.2} />
    </g>
  );
}

function Stools({ x1, x2, y, step = 0.8 }: { x1: number; x2: number; y: number; step?: number }) {
  const out = [];
  for (let x = x1 + step / 2; x <= x2 - step / 2 + 0.001; x += step) out.push(<circle key={x} cx={x} cy={y} r={0.19} />);
  return <g>{out}</g>;
}

export function PlanDrawing({ concept, background, highlight = null, className, showTitle = true }: Props) {
  const { w: W, h: H } = roomSize(concept);
  const s = Math.min((VB_W - PAD.left - PAD.right) / W, (VB_H - PAD.top - PAD.bottom) / H);
  const ox = PAD.left + (VB_W - PAD.left - PAD.right - W * s) / 2;
  const oy = PAD.top + (VB_H - PAD.top - PAD.bottom - H * s) / 2;
  const px = (x: number) => ox + x * s;
  const py = (y: number) => oy + y * s;

  const big = W >= 10;
  const barLen = big ? Math.min(W * 0.4, 6.5) : 3.4;
  const barX = W - barLen - 0.6;
  const barY = 0.6;
  const boh = big ? { w: W >= 15 ? 4 : 3.2, h: W >= 15 ? 3.8 : 3.4 } : null;
  const door = { x1: 0.8, x2: 1.9 };
  const glazing = { x1: big ? 3.2 : 2.3, x2: W - 0.5 };

  const seatTop = barY + 0.7 + 1.9;
  const seatBottom = H - 2.2;
  const communal = big && W >= 15 ? { x1: W / 2 - 2.4, x2: W / 2 + 2.4, y: (seatTop + seatBottom) / 2 } : null;
  const tables: { x: number; y: number }[] = [];
  if (!big) {
    tables.push({ x: 1.5, y: 2.6 });
  } else {
    for (let y = seatTop; y <= seatBottom + 0.01; y += 2.1) {
      for (let x = 1.4; x <= W - 1.4 + 0.01; x += 2.5) {
        if (boh && x < boh.w + 0.8 && y < boh.h + 1.0) continue;
        if (communal && x > communal.x1 - 1.2 && x < communal.x2 + 1.2 && Math.abs(y - communal.y) < 1.6) continue;
        tables.push({ x, y });
      }
    }
  }

  const dim = (layer: Layer) => (highlight && highlight !== layer ? 0.28 : 1);
  const stroke = { vectorEffect: "non-scaling-stroke" as const };

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={`plan-svg ${className ?? ""}`}
      role="img"
      aria-label={`${concept.name} için temsili yerleşim çizimi, yaklaşık ${m(W)} × ${m(H)} metre`}
      fill="none"
      stroke="currentColor"
    >
      {/* 1 metrelik yardımcı ızgara */}
      <g opacity={0.1} strokeWidth={1}>
        {Array.from({ length: Math.floor(W) - 0 }, (_, i) => (
          <line key={`gx${i}`} x1={px(i + 1)} y1={py(0)} x2={px(i + 1)} y2={py(H)} />
        ))}
        {Array.from({ length: Math.floor(H) - 0 }, (_, i) => (
          <line key={`gy${i}`} x1={px(0)} y1={py(i + 1)} x2={px(W)} y2={py(i + 1)} />
        ))}
      </g>

      <g transform={`translate(${ox} ${oy}) scale(${s})`}>
        {/* Kabuk: duvarlar, vitrin, kapı */}
        <g opacity={dim("shell")} style={{ transition: "opacity .5s" }}>
          <rect x={0} y={0} width={W} height={H} strokeWidth={2.6} {...stroke} />
          <rect x={0.22} y={0.22} width={W - 0.44} height={H - 0.44} strokeWidth={1} {...stroke} />
          {/* vitrin boşluğu */}
          <rect x={glazing.x1} y={H - 0.3} width={glazing.x2 - glazing.x1} height={0.6} fill={background} stroke="none" />
          <line x1={glazing.x1} y1={H - 0.11} x2={glazing.x2} y2={H - 0.11} strokeWidth={1} {...stroke} />
          <line x1={glazing.x1} y1={H + 0.11} x2={glazing.x2} y2={H + 0.11} strokeWidth={1} {...stroke} />
          <line x1={glazing.x1} y1={H} x2={glazing.x2} y2={H} strokeWidth={0.6} opacity={0.6} {...stroke} />
          {/* kapı */}
          <rect x={door.x1} y={H - 0.3} width={door.x2 - door.x1} height={0.6} fill={background} stroke="none" />
          <line x1={door.x1} y1={H} x2={door.x1} y2={H - (door.x2 - door.x1)} strokeWidth={1.4} {...stroke} />
          <path
            d={`M ${door.x2} ${H} A ${door.x2 - door.x1} ${door.x2 - door.x1} 0 0 0 ${door.x1} ${H - (door.x2 - door.x1)}`}
            strokeWidth={0.8}
            strokeDasharray="3 3"
            {...stroke}
          />
          {boh && (
            <g>
              <line x1={boh.w} y1={0} x2={boh.w} y2={boh.h - 1.1} strokeWidth={1.6} {...stroke} />
              <line x1={0} y1={boh.h} x2={boh.w - 1.1} y2={boh.h} strokeWidth={1.6} {...stroke} />
              <path d={`M ${boh.w} ${boh.h - 1.1} A 1 1 0 0 1 ${boh.w - 1} ${boh.h - 0.1}`} strokeWidth={0.8} strokeDasharray="3 3" {...stroke} />
            </g>
          )}
        </g>

        {/* Bar */}
        <g opacity={dim("bar")} style={{ transition: "opacity .5s" }}>
          <line x1={barX} y1={0.42} x2={barX + barLen} y2={0.42} strokeWidth={1} {...stroke} />
          <rect x={barX} y={barY + 0.35} width={barLen} height={0.7} strokeWidth={1.6} {...stroke} />
          <rect x={barX + 0.4} y={barY + 0.48} width={0.9} height={0.44} strokeWidth={1} {...stroke} />
          <Stools x1={barX} x2={barX + barLen} y={barY + 1.45} step={big ? 0.95 : 0.85} />
        </g>

        {/* Oturma */}
        <g opacity={dim("seating")} style={{ transition: "opacity .5s" }} strokeWidth={1} {...stroke}>
          {tables.map((t) => (
            <Table2 key={`${t.x}-${t.y}`} x={t.x} y={t.y} />
          ))}
          {/* vitrin önü bar */}
          <rect x={glazing.x1 + 0.2} y={H - 0.95} width={glazing.x2 - glazing.x1 - 0.4} height={0.4} strokeWidth={1} {...stroke} />
          <Stools x1={glazing.x1 + 0.2} x2={glazing.x2 - 0.2} y={H - 1.35} step={big ? 1 : 0.8} />
          {communal && (
            <g>
              <rect x={communal.x1} y={communal.y - 0.5} width={communal.x2 - communal.x1} height={1} strokeWidth={1.4} {...stroke} />
              <Stools x1={communal.x1} x2={communal.x2} y={communal.y - 0.85} step={0.8} />
              <Stools x1={communal.x1} x2={communal.x2} y={communal.y + 0.85} step={0.8} />
            </g>
          )}
        </g>
      </g>

      {/* Etiketler */}
      <g fill="currentColor" stroke="none" fontFamily="var(--font-jost), sans-serif" letterSpacing="3" fontSize="13">
        <text x={px(barX + barLen / 2)} y={py(barY + 2.3)} textAnchor="middle" opacity={dim("bar")}>
          BAR
        </text>
        <text x={px((door.x1 + door.x2) / 2)} y={py(H) + 26} textAnchor="middle" opacity={dim("shell")}>
          GİRİŞ
        </text>
        {boh && (
          <text x={px(boh.w / 2)} y={py(boh.h / 2)} textAnchor="middle" opacity={dim("shell")}>
            HİZMET
          </text>
        )}
      </g>

      {/* Ölçü çizgileri */}
      <g opacity={dim("dims")} strokeWidth={1} style={{ transition: "opacity .5s" }}>
        <line x1={px(0)} y1={py(H) + 52} x2={px(W)} y2={py(H) + 52} />
        <line x1={px(0)} y1={py(H) + 44} x2={px(0)} y2={py(H) + 60} />
        <line x1={px(W)} y1={py(H) + 44} x2={px(W)} y2={py(H) + 60} />
        <line x1={px(0) - 6} y1={py(H) + 58} x2={px(0) + 6} y2={py(H) + 46} strokeWidth={2} />
        <line x1={px(W) - 6} y1={py(H) + 58} x2={px(W) + 6} y2={py(H) + 46} strokeWidth={2} />
        <line x1={px(0) - 52} y1={py(0)} x2={px(0) - 52} y2={py(H)} />
        <line x1={px(0) - 60} y1={py(0)} x2={px(0) - 44} y2={py(0)} />
        <line x1={px(0) - 60} y1={py(H)} x2={px(0) - 44} y2={py(H)} />
        <line x1={px(0) - 58} y1={py(0) + 6} x2={px(0) - 46} y2={py(0) - 6} strokeWidth={2} />
        <line x1={px(0) - 58} y1={py(H) + 6} x2={px(0) - 46} y2={py(H) - 6} strokeWidth={2} />
        <g fill="currentColor" stroke="none" fontFamily="var(--font-jost), sans-serif" fontSize="15" letterSpacing="1.5">
          <text x={(px(0) + px(W)) / 2} y={py(H) + 78} textAnchor="middle">
            {m(W)} m
          </text>
          <text
            x={px(0) - 64}
            y={(py(0) + py(H)) / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${px(0) - 64} ${(py(0) + py(H)) / 2})`}
          >
            {m(H)} m
          </text>
        </g>
      </g>

      {showTitle && (
        <g fill="currentColor" stroke="none" fontFamily="var(--font-jost), sans-serif">
          <line x1={VB_W - 330} y1={VB_H - 44} x2={VB_W - 60} y2={VB_H - 44} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <text x={VB_W - 60} y={VB_H - 54} textAnchor="end" fontSize="12" letterSpacing="3.5">
            TEMSİLİ YERLEŞİM
          </text>
          <text x={VB_W - 60} y={VB_H - 22} textAnchor="end" fontSize="12" letterSpacing="3.5" opacity={0.7}>
            {`${concept.name.toLocaleUpperCase("tr-TR")} · ${
              concept.areaMin === concept.areaMax ? concept.areaMin : `${concept.areaMin}–${concept.areaMax}`
            } M²`}
          </text>
        </g>
      )}
    </svg>
  );
}
