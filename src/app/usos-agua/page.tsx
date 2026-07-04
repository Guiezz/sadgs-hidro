"use client";

import { useState, useEffect } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";
import { UsoAgua, IdentificationData } from "@/lib/types";
import { UsoAguaChartResponsive } from "@/components/usos/UsoAguaChartResponsive";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";

export default function UsosAguaPage() {
  const { selectedReservoir } = useReservoir();

  const [chartData, setChartData] = useState<UsoAgua[]>([]);
  const [identificationData, setIdentificationData] =
    useState<IdentificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não houver reservatório selecionado, paramos o loading e não fazemos o fetch
    if (!selectedReservoir) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const id = selectedReservoir.id;

        const [usosRes, idRes] = await Promise.all([
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/water-uses`),
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/identification`),
        ]);

        if (!usosRes.ok || !idRes.ok) {
          throw new Error(
            "Falha ao buscar os dados da página de Usos da Água.",
          );
        }

        const usosData: UsoAgua[] = await usosRes.json();
        const idData: IdentificationData = await idRes.json();

        setChartData(usosData);
        setIdentificationData(idData);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido.",
        );
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
        title="Análise de Uso da Água indisponível"
        description="Por favor, selecione um hidrossistema no topo da página para visualizar o diagrama de usos e os dados de consumo."
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
            Carregando dados de usos da água...
          </p>
        </div>
      </main>
    );
  }

  // 3. ESTADO: ERRO NA API
  if (error || !chartData || !identificationData) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="text-center p-6 bg-card border rounded-xl shadow-sm">
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            Erro ao carregar os dados da página.
          </h1>
          <p>{error || "Verifique o console para mais detalhes."}</p>
        </div>
      </main>
    );
  }

  // 4. ESTADO: SUCESSO
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6 bg-background overflow-x-hidden">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Usos da Água
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Análise de Consumo
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">Diagrama de Usos</h3>
        </div>
        <div className="p-4">
          {identificationData.url_imagem_usos ? (
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={identificationData.url_imagem_usos}
                alt={`Diagrama de usos da água do açude ${identificationData.nome}`}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-md"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Imagem do diagrama de usos não encontrada.
            </p>
          )}
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-xl">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">Vazão por Setor</h3>
        </div>
        <div className="p-4">
          <UsoAguaChartResponsive data={chartData} />
        </div>
      </div>
      </div>
    </main>
  );
}
