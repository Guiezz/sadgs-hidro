"use client";

import { UsoAgua } from "@/lib/types";
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

interface Props {
  data: UsoAgua[];
}

export function UsoAguaChartV2({ data }: Props) {
  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" fontSize={12} tick={{ fill: "#4B5563" }} />
          <YAxis
            type="category"
            dataKey="uso"
            width={130}
            fontSize={11}
            tick={{ fill: "#4B5563" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 1)",
              borderColor: "#e5e7eb",
              fontSize: 12,
              borderRadius: 8,
              color: "#111827",
            }}
            formatter={(value: number) => `${value.toFixed(2)} L/s`}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar
            dataKey="vazao_normal"
            fill="var(--chart-1)"
            name="Vazão Normal"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="vazao_escassez"
            fill="var(--chart-2)"
            name="Vazão em Escassez"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
