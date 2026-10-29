"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import {
  DROUGHT_STATES,
  type DroughtStateKey,
  droughtClasses,
  droughtLabel,
  normalizeDroughtState,
} from "@/lib/drought-state";
import { useReservoirQuery } from "@/hooks/useReservoirQuery";
import { PageHeader } from "@/components/app/PageHeader";
import { StateBadge } from "@/components/app/StateBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { MeasureList } from "@/components/dashboard/MeasureList";
import { ActionStatusTabs } from "@/components/dashboard/ActionStatusTabs";
import { cn } from "@/lib/utils";

const fetchImplementacao = (id: number) =>
  Promise.all([
    api.getDashboardSummary(id),
    api.getActionPlans(id),
    api.getOngoingActions(id),
    api.getCompletedActions(id),
  ]).then(([summary, planos, ongoing, completed]) => ({
    summary,
    planos: planos ?? [],
    ongoing: ongoing ?? [],
    completed: completed ?? [],
  }));

export default function ImplementacaoPlanosPage() {
  const { data, error, isLoading, reload, reservoir } = useReservoirQuery(fetchImplementacao);
  const [tab, setTab] = useState<DroughtStateKey | null>(null);

  if (!reservoir) {
    return (
      <EmptyReservoirState
        title="Implementação indisponível"
        description="Escolha um hidrossistema no topo da página para ver as medidas recomendadas e a situação das ações."
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
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </>,
    );
  }

  if (error || !data) {
    return shell(
      <EmptyState
        title="Não foi possível carregar a implementação"
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

  const { summary, planos, ongoing, completed } = data;
  const atual = normalizeDroughtState(summary.estadoAtualSeca);
  const ativo = tab ?? atual ?? "normal";
  const porEstado = (key: DroughtStateKey) => planos.filter((p) => normalizeDroughtState(p.estado_seca) === key);
  const resumo = [
    { n: porEstado(atual ?? "normal").length, label: "medidas recomendadas" },
    { n: ongoing.length, label: "ações em andamento" },
    { n: completed.length, label: "concluídas" },
  ];

  return shell(
    <>
      <PageHeader eyebrow="Implementação dos Planos de Seca" title={reservoir.nome} />

      <section
        aria-label="Resumo"
        className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-border bg-card px-6 py-5"
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-label">Estado atual</span>
          <StateBadge state={summary.estadoAtualSeca} />
        </div>
        <span aria-hidden="true" className="hidden h-7 w-px bg-border sm:block" />
        {resumo.map((r) => (
          <div key={r.label} className="flex items-baseline gap-2">
            <span className="font-display text-[28px] font-bold tabular-nums">{r.n}</span>
            <span className="text-sm text-muted-foreground">{r.label}</span>
          </div>
        ))}
      </section>

      <Tabs value={ativo} onValueChange={(v) => setTab(v as DroughtStateKey)} className="gap-6">
        <TabsList
          aria-label="Medidas por estado de seca"
          className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0"
        >
          {DROUGHT_STATES.map((s) => (
            <TabsTrigger
              key={s.key}
              value={s.key}
              className={cn(
                "h-11 flex-none gap-2 rounded-[10px] border border-input bg-card px-4 font-semibold text-foreground hover:bg-muted",
                "data-[state=active]:border-secondary data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-none",
              )}
            >
              <span aria-hidden="true" className={cn("size-2 rounded-full", droughtClasses(s.key).dot)} />
              {s.label}
              {s.key === atual && " · atual"}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col">
            {DROUGHT_STATES.map((s) => {
              const lista = porEstado(s.key);
              return (
                <TabsContent key={s.key} value={s.key} className="m-0">
                  <section aria-labelledby={`medidas-${s.key}`} className="flex flex-col gap-3.5">
                    <h2 id={`medidas-${s.key}`} className="m-0 text-lg font-bold">
                      Medidas recomendadas para o estado {droughtLabel(s.key)}
                    </h2>
                    {lista.length > 0 ? (
                      <MeasureList planos={lista} />
                    ) : (
                      <EmptyState
                        title="Nenhuma medida cadastrada"
                        description={`O plano não lista medidas para o estado ${droughtLabel(s.key)}.`}
                      />
                    )}
                  </section>
                </TabsContent>
              );
            })}
          </div>
          <ActionStatusTabs ongoing={ongoing} completed={completed} />
        </div>
      </Tabs>
    </>,
  );
}
