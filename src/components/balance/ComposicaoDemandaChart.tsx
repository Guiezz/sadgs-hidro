"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ComposicaoDemanda } from "@/lib/types";

interface Props {
  data: ComposicaoDemanda[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ComposicaoDemandaChart({ data }: Props) {
  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <h3 className="text-sm font-semibold">Composição da Demanda</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Percentual de uso da água por setor em condições de normalidade.
        </p>
      </div>
      <div className="p-4">
        <div className="w-full h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="Vazão (L/s)"
                nameKey="Uso"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) =>
                  (percent ?? 0) > 0.004
                    ? `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`
                    : ""
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} L/s`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  borderColor: "#e5e7eb",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
