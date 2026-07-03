"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { formatDate, parseDataLocal } from "./helpers";
import { ResultadoCenario, GatilhoPGPSMes } from "@/lib/types";

const CORES = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#8b5cf6",
  "#ec4899",
];

const GATILHO_CORES = {
  meta3: "#ca8a04",
  meta2: "#ea580c",
  meta1: "#dc2626",
};

interface DemandComparisonChartProps {
  cenarios: ResultadoCenario[];
  capacidadeTotal: number;
  visualizacaoModo: "hm3" | "percentual";
  setVisualizacaoModo: (modo: "hm3" | "percentual") => void;
  gatilhos?: GatilhoPGPSMes[];
}

export function DemandComparisonChart({
  cenarios,
  capacidadeTotal,
  visualizacaoModo,
  setVisualizacaoModo,
  gatilhos = [],
}: DemandComparisonChartProps) {
  if (cenarios.length === 0) return null;

  // Mapear data → índice para lookup de déficits
  const dataToIndex: Record<string, number> = {};
  cenarios[0]?.resultados.forEach((r, idx) => {
    dataToIndex[r.data] = idx;
  });

  // Map gatilhos by month number for fast lookup
  const gatilhoPorMes: Record<number, GatilhoPGPSMes> = {};
  gatilhos.forEach((g) => {
    gatilhoPorMes[g.mes_num] = g;
  });

  const temGatilhos = gatilhos.length > 0 && capacidadeTotal > 0;

  const merged = cenarios[0]?.resultados.map((ponto, idx) => {
    const point: Record<string, string | number | null> = { data: ponto.data };

    // Volumes dos cenários
    cenarios.forEach((c) => {
      const val = c.resultados[idx]?.volume_final_hm3 ?? 0;
      point[c.nome] =
        visualizacaoModo === "percentual" && capacidadeTotal > 0
          ? (val / capacidadeTotal) * 100
          : val;
    });

    // Gatilhos do mês correspondente (sempre em %)
    if (temGatilhos) {
      const data = parseDataLocal(ponto.data);
      const mesNum = data.getMonth() + 1;
      const g = gatilhoPorMes[mesNum];
      if (g) {
        point._gatilho_meta3 = (g.alerta_hm3 / capacidadeTotal) * 100;
        point._gatilho_meta2 = (g.seca_hm3 / capacidadeTotal) * 100;
        point._gatilho_meta1 = (g.seca_severa_hm3 / capacidadeTotal) * 100;
      } else {
        point._gatilho_meta3 = null;
        point._gatilho_meta2 = null;
        point._gatilho_meta1 = null;
      }
    }

    return point;
  });

  if (!merged) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Comparação de Demandas</CardTitle>
            <CardDescription>
              Evolução do volume para cada cenário de demanda
            </CardDescription>
          </div>
          <RadioGroup
            value={visualizacaoModo}
            onValueChange={(val) =>
              setVisualizacaoModo(val as "hm3" | "percentual")
            }
            className="flex gap-4"
          >
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="hm3" id="vm-hm3" />
              <Label htmlFor="vm-hm3" className="text-xs font-normal cursor-pointer">
                hm³
              </Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="percentual" id="vm-pct" />
              <Label htmlFor="vm-pct" className="text-xs font-normal cursor-pointer">
                % da Capacidade
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={merged}
              margin={{ top: 10, right: 50, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="data"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                minTickGap={30}
              />

              {/* Eixo esquerdo: Volume */}
              <YAxis
                yAxisId="volume"
                label={{
                  value:
                    visualizacaoModo === "percentual"
                      ? "% da Capacidade"
                      : "Volume (hm³)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fontSize: 12 }}
                domain={visualizacaoModo === "percentual" ? [0, 100] : undefined}
              />

              {/* Eixo direito: Gatilhos PGPS (%) — só aparece se houver dados */}
              {temGatilhos && (
                <YAxis
                  yAxisId="gatilhos"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Gatilhos (%)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
              )}

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !label) return null;
                  const idx = dataToIndex[label as string];
                  const isPercent = visualizacaoModo === "percentual";

                  // Separar entradas de volume e gatilhos
                  const volumes = payload.filter(
                    (e) => !String(e.dataKey).startsWith("_gatilho_"),
                  );
                  const gatilhosEntries = payload.filter((e) =>
                    String(e.dataKey).startsWith("_gatilho_"),
                  );

                  const gatilhoLabels: Record<string, string> = {
                    _gatilho_meta1: "Meta 1 (Crítico)",
                    _gatilho_meta2: "Meta 2 (Atenção)",
                    _gatilho_meta3: "Meta 3 (Operação)",
                  };
                  const gatilhoColors: Record<string, string> = {
                    _gatilho_meta1: GATILHO_CORES.meta1,
                    _gatilho_meta2: GATILHO_CORES.meta2,
                    _gatilho_meta3: GATILHO_CORES.meta3,
                  };

                  return (
                    <div className="bg-white border rounded-md p-3 text-xs shadow-md max-w-[280px]">
                      <p className="font-medium mb-1.5">
                        {formatDate(label as string)}
                      </p>

                      {/* Volumes */}
                      {volumes.map((entry) => {
                        const cenario = cenarios.find(
                          (c) => c.nome === entry.name,
                        );
                        const hasDeficit =
                          cenario && idx !== undefined
                            ? cenario.pontos_deficit.includes(idx)
                            : false;
                        return (
                          <div
                            key={entry.name}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.name}</span>
                            </div>
                            <span className="font-medium">
                              {(entry.value as number).toFixed(2)}{" "}
                              {isPercent ? "%" : "hm³"}
                              {hasDeficit && (
                                <span className="ml-1 text-red-500">
                                  {" "}⚠ déficit
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      {/* Gatilhos */}
                      {gatilhosEntries.length > 0 && (
                        <>
                          <div className="border-t mt-1.5 pt-1.5" />
                          {gatilhosEntries.map((entry) => (
                            <div
                              key={entry.dataKey}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="inline-block w-2.5 h-0.5 rounded"
                                  style={{
                                    backgroundColor:
                                      gatilhoColors[String(entry.dataKey)],
                                  }}
                                />
                                <span className="text-muted-foreground">
                                  {gatilhoLabels[String(entry.dataKey)]}
                                </span>
                              </div>
                              <span className="font-medium">
                                {(entry.value as number).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                }}
                contentStyle={{
                  fontSize: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

              {/* Linhas de cenários (eixo esquerdo) */}
              {cenarios.map((c, i) => (
                <Line
                  key={c.nome}
                  yAxisId="volume"
                  type="monotone"
                  dataKey={c.nome}
                  name={c.nome}
                  stroke={CORES[i % CORES.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={(props) => {
                    const { cx, cy, index } = props;
                    const hasDeficit = c.pontos_deficit.includes(index);
                    if (!hasDeficit) {
                      return (
                        <circle
                          key={`active-${c.nome}-${index}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={CORES[i % CORES.length]}
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                      );
                    }
                    return (
                      <circle
                        key={`active-${c.nome}-${index}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#dc2626"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              ))}

              {/* Linhas de gatilhos PGPS (eixo direito) */}
              {temGatilhos && (
                <>
                  <Line
                    yAxisId="gatilhos"
                    type="monotone"
                    dataKey="_gatilho_meta3"
                    name="Meta 3 (Operação)"
                    stroke={GATILHO_CORES.meta3}
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={false}
                  />
                  <Line
                    yAxisId="gatilhos"
                    type="monotone"
                    dataKey="_gatilho_meta2"
                    name="Meta 2 (Atenção)"
                    stroke={GATILHO_CORES.meta2}
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={false}
                  />
                  <Line
                    yAxisId="gatilhos"
                    type="monotone"
                    dataKey="_gatilho_meta1"
                    name="Meta 1 (Crítico)"
                    stroke={GATILHO_CORES.meta1}
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
