"use client";

import Link from "next/link";
import { Box, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { gaugeThresholds, variation7d } from "@/lib/monitoring";
import { splitList } from "@/lib/text";
import { useReservoirQuery } from "@/hooks/useReservoirQuery";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { CurrentStateCard } from "@/components/dashboard/CurrentStateCard";
import { MonitoringKpis } from "@/components/dashboard/MonitoringKpis";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { HistorySection } from "@/components/dashboard/HistorySection";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const fetchMonitoring = (id: number) =>
  Promise.all([api.getDashboardSummary(id), api.getHistory(id), api.getVolumeChartData(id)]).then(
    ([summary, history, chart]) => ({ summary, history: history ?? [], chart: chart ?? [] }),
  );

export default function EstadoDeSecaPage() {
  const { data, error, isLoading, reload, reservoir } = useReservoirQuery(fetchMonitoring);

  if (!reservoir) {
    return (
      <EmptyReservoirState
        title="Monitoramento indisponível"
        description="Escolha um hidrossistema no topo da página para ver o estado de seca, o volume e as metas."
      />
    );
  }

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-9 pb-20 md:px-10">{children}</div>
  );

  if (isLoading || (!data && !error)) {
    return shell(
      <>
        <Skeleton className="h-16 w-80" />
        <Skeleton className="h-[260px] w-full rounded-[20px]" />
        <Skeleton className="h-[420px] w-full rounded-[20px]" />
      </>,
    );
  }

  if (error || !data) {
    return shell(
      <EmptyState
        title="Não foi possível carregar o monitoramento"
        description={error ?? "Tente novamente em instantes."}
        action={
          <button
            type="button"
            onClick={reload}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-secondary px-5 text-sm font-semibold text-secondary-foreground"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Tentar novamente
          </button>
        }
      />,
    );
  }

  const { summary, history, chart } = data;
  const lastPoint = chart[chart.length - 1];
  const metas = lastPoint
    ? { meta1: lastPoint.meta1 * 100, meta2: lastPoint.meta2 * 100, meta3: lastPoint.meta3 * 100 }
    : null;
  const limites = lastPoint ? gaugeThresholds(lastPoint) : null;
  const monthName = lastPoint ? MESES[Number(lastPoint.Data.slice(5, 7)) - 1] : "";
  const ultimaLeitura = history[history.length - 1]?.Data ?? summary.dataUltimaMedicao;

  return shell(
    <>
      <PageHeader
        eyebrow="Monitoramento do estado de seca"
        title={reservoir.nome}
        description={
          <span className="text-sm text-label">
            {splitList(reservoir.municipio)[0] ?? reservoir.municipio} – CE{ultimaLeitura ? ` · Última leitura em ${ultimaLeitura}` : ""}
          </span>
        }
        actions={
          <Link
            href="/relogio-3d"
            className="inline-flex h-11 items-center gap-2.5 rounded-[10px] border border-input bg-card px-4 text-sm font-semibold text-foreground no-underline hover:bg-muted hover:text-foreground"
          >
            <Box aria-hidden="true" className="size-[18px] text-label" />
            Relógio da Seca 3D
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-link-hover">Novo</span>
          </Link>
        }
      />

      <CurrentStateCard
        state={summary.estadoAtualSeca}
        volumePct={summary.volumePercentual}
        metas={metas}
        limites={limites}
        monthName={monthName}
      >
        <MonitoringKpis
          volumeHm3={summary.volumeAtualHm3}
          volumePct={summary.volumePercentual}
          capacidadeHm3={reservoir.capacidade_hm3 || null}
          variation={variation7d(history)}
          diasNoEstado={summary.diasDesdeUltimaMudanca ?? null}
          limites={limites}
          medidasAtivas={summary.medidasRecomendadas?.length ?? 0}
          estado={summary.estadoAtualSeca}
        />
      </CurrentStateCard>

      <VolumeChart data={chart} capacidadeMaxima={reservoir.capacidade_hm3} reservatorio={reservoir.nome} />

      <HistorySection history={history} reservatorio={reservoir.nome} />
    </>,
  );
}
