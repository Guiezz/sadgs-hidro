"use client";

import type { ReactNode } from "react";
import { StateBadge } from "@/components/app/StateBadge";
import { DROUGHT_STATES, droughtClasses, droughtLabel, normalizeDroughtState } from "@/lib/drought-state";
import { formatNumber } from "@/lib/format";

interface CurrentStateCardProps {
  state: string;
  volumePct: number;
  // Metas do mês em % da capacidade (Meta 1 > Meta 2 > Meta 3).
  metas: { meta1: number; meta2: number; meta3: number } | null;
  monthName: string;
  children: ReactNode; // a <dl> de KPIs ao lado
}

const CX = 100;
const CY = 100;
const R = 80;

// Ponto do arco para uma porcentagem (0% à esquerda, 100% à direita).
function arcPoint(pct: number) {
  const angle = Math.PI * (1 - Math.min(Math.max(pct, 0), 100) / 100);
  return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
}

function arc(from: number, to: number) {
  const a = arcPoint(from);
  const b = arcPoint(to);
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} A${R} ${R} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function CurrentStateCard({ state, volumePct, metas, monthName, children }: CurrentStateCardProps) {
  const key = normalizeDroughtState(state);
  const needle = arcPoint(volumePct);
  const segments = metas
    ? [
        { from: 0, to: metas.meta3, key: "severa" },
        { from: metas.meta3, to: metas.meta2, key: "seca" },
        { from: metas.meta2, to: metas.meta1, key: "alerta" },
        { from: metas.meta1, to: 100, key: "normal" },
      ]
    : [{ from: 0, to: 100, key: key ?? "normal" }];

  return (
    <section
      aria-labelledby="estado-titulo"
      className="flex flex-wrap overflow-hidden rounded-[20px] border border-border bg-card"
    >
      <div className="flex flex-[1_1_360px] flex-col items-center gap-2 border-border bg-background p-7 md:border-r">
        <h2
          id="estado-titulo"
          className="m-0 self-start text-[13px] font-bold uppercase tracking-[0.06em] text-label"
        >
          Estado atual
        </h2>
        <svg
          role="img"
          aria-label={`Medidor do estado de seca: ${formatNumber(volumePct, 1)}% do volume, estado ${key ? droughtLabel(key) : "desconhecido"}`}
          width="280"
          height="160"
          viewBox="0 0 200 116"
          className="max-w-full"
        >
          {segments.map((s) => (
            <path
              key={s.from}
              d={arc(s.from, s.to)}
              fill="none"
              strokeWidth="16"
              stroke={`var(--estado-${s.key}-dot)`}
            />
          ))}
          <line
            x1={CX}
            y1={CY}
            x2={CX + (needle.x - CX) * 0.78}
            y2={CY - (CY - needle.y) * 0.78}
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-foreground"
          />
          <circle cx={CX} cy={CY} r="7" className="fill-foreground" />
          <text x="20" y="114" fontSize="9" textAnchor="middle" className="fill-label">
            0%
          </text>
          <text x="180" y="114" fontSize="9" textAnchor="middle" className="fill-label">
            100%
          </text>
        </svg>
        <StateBadge state={state} className="text-[15px]" />
        <ul
          aria-label="Legenda dos estados"
          className="m-0 mt-2 flex list-none flex-wrap justify-center gap-x-3.5 gap-y-1.5 p-0 text-xs text-muted-foreground"
        >
          {DROUGHT_STATES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-2.5 rounded-[2px] ${droughtClasses(s.key).dot}`} />
              {s.label}
            </li>
          ))}
        </ul>
        {metas && (
          <p className="m-0 mt-1 text-center text-xs text-muted-foreground">
            Metas de {monthName}: Meta 1 {formatNumber(metas.meta1, 1)}% · Meta 2 {formatNumber(metas.meta2, 1)}% ·
            Meta 3 {formatNumber(metas.meta3, 1)}%
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
