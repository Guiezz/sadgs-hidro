"use client";

import { useState, useEffect } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";
import { GatilhoPGPSMes, DashboardSummary, UsoAgua } from "@/lib/types";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import Reservoir3DViewer from "@/components/reservoir-3d/Reservoir3DViewer";
import { Loader2, Layers3 } from "lucide-react";

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
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6 bg-background overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
            <Layers3 className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Painel Tridimensional
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Relógio da Seca 3D — {selectedReservoir.nome}
            </h1>
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border/40 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Atualizando...</span>
          </div>
        )}
      </div>

      <Reservoir3DViewer
        reservoirName={selectedReservoir.nome}
        capacityHm3={selectedReservoir.capacidade_hm3}
        realVolumePercent={summary?.volumePercentual ?? 50}
        dataUltimaMedicao={summary?.dataUltimaMedicao}
        gatilhos={gatilhos}
        waterUses={waterUses}
      />
    </main>
  );
}
