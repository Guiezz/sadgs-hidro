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

import { BalancoMensal } from "@/lib/types";

interface Props {
  data: BalancoMensal[];
}

export function BalancoHidricoChart({ data }: Props) {
  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <h3 className="text-sm font-semibold">Afluência Mensal</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vazão de água mensal que chega ao reservatório em determinado mês.
        </p>
      </div>
      <div className="p-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Mês" fontSize={12} tick={{ fill: "#4B5563" }} />
              <YAxis
                label={{
                  value: "m³/s",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#4B5563",
                  fontSize: 12,
                }}
                tick={{ fill: "#4B5563" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(225,225, 225, 1)",
                  borderColor: "#e5e7eb",
                  fontSize: 12,
                  borderRadius: 8,
                  color: "#111827",
                }}
                formatter={(value: number) => `${value.toFixed(2)} m³/s`}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="Afluência (m³/s)"
                stackId="a"
                fill="var(--chart-1)"
                name="Afluência (Entrada)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
