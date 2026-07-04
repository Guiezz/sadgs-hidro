"use client";

import { useState, useEffect } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { IdentificationData } from "@/lib/types";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import Image from "next/image";
import Link from "next/link";

export default function ImpactosPage() {
  const { selectedReservoir } = useReservoir();

  const [identificationData, setIdentificationData] =
    useState<IdentificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não houver reservatório, paramos o loading para exibir o EmptyState
    if (!selectedReservoir) {
      setIsLoading(false);
      return;
    }

    const getIdentificationData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${config.apiBaseUrl}/reservatorios/${selectedReservoir.id}/identification`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Falha ao buscar dados de identificação");

        const data = await res.json();
        setIdentificationData(data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    getIdentificationData();
  }, [selectedReservoir]);

  // 1. ESTADO: NADA SELECIONADO
  if (!selectedReservoir) {
    return (
      <EmptyReservoirState
        title="Impactos da Seca Indisponíveis"
        description="Por favor, selecione um hidrossistema no topo da página para visualizar o contexto local e acessar o formulário de percepção de impactos."
      />
    );
  }

  // 2. ESTADO: CARREGANDO
  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            Carregando dados de impacto...
          </p>
        </div>
      </main>
    );
  }

  // 3. ESTADO: ERRO
  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="text-center p-6 bg-card border rounded-xl shadow-sm">
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            Erro ao carregar os dados.
          </h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  const nomeReservatorio = identificationData?.nome || "O Hidrossistema";
  const nomeMunicipio = identificationData?.municipio || "na região";

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 lg:p-8 bg-background">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Participação Social
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Impactos da Seca
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Coluna da Esquerda: Textos e Botão */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-sm font-semibold">Formulário de Percepção de Impactos</h3>
            </div>
            <div className="p-4 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Este formulário tem o objetivo de obter informações sobre a
                percepção pessoal do impacto das secas no cotidiano individual,
                familiar e no trabalho dos participantes.
              </p>
              <p>
                A sua participação é de grande importância para podermos
                identificar e avaliar os impactos das secas em suas mais
                diversas dimensões.
              </p>
              <p className="font-semibold text-foreground">
                Conte a sua história adicionando fotográficas, textos e
                documentos que apresentem evidências dos impactos relatados.
                Esses registros serão fundamentais para a descrição adequada do
                impacto das secas.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-primary/10">
              <h3 className="text-sm font-semibold">O Contexto Local</h3>
            </div>
            <div className="p-4 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                O{" "}
                <span className="font-bold text-foreground">
                  {nomeReservatorio}
                </span>
                , no município de{" "}
                <span className="font-bold text-foreground">
                  {nomeMunicipio}
                </span>{" "}
                (CE), enfrenta desafios significativos durante períodos de seca
                prolongada, com impactos que afetam a provisão de água, a
                economia, o bem-estar social e o meio ambiente.
              </p>
              <p>
                A vulnerabilidade do sistema reflete a necessidade de políticas
                integradas que promovam a convivência sustentável com a seca,
                garantindo segurança hídrica e qualidade de vida para a
                população.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Gráfico e Botão */}
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h3 className="text-sm font-semibold">Principais Impactos</h3>
          </div>
          <div className="p-4 flex flex-col items-center gap-6">
            <div className="relative w-full max-w-md aspect-square ring-1 ring-border/40 rounded-lg overflow-hidden">
              <Image
                src="/infografico/infografico.png"
                alt="Infográfico dos Principais Impactos"
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <Button size="lg" asChild className="w-full max-w-xs shadow-md">
              <Link
                href="https://cepas.ufc.br/pt_br/avaliacao-de-impacto-das-secas/"
                target="_blank"
              >
                Acesse o formulário aqui
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
