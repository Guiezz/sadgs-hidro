// src/app/visao-geral/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { splitList } from "@/lib/text";
import { useReservoirQuery } from "@/hooks/useReservoirQuery";
import { PageHeader } from "@/components/app/PageHeader";
import { StateBadge } from "@/components/app/StateBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { ExternalLink } from "@/components/app/ExternalLink";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { FichaTecnica } from "@/components/dashboard/FichaTecnica";
import IdentificationMapWrapper from "@/components/dashboard/IdentificationMapWrapper";

// O resumo é opcional: se falhar, a página continua sem o cartão de estado.
const fetchVisaoGeral = (id: number) =>
  Promise.all([api.getIdentification(id), api.getDashboardSummary(id).catch(() => null)]).then(
    ([identification, summary]) => ({ identification, summary }),
  );

export default function VisaoGeralPage() {
  const { data, error, isLoading, reload, reservoir } = useReservoirQuery(fetchVisaoGeral);

  if (!reservoir) return <EmptyReservoirState />;

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-9 pb-20 md:px-10">{children}</div>
  );

  if (isLoading || (!data && !error)) {
    return shell(
      <>
        <Skeleton className="h-16 w-80" />
        <Skeleton className="h-[380px] w-full rounded-[20px]" />
        <Skeleton className="h-[320px] w-full rounded-[20px]" />
      </>,
    );
  }

  if (error || !data) {
    return shell(
      <EmptyState
        title="Não foi possível carregar a visão geral"
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

  const { identification: id, summary } = data;
  const ficha = { ...id, capacidade_hm3: id.capacidade_hm3 ?? reservoir.capacidade_hm3 };
  const sede = splitList(id.municipio)[0] ?? id.municipio;
  const subtitle = [
    id.rio_barrado ? `Açude no Rio ${id.rio_barrado}` : null,
    `${sede} – CE`,
    id.bacia ?? reservoir.bacia ?? null,
  ]
    .filter(Boolean)
    .join(" · ");
  const paragraphs = id.descricao.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const osm = `https://www.openstreetmap.org/?mlat=${id.lat}&mlon=${id.long}#map=13/${id.lat}/${id.long}`;

  return shell(
    <>
      <PageHeader
        eyebrow="Visão geral"
        title={id.nome}
        description={subtitle}
        actions={
          summary && (
            <Link
              href="/estado-de-seca"
              className="flex items-center gap-3.5 rounded-[14px] border border-border bg-card px-4 py-3 text-foreground no-underline transition-[border-color,box-shadow] hover:border-border-strong hover:text-foreground hover:shadow-[0_10px_30px_-14px_rgba(88,31,2,.3)]"
            >
              <StateBadge state={summary.estadoAtualSeca} className="text-[13px]" />
              <span className="flex flex-col gap-0.5">
                <span className="text-xs text-label">Volume atual</span>
                <span className="font-bold tabular-nums">
                  {formatNumber(summary.volumeAtualHm3)} hm³ · {formatNumber(summary.volumePercentual, 1)}%
                </span>
              </span>
              <ArrowRight aria-hidden="true" className="size-[18px] text-label" />
              <span className="sr-only">Abrir monitoramento</span>
            </Link>
          )
        }
      />

      {id.url_imagem && (
        <figure className="m-0 flex flex-col gap-2">
          <div className="relative h-[240px] w-full overflow-hidden rounded-[20px] md:h-[380px]">
            <Image src={id.url_imagem} alt={`Vista do açude ${id.nome}`} fill priority className="object-cover" />
          </div>
          <figcaption className="text-xs text-label">
            Açude {id.nome}
            {id.ano_construcao ? `, construído em ${id.ano_construcao}` : ""}.
          </figcaption>
        </figure>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <section
          aria-labelledby="sobre-titulo"
          className="flex min-w-0 flex-[999_1_480px] flex-col gap-3.5 rounded-[20px] border border-border bg-card p-6 md:p-7"
        >
          <h2 id="sobre-titulo" className="m-0 font-display text-[26px] font-bold">
            Sobre o reservatório
          </h2>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} className="m-0 max-w-[68ch] text-base leading-[1.7] text-pretty">
                {p}
              </p>
            ))
          ) : (
            <p className="m-0 text-muted-foreground">Descrição não disponível para este reservatório.</p>
          )}
        </section>
        <div className="flex-[1_1_320px]">
          <FichaTecnica data={ficha} />
        </div>
      </div>

      <section
        aria-labelledby="mapa-titulo"
        className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-card p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="mapa-titulo" className="m-0 text-lg font-bold">
              Localização
            </h2>
            <p className="m-0 text-sm text-muted-foreground">Mapa de referência do reservatório</p>
          </div>
          <ExternalLink href={osm} className="text-sm">
            Abrir no OpenStreetMap
          </ExternalLink>
        </div>
        <IdentificationMapWrapper lat={id.lat} lon={id.long} nome={id.nome} />
      </section>
    </>,
  );
}
