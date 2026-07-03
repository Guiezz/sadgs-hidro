// src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useReservoir } from "@/context/ReservoirContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Droplets,
  Scale,
  AlertTriangle,
  ListChecks,
  ArrowRight,
  ShieldCheck,
  Waves,
  Calendar,
  Landmark,
} from "lucide-react";
import { ReservoirSelector } from "@/components/layout/ReservoirSelector";

export default function HomePage() {
  const { reservatorios, setSelectedReservoir } = useReservoir();
  const maxCapacidade = Math.max(...reservatorios.map((r) => r.capacidade_hm3), 1);

  return (
    <main className="flex flex-col bg-background">
      {/* Hero - full bleed */}
      <section
        className="relative overflow-hidden border-b border-border/40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[2%] via-transparent to-primary/[1%] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center gap-10 px-6 py-12 lg:px-12 lg:py-16 max-w-7xl mx-auto">
          <div className="flex-1 space-y-6">
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Sistema de Apoio à Decisão
                </span>
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-muted-foreground tracking-tight">
                Gestão de Secas em Hidrossistemas
              </h2>
            </div>

            <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [--tw-animation-delay:100ms]">
              Plataforma integrada para monitoramento, acompanhamento e
              divulgação das ações concebidas nos Planos de Gestão Proativa de
              Seca dos hidrossistemas do Ceará.
            </p>

            {/* Inline stats */}
            <div className="flex flex-wrap gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [--tw-animation-delay:200ms]">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <Droplets className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">
                  <strong className="text-foreground">{reservatorios.length}</strong>
                  <span className="text-muted-foreground ml-1">Hidrossistemas</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">
                  <strong className="text-foreground">107</strong>
                  <span className="text-muted-foreground ml-1">Anos de Dados</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <Landmark className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">
                  <strong className="text-foreground">7</strong>
                  <span className="text-muted-foreground ml-1">Instituições</span>
                </span>
              </div>
            </div>

            {/* Glass card selector */}
            <div className="bg-card/70 backdrop-blur-sm border border-border/40 rounded-xl p-6 shadow-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [--tw-animation-delay:300ms]">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  Qual hidrossistema você deseja analisar?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione para liberar os dados do sistema.
                </p>
                <p className="text-xs text-muted-foreground/60 italic">
                  * Primeiro carregamento pode levar até 1 minuto.
                </p>
              </div>
              <div className="pt-3">
                <ReservoirSelector fullWidth />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both [--tw-animation-delay:400ms]">
              <Button
                size="lg"
                asChild
                className="gap-2 w-full sm:w-auto group shadow-lg shadow-primary/20"
              >
                <Link href="/visao-geral">
                  Acessar Visão Geral
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/estado-de-seca">Ver Monitoramento</Link>
              </Button>
            </div>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center items-center w-full lg:mt-0">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 animate-in fade-in duration-1000 fill-mode-both [--tw-animation-delay:200ms]">
              <Image
                src="/logos/logo-sadgs.png"
                alt="Logo Sistema SADGS"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-16 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Funcionalidades do Sistema
          </h2>
          <p className="text-muted-foreground max-w-lg">
            Ferramentas essenciais para a governança hídrica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.href} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* Reservatórios */}
      <section className="py-16 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-border/40">
        <div className="space-y-3 mb-10">
          <h2 className="text-2xl font-bold tracking-tight">
            Hidrossistemas Monitorados
          </h2>
          <p className="text-muted-foreground">
            Atualmente, o sistema contempla os seguintes reservatórios:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reservatorios.map((res) => (
            <Card
              key={res.id}
              className="transition-all duration-200 hover:scale-[1.02] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              onClick={() => setSelectedReservoir(res)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <Droplets className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm leading-tight">
                    {res.nome}
                  </span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/40 rounded-full transition-all"
                    style={{
                      width: `${(res.capacidade_hm3 / maxCapacidade) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Instituições Parceiras */}
      <section className="py-16 lg:py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-border/40">
        <div className="space-y-3 mb-10">
          <h2 className="text-2xl font-bold tracking-tight">
            Instituições Parceiras
          </h2>
          <p className="text-muted-foreground max-w-xl">
            O SADGS é fruto de uma parceria entre instituições acadêmicas e
            órgãos gestores dos recursos hídricos do Ceará.
          </p>
        </div>

        <div className="space-y-12">
          <div className="space-y-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              Academia
            </h3>
            <div className="flex flex-wrap items-center gap-10 md:gap-14">
              <PartnerLogo
                src="/logos/cientista-chefe.png"
                alt="Programa Cientista Chefe"
              />
              <PartnerLogo src="/logos/cepas.png" alt="CEPAS" />
              <PartnerLogo
                src="/logos/ufc-h.png"
                alt="Universidade Federal do Ceará"
              />
            </div>
          </div>
          <div className="space-y-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              Gestão
            </h3>
            <div className="flex flex-wrap items-center gap-10 md:gap-14">
              <PartnerLogo src="/logos/cogerh.png" alt="COGERH" />
              <PartnerLogo src="/logos/funceme.png" alt="FUNCEME" />
              <PartnerLogo src="/logos/funcap.png" alt="FUNCAP" />
              <PartnerLogo src="/logos/srh-h.png" alt="SRH" />
              <PartnerLogo
                src="/logos/secitece-h.png"
                alt="SECITECE"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: <Activity className="h-5 w-5 text-white" />,
    title: "Monitoramento de Secas",
    description:
      "Acompanhe a evolução do estado de seca com base em indicadores atualizados.",
    href: "/estado-de-seca",
  },
  {
    icon: <ListChecks className="h-5 w-5 text-white" />,
    title: "Planos de Ação",
    description:
      "Consulte as ações estratégicas e emergenciais planejadas para mitigar os efeitos da escassez.",
    href: "/planos-de-acao",
  },
  {
    icon: <Scale className="h-5 w-5 text-white" />,
    title: "Balanço Hídrico",
    description:
      "Visualize a relação entre oferta e demanda hídrica, simulações e cenários futuros.",
    href: "/balanco-hidrico",
  },
  {
    icon: <Waves className="h-5 w-5 text-white" />,
    title: "Simulador de Vazões",
    description:
      "Realize simulações de balanço hídrico baseadas em séries históricas (1911-2017).",
    href: "/simulacao",
  },
  {
    icon: <AlertTriangle className="h-5 w-5 text-white" />,
    title: "Impactos",
    description:
      "Entenda os impactos socioeconômicos e ambientais da seca na região.",
    href: "/impactos",
  },
  {
    icon: <Droplets className="h-5 w-5 text-white" />,
    title: "Usos da Água",
    description:
      "Análise detalhada dos múltiplos usos da água e suas respectivas demandas.",
    href: "/usos-agua",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-white" />,
    title: "Implementação",
    description:
      "Acompanhe o status de implementação das medidas acordadas nos planos.",
    href: "/implementacao-planos-de-seca",
  },
];

function FeatureCard({
  icon,
  title,
  description,
  href,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  index: number;
}) {
  return (
    <Link href={href} className="group">
      <Card
        className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
        style={{
          animationName: "var(--animate-in,enter)",
          animationDuration: "500ms",
          animationDelay: `${index * 80}ms`,
          animationFillMode: "both",
          animationTimingFunction: "ease",
        }}
      >
        <CardHeader>
          <div className="bg-gradient-to-br from-primary to-primary/70 p-3 rounded-xl w-fit mb-2 shadow-sm shadow-primary/20">
            {icon}
          </div>
          <CardTitle className="group-hover:text-primary transition-colors text-base">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

function PartnerLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-10 md:h-12 w-28 md:w-36 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain dark:brightness-0 dark:invert"
      />
    </div>
  );
}
