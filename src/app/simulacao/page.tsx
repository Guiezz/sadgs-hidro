"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  Droplets,
  BarChart3,
  LineChart,
  FileText,
  Waves,
  Sun,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// CONTEXTO
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";

// COMPONENTES
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

import { useSimulacao } from "@/components/simulacao/useSimulacao";

export default function SimulacaoPage() {
  const {
    selectedReservoir,
    loadingAcudes,
    simulating,
    progresso,
    selectedAcudeId,
    capacidadeTotal,
    volPercentual,
    setVolPercentual,
    filtroDataInicio,
    setFiltroDataInicio,
    filtroDataFim,
    setFiltroDataFim,
    demanda,
    setDemanda,
    modoSimulacao,
    setModoSimulacao,
    cenariosDemanda,
    setCenariosDemanda,
    visualizacaoModo,
    setVisualizacaoModo,
    gatilhos,
    resultado,
    resultadoMulti,
    error,
    handleSimular,
    handleDownloadCompleto,
    handleDownloadVazoes,
    handleDownloadEvaporacao,
    handleDownloadComparacao,
    resultadoFiltrado,
    resultadoMultiFiltrado,
    mesesFalha,
    anoMin,
    anoMax,
  } = useSimulacao();

  // --- RENDERIZAÇÃO: ESTADO VAZIO ---
  if (!selectedReservoir) {
    return (
      <div className="container mx-auto p-6 animate-in fade-in duration-500">
        <EmptyReservoirState />
      </div>
    );
  }

  // --- RENDERIZAÇÃO: PÁGINA PRINCIPAL ---
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter leading-none flex items-center gap-3">
            <Droplets className="h-8 w-8 text-amber-700" />
            Simulador de Balanço Hídrico
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[65ch]">
            Cenário atual: <strong>{selectedReservoir.nome}</strong>. Avalie a
            segurança hídrica ou compare diferentes cenários de demanda.
          </p>
        </div>

        {(resultado || resultadoMulti) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Selecione o formato</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resultado && (
                <>
                  <DropdownMenuItem
                    onClick={handleDownloadCompleto}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4 text-blue-600" /> Resultado
                    Completo (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDownloadVazoes}
                    className="cursor-pointer"
                  >
                    <Waves className="mr-2 h-4 w-4 text-green-600" /> Apenas
                    Vazões (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDownloadEvaporacao}
                    className="cursor-pointer"
                  >
                    <Sun className="mr-2 h-4 w-4 text-orange-600" /> Apenas
                    Evaporação (CSV)
                  </DropdownMenuItem>
                </>
              )}
              {resultadoMulti && (
                <DropdownMenuItem
                  onClick={handleDownloadComparacao}
                  className="cursor-pointer"
                >
                  <BarChart3 className="mr-2 h-4 w-4 text-purple-600" />{" "}
                  Comparação de Demandas (CSV)
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === COLUNA ESQUERDA: CONFIGURAÇÃO === */}
        <div className="lg:col-span-3 space-y-6">
          <ConfigForm
            selectedReservoirName={selectedReservoir.nome}
            selectedAcudeId={selectedAcudeId}
            capacidadeTotal={capacidadeTotal}
            volPercentual={volPercentual}
            setVolPercentual={setVolPercentual}
            filtroDataInicio={filtroDataInicio}
            setFiltroDataInicio={setFiltroDataInicio}
            filtroDataFim={filtroDataFim}
            setFiltroDataFim={setFiltroDataFim}
            demanda={demanda}
            setDemanda={setDemanda}
            onSimular={handleSimular}
            simulating={simulating}
            error={error}
            anoMin={anoMin}
            anoMax={anoMax}
            modoSimulacao={modoSimulacao}
            setModoSimulacao={setModoSimulacao}
            cenariosDemanda={cenariosDemanda}
            setCenariosDemanda={setCenariosDemanda}
          />
        </div>

        {/* === COLUNA DIREITA: RESULTADOS === */}
        <div className="lg:col-span-9 space-y-6">
          {/* Aviso sem dados */}
          {selectedReservoir && !selectedAcudeId && !loadingAcudes && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-200 p-8 text-center">
              <AlertCircle className="h-12 w-12 mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold text-yellow-700">
                Dados Indisponíveis
              </h3>
              <p className="max-w-md mt-2">
                O reservatório <strong>{selectedReservoir.nome}</strong> não
                possui série histórica cadastrada para simulação.
              </p>
            </div>
          )}

          {/* Loading */}
          {simulating && (
            <div className="h-full min-h-[500px] space-y-6">
              {/* Skeleton cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-lg p-5 space-y-3 animate-pulse"
                  >
                    <div className="h-3 bg-amber-100 rounded w-1/2" />
                    <div className="h-6 bg-amber-100 rounded w-3/4" />
                    <div className="h-3 bg-amber-50 rounded w-1/3" />
                  </div>
                ))}
              </div>
              {/* Skeleton chart */}
              <div className="bg-white border rounded-lg p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-amber-100 rounded w-1/4" />
                <div className="h-[300px] bg-amber-50 rounded" />
              </div>
              {/* Progress text */}
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{progresso || "Executando cenários..."}</span>
              </div>
            </div>
          )}

          {/* Estado Inicial */}
          {!resultado && !resultadoMulti && !simulating && selectedAcudeId && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-card border border-border/60 rounded-xl shadow-[var(--card-shadow)]">
              <div className="p-4 bg-amber-50 rounded-full mb-5">
                <Droplets className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1.5">
                Pronto para simular
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Configure os parâmetros à esquerda e clique em{" "}
                <strong>Gerar Simulação</strong> para visualizar os resultados.
              </p>
            </div>
          )}

          {/* === RESULTADOS: MODO ÚNICO === */}
          {resultadoFiltrado && !resultadoMulti && (
            <Tabs defaultValue="simulacao" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger
                  value="simulacao"
                  className="flex items-center gap-2"
                >
                  <LineChart className="h-4 w-4" />
                  Simulação
                </TabsTrigger>
                <TabsTrigger
                  value="historico"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dados Históricos
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="simulacao"
                className="space-y-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <KPICards
                  frequenciaFalha={resultadoFiltrado.frequencia_nao_atendida}
                  mesesFalha={mesesFalha}
                  demandaConfigurada={parseFloat(demanda)}
                />
                <MainChart data={resultadoFiltrado.resultados} />
                <ResultsTable data={resultadoFiltrado.resultados} />
              </TabsContent>

              <TabsContent
                value="historico"
                className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <HistoricalCharts data={resultadoFiltrado.resultados} />
              </TabsContent>
            </Tabs>
          )}

          {/* === RESULTADOS: COMPARAÇÃO DE DEMANDAS === */}
          {resultadoMultiFiltrado && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <SimulationDetails
                capacidadeTotal={capacidadeTotal}
                demandaBase={parseFloat(demanda)}
                periodoInicio={filtroDataInicio}
                periodoFim={filtroDataFim}
                numCenarios={resultadoMultiFiltrado.cenarios.length}
                numMeses={Math.max(
                  ...resultadoMultiFiltrado.cenarios.map((c) => c.resultados.length),
                )}
                volumeInicial={
                  resultadoMultiFiltrado.cenarios[0]?.volume_inicial ?? 0
                }
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
        </div>
      </div>
    </div>
  );
}
