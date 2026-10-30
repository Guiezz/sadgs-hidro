"use client";

import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Responsavel } from "@/lib/types";
import { slugify } from "@/lib/text";
import { useReservoirQuery } from "@/hooks/useReservoirQuery";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { Parceiros } from "@/components/responsaveis/Parceiros";
import { groupResponsaveis, sortGrupos, sortOrganizacoes } from "@/components/responsaveis/grouping";

const EQUIPE_SISTEMA = [
  "Amanda Rodrigues Costa",
  "Daniele Costa da Silva",
  "Daniel Antonio Camelo Cid",
  "Francisco de Assis de Souza Filho",
  "Guilherme Bessa Araújo Nojosa",
  "José Kerlly Soares de Araújo",
  "Maitê Viana Paiva",
];

function Membros({ membros }: { membros: Responsavel[] }) {
  return (
    <dl className="m-0 flex flex-col">
      {membros.map((m, i) => (
        <div key={`${m.nome}-${i}`} className="flex flex-col gap-0.5 border-b border-muted py-2.5 last:border-0">
          <dt className="text-sm font-semibold">{m.nome}</dt>
          {m.cargo && <dd className="m-0 text-[13px] text-muted-foreground">{m.cargo}</dd>}
        </div>
      ))}
    </dl>
  );
}

export default function ResponsaveisPage() {
  const { data, error, isLoading, reload, reservoir } = useReservoirQuery((id) => api.getResponsaveis(id));

  if (!reservoir) {
    return (
      <EmptyReservoirState
        title="Responsáveis indisponíveis"
        description="Escolha um hidrossistema no topo da página para ver as instituições e as pessoas responsáveis pelo plano."
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
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-[320px] w-full rounded-[20px]" />
      </>,
    );
  }

  if (error || !data) {
    return shell(
      <EmptyState
        title="Não foi possível carregar os responsáveis"
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

  const grouped = groupResponsaveis(data);
  const grupos = sortGrupos(Object.keys(grouped));
  const secoes = [
    ...grupos.map((g) => ({ id: slugify(g), titulo: g })),
    { id: "equipe-sistema", titulo: "Equipe de elaboração do sistema" },
    { id: "financiamento", titulo: "Financiamento e realização" },
  ];

  return shell(
    <>
      <PageHeader eyebrow={`Responsáveis · ${reservoir.nome}`} title="Quem faz o plano acontecer" />

      <nav aria-label="Nesta página" className="flex flex-wrap gap-2">
        {secoes.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="inline-flex min-h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground no-underline hover:bg-muted hover:text-foreground"
          >
            {s.titulo}
          </a>
        ))}
      </nav>

      {grupos.map((grupo) => {
        const id = slugify(grupo);
        const orgs = sortOrganizacoes(grupo, Object.keys(grouped[grupo]));
        return (
          <section
            key={grupo}
            id={id}
            tabIndex={-1}
            aria-labelledby={`${id}-titulo`}
            className="flex scroll-mt-6 flex-col gap-4 rounded-[20px] border border-border bg-card p-6 outline-none md:p-7"
          >
            <h2 id={`${id}-titulo`} className="m-0 font-display text-[22px] font-bold">
              {grupo}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
              {orgs.map((org) => {
                const membros = grouped[grupo][org];
                const setor = membros[0]?.setor && membros[0].setor !== org ? membros[0].setor : null;
                return (
                  <article key={org} className="flex flex-col gap-2 rounded-2xl bg-background p-5">
                    <h3 className="m-0 text-[15px] font-bold">{org}</h3>
                    {setor && <p className="m-0 text-[13px] text-label">{setor}</p>}
                    <Membros membros={membros} />
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <section
        id="equipe-sistema"
        tabIndex={-1}
        aria-labelledby="equipe-sistema-titulo"
        className="flex scroll-mt-6 flex-col gap-4 rounded-[20px] border border-border bg-card p-6 outline-none md:p-7"
      >
        <h2 id="equipe-sistema-titulo" className="m-0 font-display text-[22px] font-bold">
          Equipe de elaboração do sistema
        </h2>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-6 gap-y-1 p-0">
          {EQUIPE_SISTEMA.map((nome) => (
            <li key={nome} className="border-b border-muted py-2.5 text-sm font-semibold">
              {nome}
            </li>
          ))}
        </ul>
      </section>

      <section
        id="financiamento"
        tabIndex={-1}
        aria-labelledby="financiamento-titulo"
        className="flex scroll-mt-6 flex-col gap-4 rounded-[20px] border border-border bg-card p-6 outline-none md:p-7"
      >
        <h2 id="financiamento-titulo" className="m-0 font-display text-[22px] font-bold">
          Financiamento e realização
        </h2>
        <Parceiros />
      </section>
    </>,
  );
}
