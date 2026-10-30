"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { useReservoir } from "@/context/ReservoirContext";
import { ReservoirSelect } from "@/components/app/ReservoirSelect";

// 1911–2017 da série histórica; instituições parceiras do plano.
export const HOME_STATS = { anosDeDados: 107, instituicoes: 7 };

export function HomeHero() {
  const { reservatorios, isLoading } = useReservoir();

  const stats = [
    { label: "Hidrossistemas", value: isLoading ? "—" : String(reservatorios.length) },
    { label: "Anos de dados", value: String(HOME_STATS.anosDeDados) },
    { label: "Instituições", value: String(HOME_STATS.instituicoes) },
  ];

  return (
    <section
      aria-labelledby="hero-titulo"
      className="border-b border-border bg-card bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:22px_22px] px-4 pt-12 pb-12 md:px-14 md:pt-16 md:pb-14"
    >
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-12">
        <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-6">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-3 py-1.5 text-[13px] font-semibold text-link-hover">
            <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
            Gestão Proativa de Secas · Ceará
          </span>
          <h1
            id="hero-titulo"
            className="m-0 font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-balance md:text-[60px]"
          >
            Decisões melhores antes que a seca chegue.
          </h1>
          <p className="m-0 max-w-[560px] text-lg leading-relaxed text-muted-foreground text-pretty">
            Plataforma integrada para monitoramento, acompanhamento e divulgação das ações dos
            Planos de Gestão Proativa de Seca dos hidrossistemas do Ceará.
          </p>

          <form
            aria-labelledby="form-titulo"
            onSubmit={(e) => e.preventDefault()}
            className="mt-2 flex max-w-[560px] flex-col gap-3.5 rounded-2xl border border-border bg-card p-[22px] shadow-[0_18px_40px_-24px_rgba(88,31,2,.35)]"
          >
            <h2 id="form-titulo" className="m-0 text-base font-bold">
              Comece escolhendo um hidrossistema
            </h2>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="hidro-home" className="text-[13px] font-semibold text-muted-foreground">
                Hidrossistema
              </label>
              <ReservoirSelect id="hidro-home" className="h-12 w-full text-[15px]" />
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/estado-de-seca"
                className="inline-flex h-12 flex-[1_1_200px] items-center justify-center gap-2 rounded-[10px] bg-primary px-5 text-[15px] font-bold text-primary-foreground no-underline transition-colors hover:bg-primary-hover hover:text-primary-foreground"
              >
                Ver monitoramento
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/visao-geral"
                className="inline-flex h-12 flex-[1_1_160px] items-center justify-center rounded-[10px] border border-input px-5 text-[15px] font-semibold text-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
              >
                Visão geral
              </Link>
            </div>
            {isLoading && (
              <p role="status" className="m-0 flex items-start gap-2 text-[13px] leading-normal text-label">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                O primeiro carregamento pode levar até 1 minuto enquanto o servidor inicia.
              </p>
            )}
          </form>
        </div>

        <div className="flex flex-[1_1_320px] flex-col gap-4">
          <div className="flex justify-center rounded-[20px] border border-border bg-background p-8">
            <Image
              src="/logos/logo-sadgs.png"
              alt="Logotipo do SADGS: um medidor de seca com o ponteiro na faixa laranja"
              width={260}
              height={260}
              priority
              className="h-auto w-full max-w-[260px]"
            />
          </div>
          <dl className="m-0 grid grid-cols-3 gap-2.5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col-reverse gap-1 rounded-[14px] border border-border bg-card px-4 py-3.5"
              >
                <dt className="text-xs font-medium text-label">{s.label}</dt>
                <dd className="m-0 font-display text-[30px] font-bold leading-none tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
