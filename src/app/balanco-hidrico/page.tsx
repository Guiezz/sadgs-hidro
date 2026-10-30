"use client";

import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useReservoirQuery } from "@/hooks/useReservoirQuery";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { BalancoHidricoChart } from "@/components/balance/BalancoHidricoChart";
import { ComposicaoDemandaChart } from "@/components/balance/ComposicaoDemandaChart";
import { OfertaDemandaChart } from "@/components/balance/OfertaDemandaChart";

export default function BalancoHidricoPage() {
  const { data, error, isLoading, reload, reservoir } = useReservoirQuery((id) => api.getWaterBalance(id));

  if (!reservoir) {
    return (
      <EmptyReservoirState
        title="Balanço hídrico indisponível"
        description="Escolha um hidrossistema no topo da página para ver a oferta, a demanda e a afluência mensal."
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
        <Skeleton className="h-60 w-full rounded-[20px]" />
        <Skeleton className="h-[380px] w-full rounded-[20px]" />
      </>,
    );
  }

  if (error || !data) {
    return shell(
      <EmptyState
        title="Não foi possível carregar o balanço hídrico"
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

  const vazio = !data.ofertaDemanda?.length && !data.balancoMensal?.length && !data.composicaoDemanda?.length;

  return shell(
    <>
      <PageHeader eyebrow="Balanço hídrico" title={reservoir.nome} />
      {vazio && (
        <EmptyState title="Sem dados de balanço" description="Este reservatório ainda não tem balanço hídrico cadastrado." />
      )}
      {data.ofertaDemanda?.length > 0 && <OfertaDemandaChart data={data.ofertaDemanda} />}
      {data.balancoMensal?.length > 0 && <BalancoHidricoChart data={data.balancoMensal} />}
      {data.composicaoDemanda?.length > 0 && <ComposicaoDemandaChart data={data.composicaoDemanda} />}
    </>,
  );
}
