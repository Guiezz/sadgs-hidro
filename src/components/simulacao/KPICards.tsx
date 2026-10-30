"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { SimulacaoResultadoPonto } from "@/lib/types";
import { formatDate, parseDataLocal } from "./helpers";
import { getDaysInMonth } from "date-fns";

interface KPICardsProps {
  frequenciaFalha: number;
  mesesFalha: SimulacaoResultadoPonto[];
  demandaConfigurada: number;
}

export function KPICards({
  frequenciaFalha,
  mesesFalha,
  demandaConfigurada,
}: KPICardsProps) {
  const [showFailures, setShowFailures] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CARD 1: Frequência */}
      <Card
        className={`${frequenciaFalha > 0 ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
            Frequência de Falha
            {frequenciaFalha > 0 ? (
              <AlertTriangle className="h-4 w-4 text-estado-severa-text" />
            ) : (
              <CheckCircle className="h-4 w-4 text-estado-normal-text" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${frequenciaFalha > 0 ? "text-estado-severa-text" : "text-estado-normal-text"}`}
            >
              {frequenciaFalha.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">dos meses</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {frequenciaFalha > 0
              ? `Demanda não atendida em ${mesesFalha.length} meses.`
              : "Demanda atendida integralmente (100%)."}
          </p>
        </CardContent>
      </Card>

      {/* CARD 2: Lista de Falhas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Detalhamento das Falhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mesesFalha.length === 0 ? (
            <div className="flex items-center gap-2 text-estado-normal-text font-medium h-[60px]">
              <CheckCircle className="h-5 w-5" />
              Nenhuma falha registrada no período.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {mesesFalha.length}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    meses
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFailures(!showFailures)}
                  className="text-xs"
                >
                  {showFailures ? "Ocultar" : "Ver Lista"}
                  {showFailures ? (
                    <ChevronUp className="ml-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </div>

              {showFailures && (
                <div className="mt-2 max-h-[150px] overflow-y-auto border rounded-md bg-background p-2 text-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b">
                        <th className="pb-1">Data</th>
                        <th className="pb-1 text-right">Entregue</th>
                        <th className="pb-1 text-right">Déficit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mesesFalha.map((m, idx) => {
                        const data = parseDataLocal(m.data);
                        const dias = getDaysInMonth(data);
                        const demHm3 =
                          (demandaConfigurada * dias * 86400) / 1e6;
                        const deficit = demHm3 - m.retirada_hm3;

                        return (
                          <tr
                            key={idx}
                            className="border-b last:border-0 border-border"
                          >
                            <td className="py-1 font-medium text-foreground">
                              {formatDate(m.data)}
                            </td>
                            <td className="py-1 text-right text-estado-severa-text">
                              {m.retirada_hm3.toFixed(2)}
                            </td>
                            <td className="py-1 text-right text-muted-foreground">
                              -{deficit.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
