"use client";

import { useEffect, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";
import { StaticWaterBalanceCharts } from "@/lib/types";
import { BalancoHidricoChart } from "@/components/balance/BalancoHidricoChart";
import { ComposicaoDemandaChart } from "@/components/balance/ComposicaoDemandaChart";
import { OfertaDemandaChart } from "@/components/balance/OfertaDemandaChart";
import { Loader2 } from "lucide-react";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";

export default function BalancoHidricoPage() {
  const { selectedReservoir } = useReservoir();
  const [chartData, setChartData] = useState<StaticWaterBalanceCharts | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não houver reservatório, paramos o loading para mostrar o EmptyState
    if (!selectedReservoir) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/reservatorios/${selectedReservoir.id}/water-balance`,
        );
        if (!response.ok) {
          throw new Error("Falha ao buscar dados da API do Balanço Hídrico");
        }
        setChartData(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedReservoir]);

  // 1. ESTADO: NADA SELECIONADO
  if (!selectedReservoir) {
    return (
      <EmptyReservoirState
        title="Balanço Hídrico Indisponível"
        description="Por favor, selecione um hidrossistema no topo da página para visualizar os gráficos de oferta, demanda e balanço mensal."
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
            Carregando dados do balanço hídrico...
          </p>
        </div>
      </main>
    );
  }

  // 3. ESTADO: ERRO
  if (error || !chartData) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="text-center p-6 bg-card border rounded-xl shadow-sm max-w-md">
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            Erro ao carregar dados
          </h1>
          <p className="text-muted-foreground">
            {error || "Nenhum dado retornado pela API."}
          </p>
        </div>
      </main>
    );
  }

  // 4. ESTADO: SUCESSO
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6 bg-background overflow-x-hidden">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Balanço Hídrico
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {selectedReservoir.nome}
        </h1>
      </div>

      <OfertaDemandaChart data={chartData.ofertaDemanda} />

      <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
        <ComposicaoDemandaChart data={chartData.composicaoDemanda} />
        <BalancoHidricoChart data={chartData.balancoMensal} />
      </div>
    </main>
  );
}
