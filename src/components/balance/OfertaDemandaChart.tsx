"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { OfertaDemanda } from "@/lib/types";

interface Props {
  data: OfertaDemanda[];
}

export function OfertaDemandaChart({ data }: Props) {
  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <h3 className="text-sm font-semibold">Relação Oferta vs. Demanda</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comparativo entre a oferta hídrica e a demanda total para diferentes
          garantias.
        </p>
      </div>
      <div className="p-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              barCategoryGap="20%"
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Cenário"
                fontSize={12}
                tick={{ fill: "#4B5563" }}
              />
              <YAxis
                label={{
                  value: "L/s",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#4B5563",
                  fontSize: 12,
                }}
                tick={{ fill: "#4B5563" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(225, 225, 225, 1)",
                  borderColor: "#e5e7eb",
                  fontSize: 12,
                  borderRadius: 8,
                  color: "#111827",
                }}
                formatter={(value: number) => `${value.toFixed(2)} L/s`}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="Oferta (L/s)"
                fill="var(--chart-1)"
                name="Oferta (Vazão Regularizada)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="Demanda (L/s)"
                fill="var(--chart-2)"
                name="Demanda Total"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
