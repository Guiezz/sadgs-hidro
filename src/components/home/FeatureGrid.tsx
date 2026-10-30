import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  Droplet,
  ListChecks,
  type LucideIcon,
  Scale,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "earth" | "water";
};

const FEATURES: Feature[] = [
  {
    href: "/planos-de-acao",
    title: "Planos de Ação",
    description: "Consulte as ações estratégicas e emergenciais planejadas para mitigar a escassez.",
    icon: ListChecks,
    tone: "earth",
  },
  {
    href: "/implementacao-planos-de-seca",
    title: "Implementação",
    description: "Acompanhe o status das medidas acordadas nos planos.",
    icon: ClipboardCheck,
    tone: "earth",
  },
  {
    href: "/balanco-hidrico",
    title: "Balanço Hídrico",
    description: "Relação entre oferta e demanda hídrica, simulações e cenários futuros.",
    icon: Scale,
    tone: "earth",
  },
  {
    href: "/simulacao",
    title: "Simulador de Vazões",
    description: "Simulações de balanço hídrico com séries históricas (1911–2017).",
    icon: SlidersHorizontal,
    tone: "water",
  },
  {
    href: "/impactos",
    title: "Impactos",
    description: "Impactos socioeconômicos e ambientais da seca na região.",
    icon: TriangleAlert,
    tone: "earth",
  },
  {
    href: "/usos-agua",
    title: "Usos da Água",
    description: "Os múltiplos usos da água e suas respectivas demandas.",
    icon: Droplet,
    tone: "water",
  },
];

const cardHover =
  "transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_10px_30px_-12px_rgba(88,31,2,.28)]";

export function FeatureGrid() {
  return (
    <section aria-labelledby="func-titulo" className="px-4 pt-16 md:px-14">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-7">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">Funcionalidades</span>
          <h2 id="func-titulo" className="m-0 font-display text-[30px] font-bold tracking-[-0.01em] md:text-[36px]">
            Ferramentas para a governança hídrica
          </h2>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4 p-0">
          <li className="flex lg:row-span-2">
            <Link
              href="/estado-de-seca"
              className={cn(
                "group flex flex-1 flex-col gap-4 rounded-[18px] border border-secondary bg-secondary p-7 text-on-dark no-underline hover:text-on-dark",
                cardHover,
              )}
            >
              <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Activity className="size-6" />
              </span>
              <span className="font-display text-[26px] font-bold text-white">Monitoramento de Secas</span>
              <span className="text-[15px] leading-relaxed text-sidebar-foreground texto-corrido">
                Acompanhe a evolução do estado de seca de cada reservatório com base nos indicadores e metas do plano.
              </span>
              <span className="mt-auto inline-flex items-center gap-2 font-semibold text-primary">
                Abrir monitoramento
                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-[3px]" />
              </span>
            </Link>
          </li>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.href} className="flex">
                <Link
                  href={f.href}
                  className={cn(
                    "group flex flex-1 gap-4 rounded-2xl border border-border bg-card p-[22px] text-foreground no-underline hover:text-foreground",
                    cardHover,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      f.tone === "water" ? "bg-water-soft text-water" : "bg-accent text-link",
                    )}
                  >
                    <Icon className="size-[22px]" />
                  </span>
                  <span className="flex flex-1 flex-col gap-1.5">
                    <span className="flex justify-between gap-2 text-[17px] font-bold">
                      {f.title}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-label transition-[transform,color] group-hover:translate-x-[3px] group-hover:text-link"
                      />
                    </span>
                    <span className="text-sm leading-normal text-muted-foreground texto-corrido">{f.description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
