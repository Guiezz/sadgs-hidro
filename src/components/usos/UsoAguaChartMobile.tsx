"use client";

import { UsoAgua } from "@/lib/types";
import {
  AreaChart,
  Area,
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

export function UsoAguaChartMobile({ data }: Props) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="uso"
            fontSize={10}
            tick={{ fill: "#4B5563" }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={80}
          />
          <YAxis
            fontSize={10}
            tick={{ fill: "#4B5563" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderColor: "#e5e7eb",
              fontSize: 12,
              borderRadius: 8,
              color: "#111827",
            }}
            formatter={(value: number) => `${value.toFixed(2)} L/s`}
          />
          <Legend wrapperStyle={{ fontSize: "10px" }} />
          <Area
            type="monotone"
            dataKey="vazao_normal"
            fill="var(--chart-1)"
            stroke="var(--chart-1)"
            fillOpacity={0.3}
            name="Vazão Normal"
          />
          <Area
            type="monotone"
            dataKey="vazao_escassez"
            fill="var(--chart-2)"
            stroke="var(--chart-2)"
            fillOpacity={0.3}
            name="Vazão em Escassez"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
