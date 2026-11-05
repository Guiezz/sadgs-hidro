"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { useReservoirQuery } from "@/hooks/useReservoirQuery";
import { EmptyState } from "@/components/app/EmptyState";
import { PageNav } from "@/components/app/PageNav";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { cn } from "@/lib/utils";
import { classOptions, matchesClass, matchesSearch, type PlanFilterState } from "./filters";
import { PlanFilters } from "./PlanFilters";
import { PlanTable } from "./PlanTable";

const PER_PAGE = 10;

export default function ActionPlanClient() {
  const [filters, setFilters] = useState<PlanFilterState>({});
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Estado, impacto e problema são filtrados pela API; busca e classe, aqui.
  const filterOpts = useReservoirQuery((id) => api.getActionPlanFilters(id));
  const plans = useReservoirQuery(
    (id) => api.getActionPlans(id, { estado: filters.estado, impacto: filters.impacto, problema: filters.problema }),
    [filters.estado, filters.impacto, filters.problema],
  );
  const allPlans = useReservoirQuery((id) => api.getActionPlans(id));

  // Troca de reservatório limpa os filtros.
  const reservoirId = filterOpts.reservoir?.id;
  useEffect(() => {
    setFilters({});
    setQuery("");
  }, [reservoirId]);
  useEffect(() => setPage(1), [filters, query]);

  const results = useMemo(
    () => (plans.data ?? []).filter((p) => matchesSearch(p, query) && matchesClass(p, filters.classe ?? "")),
    [plans.data, query, filters.classe],
  );

  if (!filterOpts.reservoir) {
    return (
      <EmptyReservoirState
        title="Planos de ação indisponíveis"
        description="Escolha um hidrossistema no topo da página para consultar os planos de ação."
      />
    );
  }

  if (filterOpts.error) {
    return (
      <EmptyState
        title="Não foi possível carregar os filtros"
        description={filterOpts.error}
        action={
          <button
            type="button"
            onClick={filterOpts.reload}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-secondary px-5 text-sm font-semibold text-secondary-foreground"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Tentar novamente
          </button>
        }
      />
    );
  }

  const opts = filterOpts.data;
  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const current = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const loadingResults = plans.isLoading && !plans.data;

  return (
    <>
      {opts ? (
        <PlanFilters
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFilterChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          onReset={() => {
            setFilters({});
            setQuery("");
          }}
          options={{
            estados: opts.estados ?? [],
            impactos: opts.impactos ?? [],
            problemas: opts.problemas ?? [],
            classes: classOptions(allPlans.data ?? []),
          }}
        />
      ) : (
        <Skeleton className="h-[220px] w-full rounded-2xl" />
      )}

      <section aria-labelledby="res-titulo" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="res-titulo" className="m-0 text-lg font-bold">
            Resultados
          </h2>
          <p aria-live="polite" className="m-0 text-sm text-muted-foreground">
            {loadingResults
              ? "Carregando…"
              : `Mostrando ${results.length} ${results.length === 1 ? "ação" : "ações"}`}
          </p>
        </div>

        {plans.error ? (
          <EmptyState
            title="Não foi possível carregar os planos"
            description={plans.error}
            action={
              <button
                type="button"
                onClick={plans.reload}
                className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-secondary px-5 text-sm font-semibold text-secondary-foreground"
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                Tentar novamente
              </button>
            }
          />
        ) : loadingResults ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nenhuma ação encontrada"
            description="Ajuste a busca ou remova algum filtro."
          />
        ) : (
          <div className={cn(plans.isLoading && "opacity-60")}>
            <PlanTable planos={current} />
          </div>
        )}

        <PageNav page={page} pages={pages} onChange={setPage} />
      </section>
    </>
  );
}
