"use client";

import { AlertCircle, ChartColumn, ChartLine, Download, FileText, Sun, Waves } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import { ConfigForm } from "@/components/simulacao/ConfigForm";
import { KPICards } from "@/components/simulacao/KPICards";
import { MainChart } from "@/components/simulacao/MainChart";
import { ResultsTable } from "@/components/simulacao/ResultsTable";
import { HistoricalCharts } from "@/components/simulacao/HistoricalCharts";
import { ScenarioKPIs } from "@/components/simulacao/ScenarioKPIs";
import { DemandComparisonChart } from "@/components/simulacao/DemandComparisonChart";
import { ComparisonTable } from "@/components/simulacao/ComparisonTable";
import { FNAChart } from "@/components/simulacao/FNAChart";
import { SimulationSummary } from "@/components/simulacao/SimulationSummary";
import { SimulationDetails } from "@/components/simulacao/SimulationDetails";
import { SimulationEmptyState } from "@/components/simulacao/SimulationEmptyState";
import { useSimulacao } from "@/components/simulacao/useSimulacao";

export default function SimulacaoPage() {
  const sim = useSimulacao();
  const {
    selectedReservoir,
    loadingAcudes,
    simulating,
    progresso,
    selectedAcudeId,
    capacidadeTotal,
    filtroDataInicio,
    filtroDataFim,
    demanda,
    cenariosDemanda,
    visualizacaoModo,
    setVisualizacaoModo,
    gatilhos,
    resultado,
    resultadoMulti,
    resultadoFiltrado,
    resultadoMultiFiltrado,
    mesesFalha,
  } = sim;

  if (!selectedReservoir) return <EmptyReservoirState />;

  const temResultado = Boolean(resultado || resultadoMulti);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-9 pb-20 md:px-10">
      <PageHeader
        eyebrow="Simulador de balanço hídrico"
        title="E se a seca voltar?"
        description={`Avalie a segurança hídrica do ${selectedReservoir.nome} com séries históricas de vazão (1911–2017), num cenário único ou comparando demandas.`}
        actions={
          temResultado && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-input bg-card px-4 text-sm font-semibold hover:bg-muted"
                >
                  <Download aria-hidden="true" className="size-4" />
                  Exportar dados
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Baixar em CSV</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {resultado && (
                  <>
                    <DropdownMenuItem onClick={sim.handleDownloadCompleto} className="min-h-10 cursor-pointer">
                      <FileText aria-hidden="true" className="mr-2 size-4 text-water" /> Resultado completo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={sim.handleDownloadVazoes} className="min-h-10 cursor-pointer">
                      <Waves aria-hidden="true" className="mr-2 size-4 text-water" /> Apenas vazões
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={sim.handleDownloadEvaporacao} className="min-h-10 cursor-pointer">
                      <Sun aria-hidden="true" className="mr-2 size-4 text-link" /> Apenas evaporação
                    </DropdownMenuItem>
                  </>
                )}
                {resultadoMulti && (
                  <DropdownMenuItem onClick={sim.handleDownloadComparacao} className="min-h-10 cursor-pointer">
                    <ChartColumn aria-hidden="true" className="mr-2 size-4 text-link" /> Comparação de demandas
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <ConfigForm
          selectedReservoirName={selectedReservoir.nome}
          selectedAcudeId={selectedAcudeId}
          capacidadeTotal={capacidadeTotal}
          volPercentual={sim.volPercentual}
          setVolPercentual={sim.setVolPercentual}
          filtroDataInicio={filtroDataInicio}
          setFiltroDataInicio={sim.setFiltroDataInicio}
          filtroDataFim={filtroDataFim}
          setFiltroDataFim={sim.setFiltroDataFim}
          demanda={demanda}
          setDemanda={sim.setDemanda}
          onSimular={sim.handleSimular}
          simulating={simulating}
          error={sim.error}
          anoMin={sim.anoMin}
          anoMax={sim.anoMax}
          modoSimulacao={sim.modoSimulacao}
          setModoSimulacao={sim.setModoSimulacao}
          cenariosDemanda={cenariosDemanda}
          setCenariosDemanda={sim.setCenariosDemanda}
          volumeAtualPct={sim.volumeAtualPct}
          demandaAtualM3s={sim.demandaAtualM3s}
        />

        <section aria-labelledby="res-titulo" aria-live="polite" className="flex min-w-0 flex-col gap-6">
          {!selectedAcudeId && !loadingAcudes && (
            <>
              <h2 id="res-titulo" className="sr-only">
                Simulação indisponível
              </h2>
              <EmptyState
                icon={AlertCircle}
                title="Dados indisponíveis"
                description={`O reservatório ${selectedReservoir.nome} não possui série histórica cadastrada para simulação.`}
              />
            </>
          )}

          {simulating && (
            <div role="status" className="flex flex-col gap-4">
              <h2 id="res-titulo" className="sr-only">
                Simulando
              </h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-[320px] rounded-[20px]" />
              <p className="m-0 flex items-center justify-center gap-2.5 text-sm text-muted-foreground">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-primary" />
                {progresso || "Executando a simulação…"}
              </p>
            </div>
          )}

          {!temResultado && !simulating && selectedAcudeId && <SimulationEmptyState />}

          {resultadoFiltrado && !resultadoMulti && !simulating && (
            <>
              <h2 id="res-titulo" className="sr-only">
                Resultado da simulação
              </h2>
              <Tabs defaultValue="simulacao" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-[10px] bg-muted p-1 lg:w-[400px]">
                  <TabsTrigger value="simulacao" className="h-10 gap-2 rounded-[7px] font-semibold">
                    <ChartLine aria-hidden="true" className="size-4" />
                    Simulação
                  </TabsTrigger>
                  <TabsTrigger value="historico" className="h-10 gap-2 rounded-[7px] font-semibold">
                    <ChartColumn aria-hidden="true" className="size-4" />
                    Dados históricos
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="simulacao" className="mt-4 flex flex-col gap-6">
                  <KPICards
                    frequenciaFalha={resultadoFiltrado.frequencia_nao_atendida}
                    mesesFalha={mesesFalha}
                    demandaConfigurada={parseFloat(demanda)}
                  />
                  <MainChart data={resultadoFiltrado.resultados} />
                  <ResultsTable data={resultadoFiltrado.resultados} />
                </TabsContent>
                <TabsContent value="historico" className="mt-4">
                  <HistoricalCharts data={resultadoFiltrado.resultados} />
                </TabsContent>
              </Tabs>
            </>
          )}

          {resultadoMultiFiltrado && !simulating && (
            <div className="flex flex-col gap-6">
              <h2 id="res-titulo" className="sr-only">
                Comparação de demandas
              </h2>
              <SimulationDetails
                capacidadeTotal={capacidadeTotal}
                demandaBase={parseFloat(demanda)}
                periodoInicio={filtroDataInicio}
                periodoFim={filtroDataFim}
                numCenarios={resultadoMultiFiltrado.cenarios.length}
                numMeses={Math.max(...resultadoMultiFiltrado.cenarios.map((c) => c.resultados.length))}
                volumeInicial={resultadoMultiFiltrado.cenarios[0]?.volume_inicial ?? 0}
              />
              <ScenarioKPIs cenarios={resultadoMultiFiltrado.cenarios} />
              <DemandComparisonChart
                cenarios={resultadoMultiFiltrado.cenarios}
                capacidadeTotal={capacidadeTotal}
                visualizacaoModo={visualizacaoModo}
                setVisualizacaoModo={setVisualizacaoModo}
                gatilhos={gatilhos}
              />
              <ComparisonTable cenarios={resultadoMultiFiltrado.cenarios} />
              <FNAChart cenarios={resultadoMultiFiltrado.cenarios} />
              <SimulationSummary
                cenarios={resultadoMultiFiltrado.cenarios}
                capacidadeTotal={capacidadeTotal}
                demandaBase={parseFloat(demanda)}
                periodoInicio={filtroDataInicio}
                periodoFim={filtroDataFim}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
