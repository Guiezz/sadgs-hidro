"use client";

// Estado e regras do simulador (extraído de app/simulacao/page.tsx sem mudar o comportamento).
import { useEffect, useState } from "react";
import { format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";
import {
  CenarioDemanda,
  DistribuicaoResultados,
  EstatisticaDescritiva,
  GatilhoPGPSMes,
  ResultadoCenario,
  SimAcude,
  SimulacaoMultiResponse,
  SimulacaoResponse,
} from "@/lib/types";
import { useReservoir } from "@/context/ReservoirContext";
import { parseDataLocal } from "./helpers";

export function useSimulacao() {
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

  return {
    selectedReservoir,
    acudes,
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
    anosDisponiveis,
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
  };
}

export type UseSimulacao = ReturnType<typeof useSimulacao>;
