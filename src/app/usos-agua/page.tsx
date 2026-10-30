"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { sortUsosByNormal } from "@/lib/water";
import { useReservoirQuery } from "@/hooks/useReservoirQuery";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { SegmentedControl } from "@/components/app/SegmentedControl";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { UsosKpis } from "@/components/usos/UsosKpis";
import { UsoBars } from "@/components/usos/UsoBars";
import { UsoTable } from "@/components/usos/UsoTable";
import { UsoDiagram } from "@/components/usos/UsoDiagram";

type Formato = "grafico" | "tabela";

// O diagrama é opcional: se /identification falhar, a página segue sem ele.
const fetchUsos = (id: number) =>
  Promise.all([api.getUsosAgua(id), api.getIdentification(id).catch(() => null)]).then(
    ([usos, identification]) => ({ usos: usos ?? [], identification }),
  );

export default function UsosAguaPage() {
  const { data, error, isLoading, reload, reservoir } = useReservoirQuery(fetchUsos);
  const [formato, setFormato] = useState<Formato>("grafico");

  if (!reservoir) {
    return (
      <EmptyReservoirState
        title="Usos da água indisponíveis"
        description="Escolha um hidrossistema no topo da página para ver a vazão alocada a cada uso."
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
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-[480px] w-full rounded-[20px]" />
      </>,
    );
  }

  if (error || !data) {
    return shell(
      <EmptyState
        title="Não foi possível carregar os usos da água"
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

  const usos = sortUsosByNormal(data.usos);
  const diagrama = data.identification?.url_imagem_usos;

  return shell(
    <>
      <PageHeader
        eyebrow={`Usos da água · ${reservoir.nome}`}
        title="Para onde vai a água"
        description="Vazão alocada a cada uso em condições de normalidade e de escassez hídrica."
      />

      {usos.length === 0 ? (
        <EmptyState title="Sem usos cadastrados" description="Este reservatório ainda não tem usos da água cadastrados." />
      ) : (
        <>
          <UsosKpis usos={usos} />
          <SectionCard
            id="vazao-titulo"
            title="Vazão por uso"
            description="Ordenado pela vazão em normalidade, em L/s."
            actions={
              <>
                {formato === "grafico" && (
                  <ul aria-label="Legenda" className="m-0 flex list-none gap-4 p-0 text-[13px] text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-water" />
                      Normalidade
                    </li>
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-scarcity" />
                      Escassez
                    </li>
                  </ul>
                )}
                <SegmentedControl
                  label="Formato de exibição"
                  options={[
                    { value: "grafico", label: "Gráfico" },
                    { value: "tabela", label: "Tabela" },
                  ]}
                  value={formato}
                  onChange={setFormato}
                />
              </>
            }
          >
            {formato === "grafico" ? <UsoBars usos={usos} /> : <UsoTable usos={usos} />}
          </SectionCard>
        </>
      )}

      {diagrama && <UsoDiagram src={diagrama} reservatorio={reservoir.nome} />}
    </>,
  );
}
