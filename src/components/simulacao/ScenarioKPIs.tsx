"use client";

import { ResultadoCenario } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface ScenarioKPIsProps {
  cenarios: ResultadoCenario[];
}

export function ScenarioKPIs({ cenarios }: ScenarioKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cenarios.map((c) => (
        <Card
          key={c.nome}
          className={`border-l-4 transition-shadow hover:shadow-[var(--card-shadow-hover)] ${
            c.frequencia_nao_atendida === 0
              ? "border-l-green-500"
              : c.frequencia_nao_atendida <= 20
                ? "border-l-amber-500"
                : "border-l-red-500"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {c.frequencia_nao_atendida === 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle
                  className={`h-4 w-4 ${
                    c.frequencia_nao_atendida <= 20
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                />
              )}
              {c.nome}
              {c.ganho_fna !== null && c.ganho_fna > 0 && (
                <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  <TrendingDown className="h-3 w-3" />
                  {c.ganho_fna.toFixed(0)}%
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vol. Final</span>
              <span className="font-bold text-blue-700">
                {c.volume_final.toFixed(2)} hm³
                {c.ganho_volume !== null && c.ganho_volume > 0 && (
                  <span className="ml-1 text-xs font-semibold text-green-600">
                    +{c.ganho_volume.toFixed(0)}%
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">FNA</span>
              <span
                className={`font-bold ${
                  c.frequencia_nao_atendida === 0
                    ? "text-green-600"
                    : c.frequencia_nao_atendida <= 20
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {c.frequencia_nao_atendida.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Falhas</span>
              <span className="font-semibold">
                {c.meses_com_falha} meses
                {c.ganho_falhas !== null && c.ganho_falhas > 0 && (
                  <span className="ml-1 text-xs font-semibold text-green-600">
                    -{c.ganho_falhas.toFixed(0)}%
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Primeira Falha</span>
              <span className="font-semibold">
                {c.primeira_falha ?? (
                  <span className="text-green-600">Não ocorreu</span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Menor Vol.</span>
              <span className="font-semibold">
                {c.menor_volume.toFixed(2)} hm³
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
