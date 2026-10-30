"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { ResultadoCenario } from "@/lib/types";

interface FNAChartProps {
  cenarios: ResultadoCenario[];
}

const getBarColor = (fna: number): string => {
  if (fna === 0) return "var(--estado-normal-dot)";
  if (fna <= 20) return "var(--estado-alerta-dot)";
  return "var(--estado-severa-dot)";
};

export function FNAChart({ cenarios }: FNAChartProps) {
  if (cenarios.length === 0) return null;

  const data = cenarios.map((c) => ({
    nome: c.nome,
    fna: c.frequencia_nao_atendida,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequência de Não Atendimento</CardTitle>
        <CardDescription>
          Comparação da confiabilidade entre cenários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis
                label={{
                  value: "FNA (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, "FNA"]}
                contentStyle={{
                  fontSize: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "8px",
                }}
              />
              <Bar dataKey="fna" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.fna)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
