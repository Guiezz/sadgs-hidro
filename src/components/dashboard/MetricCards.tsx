"use client";

import { Gauge, CalendarDays, ShieldCheck, Activity } from "lucide-react";
import type { DashboardSummary } from "@/lib/types";
import {
  DroughtGauge,
  GaugeThresholds,
} from "@/components/dashboard/DroughtGauge";

interface MetricCardsProps {
  summary: DashboardSummary;
  calculatedDays?: number;
  sinceDate?: string;
  thresholds?: GaugeThresholds;
}

export function MetricCards({
  summary,
  calculatedDays,
  sinceDate,
  thresholds,
}: MetricCardsProps) {
  const diasNoEstado = calculatedDays ?? summary.diasDesdeUltimaMudanca ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Volume + Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border/40 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Volume Atual (hm³)
            </span>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{summary.volumeAtualHm3}</div>
          <p className="text-xs text-muted-foreground">
            Última medição registrada
          </p>
        </div>

        <div className="md:col-span-2 bg-card border border-border/40 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 self-start">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Indicador de Severidade da Seca
            </span>
          </div>
          <div className="flex justify-center">
            <DroughtGauge
              currentState={summary.estadoAtualSeca}
              percentage={summary.volumePercentual}
              thresholds={thresholds}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Tempo + Medidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border/40 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Tempo no Estado
            </span>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{diasNoEstado} dias</div>
          <p className="text-xs text-muted-foreground">
            {sinceDate ? `Desde ${sinceDate}` : "Data de início não disponível"}
          </p>
        </div>

        <div className="bg-card border border-border/40 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Medidas Ativas
            </span>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {summary.medidasRecomendadas?.length ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Recomendações em vigor
          </p>
        </div>
      </div>
    </div>
  );
}
