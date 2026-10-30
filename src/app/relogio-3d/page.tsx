"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { useState, useEffect } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";
import { GatilhoPGPSMes, DashboardSummary, UsoAgua } from "@/lib/types";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import Reservoir3DViewer from "@/components/reservoir-3d/Reservoir3DViewer";
import { Loader2 } from "lucide-react";

export default function Relogio3DPage() {
  const { selectedReservoir } = useReservoir();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [gatilhos, setGatilhos] = useState<GatilhoPGPSMes[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [waterUses, setWaterUses] = useState<UsoAgua[]>([]);

  useEffect(() => {
    if (!selectedReservoir) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      const id = selectedReservoir.id;

      try {
        const [gatilhosRes, summaryRes, usesRes] = await Promise.all([
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/gatilhos-pgps`, {
            cache: "no-store",
          }),
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/dashboard/summary`, {
            cache: "no-store",
          }),
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/water-uses`, {
            cache: "no-store",
          }),
        ]);

        if (!gatilhosRes.ok || !summaryRes.ok || !usesRes.ok) {
          throw new Error("Falha ao buscar os dados da visualização 3D.");
        }

        const gatilhosData = await gatilhosRes.json();
        const summaryData = await summaryRes.json();
        const usesData = await usesRes.json();

        // A API /gatilhos-pgps pode retornar { gatilhos: [...] }
        const gatilhosList = Array.isArray(gatilhosData)
          ? gatilhosData
          : gatilhosData.gatilhos || [];

        setGatilhos(gatilhosList);
        setSummary(summaryData);
        setWaterUses(usesData);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedReservoir]);

  // 1. ESTADO: NADA SELECIONADO
  if (!selectedReservoir) {
    return (
      <EmptyReservoirState
        title="Visualização 3D Indisponível"
        description="Por favor, selecione um hidrossistema no topo da página para carregar o modelo interativo 3D do reservatório."
      />
    );
  }

  // 2. ESTADO: CARREGAMENTO INICIAL (quando ainda não há nenhum dado carregado)
  if (isLoading && !summary) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">
            Carregando dados da visualização tridimensional...
          </p>
        </div>
      </main>
    );
  }

  // 3. ESTADO: ERRO NA API (se falhar e não tiver dados)
  if (error && !summary) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 min-h-[60vh]">
        <div className="text-center p-6 bg-card border border-border/40 rounded-xl shadow-sm max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Erro ao carregar a página
          </h1>
          <p className="text-muted-foreground text-sm">
            {error || "Verifique se a API está respondendo e tente novamente."}
          </p>
        </div>
      </main>
    );
  }

  // 4. ESTADO: SUCESSO (mantém o componente montado mesmo durante transições de reservatório)
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-9 pb-20 md:px-10">
      <PageHeader
        eyebrow="Painel tridimensional"
        title={`Relógio da Seca 3D — ${selectedReservoir.nome}`}
        actions={
          isLoading && (
            <span role="status" className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              Atualizando…
            </span>
          )
        }
      />

      <Reservoir3DViewer
        reservoirName={selectedReservoir.nome}
        capacityHm3={selectedReservoir.capacidade_hm3}
        realVolumePercent={summary?.volumePercentual ?? 50}
        dataUltimaMedicao={summary?.dataUltimaMedicao}
        gatilhos={gatilhos}
        waterUses={waterUses}
      />
    </div>
  );
}
