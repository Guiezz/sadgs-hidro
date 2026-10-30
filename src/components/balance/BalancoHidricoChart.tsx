"use client";

import { useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BalancoMensal } from "@/lib/types";
import { mesesAbaixoDaDemanda, resumoAfluencia } from "@/lib/water";
import { formatNumber } from "@/lib/format";
import { ChartFigure } from "@/components/app/ChartFigure";
import { SectionCard } from "@/components/app/SectionCard";

const MESES: Record<string, string> = {
  Jan: "janeiro", Fev: "fevereiro", Mar: "março", Abr: "abril", Mai: "maio", Jun: "junho",
  Jul: "julho", Ago: "agosto", Set: "setembro", Out: "outubro", Nov: "novembro", Dez: "dezembro",
};

const mesExtenso = (m: string) => MESES[m] ?? m.toLowerCase();

export function BalancoHidricoChart({ data }: { data: BalancoMensal[] }) {
  const reduceMotion = useReducedMotion();
  const demanda = data[0]?.["Demanda (m³/s)"] ?? 0;
  const abaixo = mesesAbaixoDaDemanda(data);
  const resumo = resumoAfluencia(abaixo.map(mesExtenso));

  return (
    <SectionCard
      id="af-titulo"
      title="Afluência mensal x demanda"
      description="Vazão média que chega ao reservatório em cada mês, em m³/s."
      actions={
        <ul aria-label="Legenda" className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-water" />
            Afluência acima da demanda
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-scarcity" />
            Abaixo da demanda
          </li>
          <li className="flex items-center gap-2">
            <svg aria-hidden="true" width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke="var(--label)" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            Demanda {formatNumber(demanda, 3)} m³/s
          </li>
        </ul>
      }
    >
      <ChartFigure
        ariaLabel={`Gráfico de barras da afluência mensal comparada à demanda de ${formatNumber(demanda, 3)} m³/s. ${resumo}`}
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="Mês"
                tick={{ fontSize: 12, fill: "var(--label)" }}
                axisLine={{ stroke: "var(--input)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--label)" }}
                tickFormatter={(v: number) => formatNumber(v, 1)}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                formatter={(value: number) => [`${formatNumber(value, 3)} m³/s`, "Afluência"]}
                contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 13 }}
              />
              <Bar dataKey="Afluência (m³/s)" radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion}>
                {data.map((m) => (
                  <Cell
                    key={m["Mês"]}
                    fill={m["Afluência (m³/s)"] < m["Demanda (m³/s)"] ? "var(--scarcity)" : "var(--water)"}
                  />
                ))}
              </Bar>
              <ReferenceLine y={demanda} stroke="var(--label)" strokeWidth={2} strokeDasharray="4 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartFigure>
      <p className="m-0 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-label" />
        {resumo}
      </p>
    </SectionCard>
  );
}
