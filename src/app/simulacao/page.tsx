"use client";

import { useEffect, useState } from "react";
import { getDaysInMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Download,
  Droplets,
  BarChart3,
  LineChart,
  FileText,
  Waves,
  Sun,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  SimAcude,
  SimulacaoResponse,
  SimulacaoMultiResponse,
  CenarioDemanda,
  ResultadoCenario,
  DistribuicaoResultados,
  EstatisticaDescritiva,
  GatilhoPGPSMes,
} from "@/lib/types";
import { parseDataLocal } from "@/components/simulacao/helpers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { useReservoir } from "@/context/ReservoirContext";
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

export default function SimulacaoPage() {
  // --- CONTEXTO ---
  const { selectedReservoir } = useReservoir();

  // --- ESTADOS ---
  const [acudes, setAcudes] = useState<SimAcude[]>([]);
  const [loadingAcudes, setLoadingAcudes] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [progresso, setProgresso] = useState<string | null>(null);

  // Inputs
  const [selectedAcudeId, setSelectedAcudeId] = useState<string>("");
  const [capacidadeTotal, setCapacidadeTotal] = useState<number>(0);
  const [volPercentual, setVolPercentual] = useState<string>("50");

  // Filtro de datas
  const [filtroDataInicio, setFiltroDataInicio] = useState("1911-01-01");
  const [filtroDataFim, setFiltroDataFim] = useState("2017-12-31");
  const [demanda, setDemanda] = useState<string>("0.5");

  // Anos disponíveis
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);

  // Modo de simulação
  const [modoSimulacao, setModoSimulacao] = useState<"unico" | "comparacao">(
    "unico",
  );
  const [cenariosDemanda, setCenariosDemanda] = useState<CenarioDemanda[]>([]);
  const [visualizacaoModo, setVisualizacaoModo] = useState<"hm3" | "percentual">("hm3");

  // Gatilhos PGPS
  const [gatilhos, setGatilhos] = useState<GatilhoPGPSMes[]>([]);

  // Resultados
  const [resultado, setResultado] = useState<SimulacaoResponse | null>(null);
  const [resultadoMulti, setResultadoMulti] =
    useState<SimulacaoMultiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSimulacaoAcudes();
        setAcudes(data);
      } catch (err) {
        console.error("Erro", err);
        setError("Não foi possível carregar os dados de simulação.");
      } finally {
        setLoadingAcudes(false);
      }
    }
    load();
  }, []);

  function generateAnosRange(min: number, max: number): number[] {
    const anos: number[] = [];
    for (let a = min; a <= max; a++) anos.push(a);
    return anos;
  }

  // --- BUSCAR ANOS DISPONÍVEIS ---
  useEffect(() => {
    if (!selectedAcudeId) return;
    const id = parseInt(selectedAcudeId);
    api.getSimulacaoAnos(id).then((resp) => {
      if (resp.anos.length > 0) {
        setAnosDisponiveis(resp.anos);
      } else {
        setAnosDisponiveis(generateAnosRange(1911, 2017));
      }
    }).catch(() => {
      setAnosDisponiveis(generateAnosRange(1911, 2017));
    });
  }, [selectedAcudeId]);

  // --- SINCRONIZAÇÃO COM O CONTEXTO ---
  useEffect(() => {
    setResultado(null);
    setResultadoMulti(null);
    setAnosDisponiveis([]);
    setGatilhos([]);

    if (selectedReservoir && acudes.length > 0) {
      // Mapear por nome pois /reservatorios e /simulacao/acudes usam IDs diferentes
      const normalizar = (s: string) => s.toLowerCase().replace(/\s*\/.*$/, "").trim();
      const nomeAlvo = normalizar(selectedReservoir.nome);
      const match = acudes.find(
        (a) => normalizar(a.nome) === nomeAlvo,
      );
      if (match) {
        setSelectedAcudeId(match.codigo.toString());
        setCapacidadeTotal(match.capacidade_m3 / 1000000);
        setError(null);

        // Buscar gatilhos PGPS (usa o id do reservatório, não o código da simulação)
        api.getGatilhosPGPS(selectedReservoir.id)
          .then((resp) => setGatilhos(resp.gatilhos))
          .catch(() => setGatilhos([]));
      } else {
        setSelectedAcudeId("");
        setCapacidadeTotal(0);
      }
    } else {
      setSelectedAcudeId("");
    }
  }, [selectedReservoir, acudes]);

  // --- ESTATÍSTICAS ---
  function computeEstatistica(values: number[]): EstatisticaDescritiva {
    if (values.length === 0) {
      return { min: 0, max: 0, media: 0, mediana: 0, p10: 0, p90: 0 };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const media = sum / n;
    const mediana =
      n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];
    return {
      min: sorted[0],
      max: sorted[n - 1],
      media,
      mediana,
      p10: sorted[Math.max(0, Math.floor(n * 0.1))],
      p90: sorted[Math.max(0, Math.floor(n * 0.9) - 1)] ?? sorted[n - 1],
    };
  }

  function computeDistribuicao(
    cenarios: ResultadoCenario[],
  ): DistribuicaoResultados {
    return {
      frequencia_nao_atendida: computeEstatistica(
        cenarios.map((c) => c.frequencia_nao_atendida),
      ),
      volume_final: computeEstatistica(cenarios.map((c) => c.volume_final)),
    };
  }

  function computeMesesComFalha(
    resultados: { data: string; retirada_hm3: number }[],
    demandaM3s: number,
  ): number {
    return resultados.filter((item) => {
      const data = parseDataLocal(item.data);
      const diasNoMes = getDaysInMonth(data);
      const demandaEsperadaHm3 = (demandaM3s * diasNoMes * 86400) / 1e6;
      return demandaEsperadaHm3 - item.retirada_hm3 > 0.01;
    }).length;
  }

  function computePrimeiraFalha(
    resultados: { data: string; retirada_hm3: number }[],
    demandaM3s: number,
  ): string | null {
    for (const item of resultados) {
      const data = parseDataLocal(item.data);
      const diasNoMes = getDaysInMonth(data);
      const demandaEsperadaHm3 = (demandaM3s * diasNoMes * 86400) / 1e6;
      if (demandaEsperadaHm3 - item.retirada_hm3 > 0.01) {
        return format(data, "MMM/yyyy", { locale: ptBR });
      }
    }
    return null;
  }

  function computePontosDeficit(
    resultados: { data: string; retirada_hm3: number }[],
    demandaM3s: number,
  ): number[] {
    const pontos: number[] = [];
    resultados.forEach((item, idx) => {
      const data = parseDataLocal(item.data);
      const diasNoMes = getDaysInMonth(data);
      const demandaEsperadaHm3 = (demandaM3s * diasNoMes * 86400) / 1e6;
      if (demandaEsperadaHm3 - item.retirada_hm3 > 0.01) {
        pontos.push(idx);
      }
    });
    return pontos;
  }

  function isAtendido(
    item: { data: string; retirada_hm3: number },
    demandaM3s: number,
  ): boolean {
    const data = parseDataLocal(item.data);
    const diasNoMes = getDaysInMonth(data);
    const demandaEsperadaHm3 = (demandaM3s * diasNoMes * 86400) / 1e6;
    return demandaEsperadaHm3 - item.retirada_hm3 <= 0.01;
  }

  function computeDeficit(
    item: { data: string; retirada_hm3: number },
    demandaM3s: number,
  ): number {
    const data = parseDataLocal(item.data);
    const diasNoMes = getDaysInMonth(data);
    const demandaEsperadaHm3 = (demandaM3s * diasNoMes * 86400) / 1e6;
    return Math.max(0, demandaEsperadaHm3 - item.retirada_hm3);
  }

  // --- SIMULAÇÃO ---
  const handleSimular = async () => {
    if (!selectedAcudeId) return;

    const perc = parseFloat(volPercentual);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      setError("O volume deve ser entre 0% e 100%.");
      return;
    }

    if (filtroDataInicio > filtroDataFim) {
      setError("A data final deve ser maior ou igual à data inicial.");
      return;
    }

    setSimulating(true);
    setError(null);
    setResultado(null);
    setResultadoMulti(null);
    setProgresso(null);

    const volAbsoluto = (perc / 100) * capacidadeTotal;
    const demandaBase = parseFloat(demanda);

    const baseParams = {
      reservatorio_id: parseInt(selectedAcudeId),
      volume_inicial: volAbsoluto,
      volume_final: volAbsoluto,
      data_inicio: `${filtroDataInicio}T00:00:00.000Z`,
      data_fim: `${filtroDataFim}T00:00:00.000Z`,
      usar_media_historica: false,
    };

    try {
      if (modoSimulacao === "comparacao" && cenariosDemanda.length > 0) {
        // Modo comparação: cada cenário roda com demanda diferente
        const erros: string[] = [];
        const resultadosCenarios: ResultadoCenario[] = [];
        const total = cenariosDemanda.length;

        for (let i = 0; i < cenariosDemanda.length; i++) {
          const cenario = cenariosDemanda[i];
          setProgresso(`Cenário ${i + 1}/${total}: ${cenario.nome}`);

          const demandaCenario = demandaBase * (cenario.percentual / 100);
          try {
            const resp = await api.runSimulacao({
              ...baseParams,
              demandas_mensais: [demandaCenario],
            });
            const mesesComFalha = computeMesesComFalha(
              resp.resultados,
              demandaCenario,
            );
            const menorVolume = Math.min(
              ...resp.resultados.map((r) => r.volume_final_hm3),
            );
            const primeiraFalha = computePrimeiraFalha(
              resp.resultados,
              demandaCenario,
            );
            const pontosDeficit = computePontosDeficit(
              resp.resultados,
              demandaCenario,
            );

            resultadosCenarios.push({
              nome: cenario.nome,
              resultados: resp.resultados,
              frequencia_nao_atendida: resp.frequencia_nao_atendida,
              volume_final: resp.volume_final,
              volume_inicial: volAbsoluto,
              menor_volume: menorVolume,
              meses_com_falha: mesesComFalha,
              primeira_falha: primeiraFalha,
              pontos_deficit: pontosDeficit,
              ganho_fna: null,
              ganho_volume: null,
              ganho_falhas: null,
            });
          } catch {
            erros.push(cenario.nome);
          }
        }

        if (erros.length > 0) {
          setError(`Falha ao simular cenário(s): ${erros.join(", ")}`);
        }

        if (resultadosCenarios.length > 0) {
          // Calcular ganhos vs cenário base
          const cenarioBase = resultadosCenarios.find((c) => {
            const cd = cenariosDemanda.find((d) => d.nome === c.nome);
            return cd?.percentual === 100;
          });

          if (cenarioBase) {
            resultadosCenarios.forEach((c) => {
              if (c.nome === cenarioBase.nome) return;
              c.ganho_fna =
                cenarioBase.frequencia_nao_atendida > 0
                  ? ((cenarioBase.frequencia_nao_atendida - c.frequencia_nao_atendida) /
                      cenarioBase.frequencia_nao_atendida) *
                    100
                  : 0;
              c.ganho_volume =
                cenarioBase.volume_final > 0
                  ? ((c.volume_final - cenarioBase.volume_final) /
                      cenarioBase.volume_final) *
                    100
                  : 0;
              c.ganho_falhas =
                cenarioBase.meses_com_falha > 0
                  ? ((cenarioBase.meses_com_falha - c.meses_com_falha) /
                      cenarioBase.meses_com_falha) *
                    100
                  : 0;
            });
          }

          const distribuicao = computeDistribuicao(resultadosCenarios);
          setResultadoMulti({ cenarios: resultadosCenarios, distribuicao });
        }
      } else {
        // Modo único
        const resp = await api.runSimulacao({
          ...baseParams,
          demandas_mensais: [demandaBase],
        });
        setResultado(resp);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao executar a simulação.",
      );
    } finally {
      setSimulating(false);
      setProgresso(null);
    }
  };

  // --- FUNÇÕES DE DOWNLOAD ---
  const downloadCSV = (
    filename: string,
    headers: string[],
    rows: (string | number)[][],
  ) => {
    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCompleto = () => {
    if (!resultadoFiltrado) return;
    const demandaM3s = parseFloat(demanda);
    const headers = [
      "Data",
      "Afluencia (hm3)",
      "Evaporacao (hm3)",
      "Retirada (hm3)",
      "Vertimento (hm3)",
      "Volume Inicial (hm3)",
      "Atendimento",
      "Deficit (hm3)",
    ];
    const rows = resultadoFiltrado.resultados.map((r) => [
      r.data,
      (r.afluencia_hm3 ?? 0).toFixed(3),
      (r.evaporacao_hm3 ?? 0).toFixed(3),
      (r.retirada_hm3 ?? 0).toFixed(3),
      (r.vertimento_hm3 ?? 0).toFixed(3),
      (r.volume_inicial_hm3 ?? r.volume_hm3 ?? 0).toFixed(3),
      isAtendido(r, demandaM3s) ? "Sim" : "Nao",
      computeDeficit(r, demandaM3s).toFixed(3),
    ]);
    downloadCSV(`simulacao_completa_${selectedAcudeId}.csv`, headers, rows);
  };

  const handleDownloadVazoes = () => {
    if (!resultadoFiltrado) return;
    const headers = ["Data", "Vazao (hm3)"];
    const rows = resultadoFiltrado.resultados.map((r) => [
      r.data,
      r.afluencia_hm3.toFixed(3),
    ]);
    downloadCSV(`serie_vazoes_${selectedAcudeId}.csv`, headers, rows);
  };

  const handleDownloadEvaporacao = () => {
    if (!resultadoFiltrado) return;
    const headers = ["Data", "Evaporacao (hm3)"];
    const rows = resultadoFiltrado.resultados.map((r) => [
      r.data,
      r.evaporacao_hm3.toFixed(3),
    ]);
    downloadCSV(`serie_evaporacao_${selectedAcudeId}.csv`, headers, rows);
  };

  const handleDownloadComparacao = () => {
    if (!resultadoMultiFiltrado) return;
    const cenarios = resultadoMultiFiltrado.cenarios;
    if (cenarios.length === 0) return;

    const demandaBase = parseFloat(demanda);

    // Encontrar o máximo de meses entre todos os cenários
    const maxMeses = Math.max(...cenarios.map((c) => c.resultados.length));

    const headers = ["Data"];
    cenarios.forEach((c) => {
      headers.push(`${c.nome} - Afluencia (hm3)`);
      headers.push(`${c.nome} - Evaporacao (hm3)`);
      headers.push(`${c.nome} - Retirada (hm3)`);
      headers.push(`${c.nome} - Vertimento (hm3)`);
      headers.push(`${c.nome} - Vol. Final (hm3)`);
      headers.push(`${c.nome} - Vol. Inicial (hm3)`);
      headers.push(`${c.nome} - Atendimento`);
      headers.push(`${c.nome} - Deficit (hm3)`);
    });

    const rows: (string | number)[][] = [];
    for (let i = 0; i < maxMeses; i++) {
      const row: (string | number)[] = [];
      const data = cenarios[0]?.resultados[i]?.data ?? "";
      row.push(data);
      cenarios.forEach((c) => {
        const ponto = c.resultados[i];
        const cd = cenariosDemanda.find((d) => d.nome === c.nome);
        const demandaCenario = cd ? demandaBase * (cd.percentual / 100) : demandaBase;
        if (ponto) {
          row.push((ponto.afluencia_hm3 ?? 0).toFixed(3));
          row.push((ponto.evaporacao_hm3 ?? 0).toFixed(3));
          row.push((ponto.retirada_hm3 ?? 0).toFixed(3));
          row.push((ponto.vertimento_hm3 ?? 0).toFixed(3));
          row.push((ponto.volume_final_hm3 ?? 0).toFixed(3));
          row.push((ponto.volume_inicial_hm3 ?? ponto.volume_hm3 ?? 0).toFixed(3));
          row.push(isAtendido(ponto, demandaCenario) ? "Sim" : "Nao");
          row.push(computeDeficit(ponto, demandaCenario).toFixed(3));
        } else {
          row.push("", "", "", "", "", "", "", "");
        }
      });
      rows.push(row);
    }

    downloadCSV(`comparacao_demanda_${selectedAcudeId}.csv`, headers, rows);
  };

  // --- FILTRO POR DATA ---
  const filtrarPorData = <T extends { data: string }>(pontos: T[]): T[] => {
    return pontos.filter(
      (p) => p.data >= filtroDataInicio && p.data <= filtroDataFim,
    );
  };

  const resultadoFiltrado = resultado
    ? { ...resultado, resultados: filtrarPorData(resultado.resultados) }
    : null;

  const resultadoMultiFiltrado = resultadoMulti
    ? {
        ...resultadoMulti,
        cenarios: resultadoMulti.cenarios.map((c) => ({
          ...c,
          resultados: filtrarPorData(c.resultados),
        })),
      }
    : null;

  // --- CÁLCULO DE FALHAS (MODO ÚNICO) ---
  const getMesesComFalha = () => {
    if (!resultadoFiltrado) return [];
    const demandaM3s = parseFloat(demanda);
    return resultadoFiltrado.resultados.filter((item) => {
      const data = parseDataLocal(item.data);
      const diasNoMes = getDaysInMonth(data);
      const demandaEsperadaHm3 = (demandaM3s * diasNoMes * 86400) / 1e6;
      return demandaEsperadaHm3 - item.retirada_hm3 > 0.01;
    });
  };
  const mesesFalha = getMesesComFalha();

  // --- DERIVAÇÕES ---
  const anoMin =
    anosDisponiveis.length > 0
      ? Math.min(...anosDisponiveis)
      : parseInt(filtroDataInicio.split("-")[0]);
  const anoMax =
    anosDisponiveis.length > 0
      ? Math.max(...anosDisponiveis)
      : parseInt(filtroDataFim.split("-")[0]);

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
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Droplets className="h-8 w-8 text-amber-700" />
            Simulador de Balanço Hídrico
          </h1>
          <p className="text-muted-foreground max-w-2xl">
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
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border-2 border-dashed">
              <Loader2 className="h-12 w-12 mb-4 animate-spin text-amber-500" />
              <p className="text-lg font-medium">
                {progresso || "Executando cenários..."}
              </p>
            </div>
          )}

          {/* Estado Inicial */}
          {!resultado && !resultadoMulti && !simulating && selectedAcudeId && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border-2 border-dashed">
              <Droplets className="h-12 w-12 mb-4 opacity-20" />
              <p>
                Configure os parâmetros à esquerda e clique em{" "}
                <strong>Gerar Simulação</strong>
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
