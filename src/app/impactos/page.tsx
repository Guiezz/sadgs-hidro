"use client";

import Image from "next/image";
import {
  ChartColumn,
  Droplet,
  FileText,
  ImageIcon,
  Leaf,
  type LucideIcon,
  Text,
  Users,
} from "lucide-react";
import { useReservoir } from "@/context/ReservoirContext";
import { splitList } from "@/lib/text";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/PageHeader";
import { ExternalLink } from "@/components/app/ExternalLink";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const FORMULARIO_URL = "https://cepas.ufc.br/pt_br/avaliacao-de-impacto-das-secas/";

const DIMENSOES: { title: string; icon: LucideIcon; cls: string }[] = [
  { title: "Provisão de água", icon: Droplet, cls: "bg-water-soft text-water" },
  { title: "Impactos econômicos", icon: ChartColumn, cls: "bg-accent text-link" },
  { title: "Desafios sociais", icon: Users, cls: "bg-muted text-muted-foreground" },
  { title: "Consequências ambientais", icon: Leaf, cls: "bg-estado-normal-bg text-estado-normal-text" },
];

const ANEXOS: { label: string; icon: LucideIcon }[] = [
  { label: "Fotografias", icon: ImageIcon },
  { label: "Relatos em texto", icon: Text },
  { label: "Documentos", icon: FileText },
];

export default function ImpactosPage() {
  const { selectedReservoir: reservoir } = useReservoir();

  if (!reservoir) {
    return (
      <EmptyReservoirState
        title="Impactos da seca indisponíveis"
        description="Escolha um hidrossistema no topo da página para ver o contexto local e acessar o formulário de percepção de impactos."
      />
    );
  }

  const municipios = new Intl.ListFormat("pt-BR", { type: "conjunction" }).format(
    splitList(reservoir.municipio).map((m) => m.replace(/[.;]+$/, "")),
  );

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-9 pb-20 md:px-10">
      <PageHeader eyebrow="Participação social" title="Impactos da Seca" />

      <section
        aria-labelledby="form-titulo"
        className="flex flex-wrap items-center gap-8 rounded-3xl bg-secondary p-6 text-on-dark md:p-9"
      >
        <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-3.5">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-sidebar-muted">
            Formulário de percepção de impactos
          </span>
          <h2
            id="form-titulo"
            className="m-0 font-display text-[28px] leading-tight font-bold text-balance text-white md:text-[34px]"
          >
            Conte como a seca afeta o seu dia a dia
          </h2>
          <p className="m-0 max-w-[62ch] text-base leading-[1.65] text-sidebar-foreground">
            O formulário reúne a percepção pessoal do impacto das secas no cotidiano individual, familiar e no
            trabalho. Sua participação ajuda a identificar e avaliar esses impactos em suas diversas dimensões.
          </p>
        </div>
        <div className="flex flex-[1_1_300px] flex-col gap-3.5 rounded-2xl border border-white/15 bg-white/5 p-[22px]">
          <p className="m-0 text-sm font-semibold text-white">Você pode anexar</p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm text-sidebar-foreground">
            {ANEXOS.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon aria-hidden="true" className="size-[18px] text-primary" />
                {label}
              </li>
            ))}
          </ul>
          <ExternalLink
            href={FORMULARIO_URL}
            className="h-12 justify-center rounded-[10px] bg-primary text-[15px] font-bold text-primary-foreground no-underline hover:bg-primary-hover hover:text-primary-foreground"
          >
            Responder ao formulário
          </ExternalLink>
        </div>
      </section>

      <section aria-labelledby="dim-titulo" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="dim-titulo" className="m-0 text-lg font-bold">
            Principais impactos
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-input bg-card px-4 text-sm font-semibold hover:bg-muted"
              >
                <ImageIcon aria-hidden="true" className="size-4" />
                Ver infográfico
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="m-0 pr-12 text-lg font-bold">Infográfico dos principais impactos</DialogTitle>
              <DialogDescription className="m-0 text-sm text-muted-foreground">
                Provisão de água, impactos econômicos, desafios sociais e consequências ambientais da seca.
              </DialogDescription>
              <div className="relative aspect-square w-full max-h-[70vh]">
                <Image
                  src="/infografico/infografico.png"
                  alt="Infográfico com as quatro dimensões de impacto da seca: provisão de água, impactos econômicos, desafios sociais e consequências ambientais"
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3.5 p-0">
          {DIMENSOES.map(({ title, icon: Icon, cls }) => (
            <li key={title} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-[22px]">
              <span aria-hidden="true" className={cn("flex size-12 items-center justify-center rounded-xl", cls)}>
                <Icon className="size-6" />
              </span>
              <h3 className="m-0 text-[17px] font-bold">{title}</h3>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="ctx-titulo"
        className="flex flex-wrap gap-x-10 gap-y-6 rounded-[20px] border border-border bg-card p-6 md:p-7"
      >
        <h2 id="ctx-titulo" className="m-0 flex-[1_1_220px] font-display text-[26px] font-bold">
          O contexto local
        </h2>
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-3.5">
          <p className="m-0 max-w-[68ch] text-base leading-[1.7]">
            O <strong>{reservoir.nome}</strong>
            {municipios ? `, que atende ${municipios} (CE),` : ""} enfrenta desafios significativos durante
            períodos de seca prolongada, com impactos sobre a provisão de água, a economia, o bem-estar social e o
            meio ambiente.
          </p>
          <p className="m-0 max-w-[68ch] text-base leading-[1.7]">
            A vulnerabilidade do sistema reflete a necessidade de políticas integradas que promovam a convivência
            sustentável com a seca, garantindo segurança hídrica e qualidade de vida para a população.
          </p>
        </div>
      </section>
    </div>
  );
}
