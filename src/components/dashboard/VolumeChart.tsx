"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "@/lib/types";
import { type ChartPeriod, filterByPeriod } from "@/lib/monitoring";
import { formatNumber } from "@/lib/format";
import { ChartFigure } from "@/components/app/ChartFigure";
import { EmptyState } from "@/components/app/EmptyState";
import { SectionCard } from "@/components/app/SectionCard";
import { SegmentedControl } from "@/components/app/SegmentedControl";

interface VolumeChartProps {
  data: ChartDataPoint[];
  capacidadeMaxima?: number;
  reservatorio: string;
}

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: "1a", label: "1 ano" },
  { value: "5a", label: "5 anos" },
  { value: "10a", label: "10 anos" },
  { value: "tudo", label: "Tudo" },
];

const SERIES = [
  { key: "volume", label: "Volume", color: "var(--water)", width: 3, dash: undefined },
  { key: "meta1", label: "Meta 1", color: "var(--meta-1)", width: 2, dash: "6 4" },
  { key: "meta2", label: "Meta 2", color: "var(--meta-2)", width: 2, dash: "2 3" },
  { key: "meta3", label: "Meta 3", color: "var(--meta-3)", width: 2, dash: "10 3 2 3" },
] as const;

const monthYear = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${m}/${y}`;
};

export function VolumeChart({ data, capacidadeMaxima, reservatorio }: VolumeChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("10a");
  const reduceMotion = useReducedMotion();

  // Metas chegam como fração da capacidade; no gráfico ficam em hm³, no mesmo eixo do volume.
  const chartData = useMemo(() => {
    const cap = capacidadeMaxima ?? 0;
    return filterByPeriod(data, period).map((p) => ({
      Data: p.Data,
      volume: p.volume,
      meta1: cap ? p.meta1 * cap : null,
      meta2: cap ? p.meta2 * cap : null,
      meta3: cap ? p.meta3 * cap : null,
    }));
  }, [data, period, capacidadeMaxima]);

  const first = chartData[0];
  const last = chartData[chartData.length - 1];
  const ariaLabel =
    first && last
      ? `Gráfico de linhas do volume do ${reservatorio} entre ${monthYear(first.Data)} e ${monthYear(last.Data)}: de ${formatNumber(first.volume)} para ${formatNumber(last.volume)} hm³, comparado às metas 1, 2 e 3.`
      : "Gráfico de volume sem dados.";

  return (
    <SectionCard
      id="graf-titulo"
      title="Volume comparado com as metas"
      description="Volume armazenado (hm³) e metas do Plano de Seca ao longo do tempo."
      actions={
        <SegmentedControl label="Período do gráfico" options={PERIODS} value={period} onChange={setPeriod} />
      }
    >
      {chartData.length === 0 ? (
        <EmptyState title="Sem dados de volume" description="Ainda não há registros de volume para este reservatório." />
      ) : (
        <ChartFigure
          ariaLabel={ariaLabel}
          legend={SERIES.map((s) => ({
            label: s.label,
            swatch: (
              <svg width="28" height="10">
                <line x1="0" y1="5" x2="28" y2="5" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} />
              </svg>
            ),
          }))}
          caption={`Registros de ${monthYear(first.Data)} a ${monthYear(last.Data)}. Metas convertidas de % da capacidade para hm³.`}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="Data"
                  tickFormatter={(v: string) => v.slice(0, 4)}
                  minTickGap={48}
                  tick={{ fontSize: 12, fill: "var(--label)" }}
                  axisLine={{ stroke: "var(--input)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, capacidadeMaxima ? Math.ceil(capacidadeMaxima) : "auto"]}
                  tick={{ fontSize: 12, fill: "var(--label)" }}
                  tickFormatter={(v: number) => formatNumber(v, 0)}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [`${formatNumber(value)} hm³`, name]}
                  labelFormatter={(label: string) => label.split("-").reverse().join("/")}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    fontSize: 13,
                  }}
                />
                {SERIES.map((s) => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    type="monotone"
                    stroke={s.color}
                    strokeWidth={s.width}
                    strokeDasharray={s.dash}
                    dot={false}
                    connectNulls
                    isAnimationActive={!reduceMotion}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartFigure>
      )}
      <details className="group border-t border-border pt-3.5">
        <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <Info aria-hidden="true" className="size-4 text-label" />
          Entenda as metas
          <ChevronDown aria-hidden="true" className="ml-auto size-4 transition-transform group-open:rotate-180" />
        </summary>
        <p className="m-0 mt-3 text-sm leading-relaxed text-muted-foreground">
          As metas são os volumes de referência (em % da capacidade) definidos no Plano de Seca para cada mês.
          Quando o volume fica abaixo de uma meta, o reservatório muda de estado e novas medidas passam a valer.
        </p>
      </details>
    </SectionCard>
  );
}

