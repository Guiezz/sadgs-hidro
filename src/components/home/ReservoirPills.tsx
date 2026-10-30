"use client";

import { useRouter } from "next/navigation";
import { useReservoir } from "@/context/ReservoirContext";
import { Skeleton } from "@/components/ui/skeleton";

export function ReservoirPills() {
  const router = useRouter();
  const { reservatorios, setSelectedReservoir, isLoading, error } = useReservoir();

  return (
    <section aria-labelledby="hidro-titulo" className="px-4 pt-16 md:px-14">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-5 rounded-[20px] border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h2 id="hidro-titulo" className="m-0 font-display text-[26px] font-bold">
              Hidrossistemas monitorados
            </h2>
            <p className="m-0 text-[15px] text-muted-foreground">
              Selecione um reservatório para abrir o monitoramento.
            </p>
          </div>
          {!isLoading && !error && (
            <span className="text-[13px] font-semibold text-label">
              {reservatorios.length} reservatórios
            </span>
          )}
        </div>
        {error ? (
          <p role="alert" className="m-0 text-sm text-destructive">
            Não foi possível carregar a lista de reservatórios. Recarregue a página em instantes.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <li key={i}>
                    <Skeleton className="h-10 w-36 rounded-full" />
                  </li>
                ))
              : reservatorios.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReservoir(r);
                        router.push("/estado-de-seca");
                      }}
                      className="inline-flex min-h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-accent"
                    >
                      {r.nome}
                    </button>
                  </li>
                ))}
          </ul>
        )}
      </div>
    </section>
  );
}
