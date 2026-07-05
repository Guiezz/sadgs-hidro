// src/lib/types.ts

// --- TIPOS DE DADOS GERAIS ---

export interface Reservatorio {
  id: number;
  nome: string;
  municipio: string;

  bacia?: string;
  capacidade_hm3: number;
}

export interface IdentificationData {
  id: number;
  nome: string;
  municipio: string;
  descricao: string;
  lat: number;
  long: number;
  url_imagem: string;
  url_imagem_usos: string;
}

// --- TIPOS PARA O DASHBOARD ---

export interface DashboardSummary {
  volumeAtualHm3: number;
  volumePercentual: number;
  estadoAtualSeca: string;
  dataUltimaMedicao: string;
  diasDesdeUltimaMudanca: number;
  medidasRecomendadas: PlanoAcaoResumo[];
}

export interface PlanoAcaoResumo {
  acao: string;
  descricao: string;
  responsaveis: string;
}

export interface HistoryEntry {
  Data: string;
  "Estado de Seca": string;
  "Volume (hm3)": number;
}

export interface ChartDataPoint {
  Data: string;
  volume: number;
  meta1: number;
  meta2: number;
  meta3: number;
}

// --- TIPOS PARA A PÁGINA DE PLANOS DE AÇÃO ---

export interface ActionPlanFilterOptions {
  estados: string[];
  impactos: string[];
  problemas: string[];
  acoes: string[];
}

export interface PlanoAcao {
  id: number;
  reservatorio_id: number;
  situacao: string;
  acoes: string;
  descricao_acao: string;
  responsaveis: string;
  classes_acao: string;
  tipos_impactos: string;
  problemas: string;
  orgaos_envolvidos: string;
  indicadores: string;
  estado_seca: string;
}

// --- TIPOS PARA A PÁGINA DE BALANÇO HÍDRICO ---

export interface StaticWaterBalanceCharts {
  balancoMensal: BalancoMensal[];
  composicaoDemanda: ComposicaoDemanda[];
  ofertaDemanda: OfertaDemanda[];
}

export interface BalancoMensal {
  Mês: string;
  "Afluência (m³/s)": number;
  "Demanda (m³/s)": number;
  "Balanço (m³/s)": number;
  "Evaporação (m³/s)": number;
}

export interface ComposicaoDemanda {
  usos: string;
  demandas_hm3: number;
}

export interface OfertaDemanda {
  cenarios: string;
  "oferta_l/s": number;
  "demanda_l/s": number;
}

// --- TIPOS ADICIONAIS ---

export interface UsoAgua {
  id: number;
  reservatorio_id: number;
  uso: string;
  vazao_normal: number;
  vazao_escassez: number;
}

export interface Responsavel {
  id: number;
  nome: string; // Agora receberá o nome corretamente
  grupo: string;
  organizacao: string;
  setor: string; // Garantir que o campo existe para exibição
  cargo: string; // Agora receberá o cargo corretamente
}

// --- GATILHOS PGPS ---

export interface GatilhoPGPSMes {
  mes_num: number;
  normal_hm3: number;
  alerta_hm3: number;
  seca_hm3: number;
  seca_severa_hm3: number;
}

export interface GatilhosPGPSResponse {
  gatilhos: GatilhoPGPSMes[];
}

// --- SIMULAÇÃO ---
//
export interface SimAcude {
  codigo: number;
  nome: string;
  municipio: string;
  capacidade_m3: number;
}

export interface SimulacaoRequest {
  reservatorio_id: number;
  volume_inicial: number;
  data_inicio: string; // ISO Date string (YYYY-MM-DD)
  data_fim: string; // ISO Date string
  usar_media_historica: boolean;
  demandas_mensais: number[]; // Array com 1 ou 12 valores
}

// --- COMPARAÇÃO DE DEMANDAS ---

export interface CenarioDemanda {
  nome: string;
  percentual: number; // Ex: 100, 90, 85
}

export interface ResultadoCenario {
  nome: string;
  resultados: SimulacaoResultadoPonto[];
  frequencia_nao_atendida: number;
  volume_final: number;
  volume_inicial: number;
  menor_volume: number;
  meses_com_falha: number;
  primeira_falha: string | null; // "Mar/2012" ou null
  pontos_deficit: number[]; // índices dos meses com déficit
  ganho_fna: number | null; // % redução vs base
  ganho_volume: number | null; // % aumento vs base
  ganho_falhas: number | null; // % redução vs base
}

export interface EstatisticaDescritiva {
  min: number;
  max: number;
  media: number;
  mediana: number;
  p10: number;
  p90: number;
}

export interface DistribuicaoResultados {
  frequencia_nao_atendida: EstatisticaDescritiva;
  volume_final: EstatisticaDescritiva;
}

export interface SimulacaoMultiResponse {
  cenarios: ResultadoCenario[];
  distribuicao: DistribuicaoResultados;
}

export interface SimulacaoAnosResponse {
  anos: number[];
}

export interface SimulacaoResultadoPonto {
  data: string;
  volume_inicial_hm3: number; // Nome atualizado (era volume_hm3)
  volume_final_hm3: number; // Novo campo
  afluencia_hm3: number;
  retirada_hm3: number;
  evaporacao_hm3: number;
  vertimento_hm3: number;
  volume_hm3: number;
  alerta?: string;
}

export interface SimulacaoResponse {
  resultados: SimulacaoResultadoPonto[];
  frequencia_nao_atendida: number;
  volume_final: number;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface UsuarioInfo {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  usuario: UsuarioInfo;
}
