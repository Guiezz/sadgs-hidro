"use client";

import { useState, useEffect, useCallback } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";

import { DashboardSummary, HistoryEntry, ChartDataPoint } from "@/lib/types";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { DroughtGauge, GaugeThresholds } from "@/components/dashboard/DroughtGauge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, CalendarDays, ShieldCheck, Droplets, Gauge } from "lucide-react";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";

// Função auxiliar para converter strings de data (ex: "dd/mm/yyyy") em objetos Date
function parseDate(dateStr: string): Date {
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

export default function EstadoDeSecaPage() {
  const { selectedReservoir, isLoading: isReservoirLoading } = useReservoir();

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [chart, setChart] = useState<ChartDataPoint[]>([]);

  // Estados para armazenar o cálculo de tempo no estado
  const [daysInState, setDaysInState] = useState<number>(0);
  const [sinceDate, setSinceDate] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (!selectedReservoir) return;

    setIsLoadingPage(true);
    setError(null);
    const id = selectedReservoir.id;

    try {
      const [summaryRes, historyRes, chartRes, ongoingRes, completedRes] =
        await Promise.all([
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/dashboard/summary`, {
            cache: "no-store",
          }),
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/history`, {
            cache: "no-store",
          }),
          fetch(
            `${config.apiBaseUrl}/reservatorios/${id}/dashboard/volume-chart`,
            { cache: "no-store" },
          ),
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/ongoing-actions`, {
            cache: "no-store",
          }),
          fetch(`${config.apiBaseUrl}/reservatorios/${id}/completed-actions`, {
            cache: "no-store",
          }),
        ]);

      if (
        !summaryRes.ok ||
        !historyRes.ok ||
        !chartRes.ok ||
        !ongoingRes.ok ||
        !completedRes.ok
      ) {
        throw new Error("Falha ao buscar os dados do reservatório.");
      }

      const summaryData = await summaryRes.json();
      const historyData = await historyRes.json();
      const chartData = await chartRes.json();

      setSummary(summaryData);
      setHistory(historyData);
      setChart(chartData);

      // --- LÓGICA DE CÁLCULO DO TEMPO NO ESTADO ---
      if (historyData && historyData.length > 0) {
        const sortedHistory = [...historyData];
        const currentEntry = sortedHistory[sortedHistory.length - 1];
        const currentState = currentEntry["Estado de Seca"];

        let startDate = currentEntry.Data;

        for (let i = sortedHistory.length - 1; i >= 0; i--) {
          if (sortedHistory[i]["Estado de Seca"] !== currentState) {
            break;
          }
          startDate = sortedHistory[i].Data;
        }

        const start = parseDate(startDate);
        const today = new Date();
        start.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        setDaysInState(diffDays);
        setSinceDate(startDate);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro desconhecido.",
      );
    } finally {
      setIsLoadingPage(false);
    }
  }, [selectedReservoir]);

  useEffect(() => {
    if (!selectedReservoir) {
      setIsLoadingPage(false);
      return;
    }
    fetchData();
  }, [selectedReservoir, fetchData]);

  // 1. ESTADO: NADA SELECIONADO
  if (!selectedReservoir) {
    return (
      <EmptyReservoirState
        title="Monitoramento de Seca Indisponível"
        description="Selecione um hidrossistema no topo da página para visualizar os indicadores de volume, as metas e o histórico de estados de seca."
      />
    );
  }

  // 2. ESTADO: CARREGANDO
  if (isLoadingPage) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            Carregando dados do monitoramento...
          </p>
        </div>
      </main>
    );
  }

  // 3. ESTADO: ERRO
  if (error || !summary) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="text-center p-6 bg-card border rounded-xl shadow-sm">
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            Erro ao carregar os dados.
          </h1>
          <p className="text-muted-foreground">
            {error || "Verifique se a API está em execução e tente novamente."}
          </p>
        </div>
      </main>
    );
  }

  let gaugeThresholds: GaugeThresholds | undefined = undefined;
  const capacidadeTotal = selectedReservoir?.capacidade_hm3;

  if (chart.length > 0 && capacidadeTotal && capacidadeTotal > 0) {
    const lastPoint = chart[chart.length - 1];
    gaugeThresholds = {
      meta1: lastPoint.meta1,
      meta2: lastPoint.meta2,
      meta3: lastPoint.meta3,
    };
  }

  const recentHistory = history.slice(-8).reverse();
  const diasNoEstado = daysInState ?? summary.diasDesdeUltimaMudanca ?? 0;
  const medidas = summary.medidasRecomendadas?.length ?? 0;

  // 4. ESTADO: SUCESSO
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 lg:gap-10 lg:p-6 bg-background overflow-x-hidden">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Monitoramento do Estado de Seca
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          {selectedReservoir.nome}
        </h1>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
            <Droplets className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Volume Atual</p>
            <p className="text-xl lg:text-2xl font-bold tracking-tight truncate">
              {summary.volumeAtualHm3}
              <span className="text-sm font-medium text-muted-foreground ml-1">
                hm³
              </span>
            </p>
            {capacidadeTotal && capacidadeTotal > 0 && (
              <p className="text-xs text-muted-foreground/70">
                Capacidade: {capacidadeTotal.toFixed(2)} hm³
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
            <Gauge className="h-5 w-5 text-primary" />
          </div>
          {gaugeThresholds ? (
            <DroughtGauge
              percentage={summary.volumePercentual}
              currentState={summary.estadoAtualSeca}
              thresholds={gaugeThresholds}
              width={140}
              height={80}
            />
          ) : (
            <div className="text-center">
              <p className="text-xl font-bold">
                {summary.volumePercentual.toFixed(1)}%
              </p>
              <p className="text-xs font-semibold uppercase text-green-600">
                {summary.estadoAtualSeca}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Desde</p>
            <p className="text-xl lg:text-2xl font-bold tracking-tight">
              {sinceDate || "—"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {diasNoEstado} dias
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Medidas ativas</p>
            <p className="text-xl lg:text-2xl font-bold tracking-tight">
              {medidas}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {medidas === 1 ? "medida" : "medidas"}
            </p>
          </div>
        </div>
      </div>

      {/* Chart full width */}
      <div className="min-w-0 overflow-hidden">
        <VolumeChart
          data={chart}
          reservatorioId={selectedReservoir.id}
          capacidadeMaxima={capacidadeTotal}
          onRefresh={fetchData}
        />
      </div>

      {/* Histórico full width */}
      <section className="space-y-3 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Histórico Recente</h2>
          <span className="text-xs text-muted-foreground">
            — últimos 8 registros
          </span>
        </div>
        <div className="border border-border/40 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Volume (hm³)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentHistory.map((entry, index) => (
                <TableRow key={`${entry.Data}-${index}`}>
                  <TableCell>{entry.Data}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry["Estado de Seca"]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {entry["Volume (hm3)"]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}
