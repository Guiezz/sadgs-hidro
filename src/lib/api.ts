import {
  Reservatorio,
  IdentificationData,
  DashboardSummary,
  ChartDataPoint,
  HistoryEntry,
  PlanoAcao,
  ActionPlanFilterOptions,
  StaticWaterBalanceCharts,
  UsoAgua,
  Responsavel,
  SimAcude,
  SimulacaoRequest,
  SimulacaoResponse,
  SimulacaoAnosResponse,
  LoginCredentials,
  AuthResponse,
  BackfillResponse,
} from "./types";
import { config } from "@/config";

const API_BASE_URL = config.apiBaseUrl;

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Correção do erro de tipo: Definindo headers como um objeto que aceita chaves do tipo string
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cogerh_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let errorMessage = `Erro na API: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch (e) {
      // Ignora erro de parse
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // --- AUTENTICAÇÃO E EDIÇÃO ---
  login: (credentials: LoginCredentials) =>
    fetchAPI<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  updateActionStatus: (
    reservatorioId: number,
    acaoId: number,
    situacao: string,
  ) =>
    fetchAPI<{ message: string }>(
      `/reservatorios/${reservatorioId}/action-plans/${acaoId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ situacao }),
      },
    ),

  // --- RESERVATÓRIOS (Geral) ---
  getReservatorios: () => fetchAPI<Reservatorio[]>("/reservatorios"),

  // --- IDENTIFICAÇÃO ---
  getIdentification: (id: number) =>
    fetchAPI<IdentificationData>(`/reservatorios/${id}/identification`),

  // --- DASHBOARD (Resumo e Gráficos) ---
  getDashboardSummary: (id: number) =>
    fetchAPI<DashboardSummary>(`/reservatorios/${id}/dashboard/summary`),

  getVolumeChartData: (id: number) =>
    fetchAPI<ChartDataPoint[]>(`/reservatorios/${id}/dashboard/volume-chart`),

  getHistory: (id: number) =>
    fetchAPI<HistoryEntry[]>(`/reservatorios/${id}/history`),

  // --- PLANOS DE AÇÃO ---
  getNotStartedActions: (id: number, estado?: string) =>
    fetchAPI<PlanoAcao[]>(
      `/reservatorios/${id}/not-started-actions${estado ? `?estado=${encodeURIComponent(estado)}` : ""}`,
    ),

  getOngoingActions: (id: number, estado?: string) =>
    fetchAPI<PlanoAcao[]>(
      `/reservatorios/${id}/ongoing-actions${estado ? `?estado=${encodeURIComponent(estado)}` : ""}`,
    ),

  getCompletedActions: (id: number, estado?: string) =>
    fetchAPI<PlanoAcao[]>(
      `/reservatorios/${id}/completed-actions${estado ? `?estado=${encodeURIComponent(estado)}` : ""}`,
    ),

  getActionPlans: (
    id: number,
    filters?: {
      estado?: string;
      impacto?: string;
      problema?: string;
      acao?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.impacto) params.append("impacto", filters.impacto);
    if (filters?.problema) params.append("problema", filters.problema);
    if (filters?.acao) params.append("acao", filters.acao);

    return fetchAPI<PlanoAcao[]>(
      `/reservatorios/${id}/action-plans?${params.toString()}`,
    );
  },

  getActionPlanFilters: (id: number) =>
    fetchAPI<ActionPlanFilterOptions>(
      `/reservatorios/${id}/action-plans/filters`,
    ),

  // --- BALANÇO HÍDRICO ---
  getWaterBalance: (id: number) =>
    fetchAPI<StaticWaterBalanceCharts>(`/reservatorios/${id}/water-balance`),

  // --- CADASTROS AUXILIARES ---
  getUsosAgua: (id: number) =>
    fetchAPI<UsoAgua[]>(`/reservatorios/${id}/water-uses`),

  getResponsaveis: (id: number) =>
    fetchAPI<Responsavel[]>(`/reservatorios/${id}/responsibles`),

  // --- SIMULAÇÃO ---
  getSimulacaoAcudes: () => fetchAPI<SimAcude[]>("/simulacao/acudes"),

  getSimulacaoAnos: (reservatorioId: number) =>
    fetchAPI<SimulacaoAnosResponse>(
      `/simulacao/anos?reservatorio_id=${reservatorioId}`,
    ),

  runSimulacao: (params: SimulacaoRequest) =>
    fetchAPI<SimulacaoResponse>("/simulacao/run", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // --- GATILHOS PGPS ---
  getGatilhosPGPS: (reservatorioId: number) =>
    fetchAPI<import("./types").GatilhosPGPSResponse>(
      `/reservatorios/${reservatorioId}/gatilhos-pgps`,
    ),

  // --- BACKFILL FUNCEME (Admin) ---
  runFuncemeBackfill: (reservatorioId: number, dataInicio: string) =>
    fetchAPI<BackfillResponse>(
      `/reservatorios/${reservatorioId}/funceme-backfill`,
      {
        method: "POST",
        body: JSON.stringify({ data_inicio: dataInicio }),
      },
    ),

};
