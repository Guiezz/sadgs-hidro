"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { GatilhoPGPSMes, UsoAgua } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Waves,
  RotateCcw,
  Activity,
  Play,
  Pause,
  ArrowUpCircle,
  ArrowDownCircle,
  Sparkles,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DroughtClock } from "./DroughtClock";

// Carregamento dinâmico para evitar problemas de SSR com o Canvas do WebGL
const ReservoirScene = dynamic(() => import("./ReservoirScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] md:min-h-[540px] flex flex-col items-center justify-center bg-[#dcecf1] text-muted-foreground rounded-2xl border border-primary/20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3" />
      <p className="text-sm font-medium text-slate-600">Carregando modelo tridimensional...</p>
    </div>
  ),
});

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Mapeamento oficial de cores e descrições dos estados de seca
const ESTADO_CONFIG = {
  Normal: {
    label: "Normal",
    colorHex: "#2ea7df", // Azul límpido clássico
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
    dotClass: "bg-[#2ea7df]",
    description: "Volume confortável acima do gatilho VM1. Operação e alocação plenas.",
  },
  Alerta: {
    label: "Alerta",
    colorHex: "#f6d74b", // Amarelo
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
    dotClass: "bg-[#f6d74b]",
    description: "Volume entre Meta 1 (VM1) e Meta 2 (VM2). Adoção de medidas preventivas de monitoramento.",
  },
  Seca: {
    label: "Seca",
    colorHex: "#f3a13b", // Laranja
    badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
    dotClass: "bg-[#f3a13b]",
    description: "Volume entre Meta 2 (VM2) e Meta 3 (VM3). Restrições e contingenciamento de vazões.",
  },
  "Seca Severa": {
    label: "Seca Severa",
    colorHex: "#e85b4f", // Vermelho
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    dotClass: "bg-[#e85b4f]",
    description: "Volume abaixo da Meta 3 (VM3). Suspensão de usos não prioritários.",
  },
};

interface Reservoir3DViewerProps {
  reservoirName: string;
  capacityHm3: number;
  realVolumePercent: number;
  dataUltimaMedicao?: string;
  gatilhos: GatilhoPGPSMes[];
  waterUses: UsoAgua[];
}

export default function Reservoir3DViewer({
  reservoirName,
  capacityHm3,
  realVolumePercent,
  dataUltimaMedicao = "",
  gatilhos,
  waterUses,
}: Reservoir3DViewerProps) {
  // Inferir o mês da última medição (0 a 11)
  const defaultMonthIndex = useMemo(() => {
    if (dataUltimaMedicao) {
      const parts = dataUltimaMedicao.split("/");
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        if (m >= 1 && m <= 12) return m - 1;
      }
    }
    return new Date().getMonth();
  }, [dataUltimaMedicao]);

  const [modo, setModo] = useState<"real" | "simulacao">("real");
  const [volumePercent, setVolumePercent] = useState<number>(realVolumePercent || 50);
  const [monthIndex, setMonthIndex] = useState<number>(defaultMonthIndex);

  // Estados para simulação automática (Encher / Esvaziar)
  const [simulationDirection, setSimulationDirection] = useState<"fill" | "drain">("fill");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Sincroniza dados caso o reservatório mude
  useEffect(() => {
    if (modo === "real") {
      setVolumePercent(realVolumePercent);
      setMonthIndex(defaultMonthIndex);
      setIsPlaying(false);
    }
  }, [modo, realVolumePercent, defaultMonthIndex]);

  // Animação automática de enchimento e esvaziamento (a cada 80ms)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setVolumePercent((prev) => {
        const next = simulationDirection === "fill" ? Math.min(100, prev + 1) : Math.max(0, prev - 1);
        if (next === 0 || next === 100) {
          setIsPlaying(false);
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying, simulationDirection]);

  // Metas do mês selecionado (1 a 12)
  const gatilhoMes = useMemo(() => {
    if (!gatilhos || gatilhos.length === 0) return null;
    const mesNum = monthIndex + 1;
    return gatilhos.find((g) => g.mes_num === mesNum) || gatilhos[0];
  }, [gatilhos, monthIndex]);

  // Extração ordenada dos gatilhos em hm³ e percentual
  const thresholds = useMemo(() => {
    if (!gatilhoMes || capacityHm3 <= 0) {
      const p1 = 35;
      const p2 = 25;
      const p3 = 15;
      return {
        vm1Hm3: (p1 / 100) * capacityHm3,
        vm2Hm3: (p2 / 100) * capacityHm3,
        vm3Hm3: (p3 / 100) * capacityHm3,
        vm1Percent: p1,
        vm2Percent: p2,
        vm3Percent: p3,
      };
    }

    const raw = [
      gatilhoMes.seca_severa_hm3,
      gatilhoMes.seca_hm3,
      gatilhoMes.alerta_hm3,
    ].filter((v) => typeof v === "number" && !isNaN(v) && v > 0);

    const sorted = [...raw].sort((a, b) => b - a);

    const vm1Hm3 = sorted[0] ?? 0.35 * capacityHm3;
    const vm2Hm3 = sorted[1] ?? 0.25 * capacityHm3;
    const vm3Hm3 = sorted[2] ?? 0.15 * capacityHm3;

    return {
      vm1Hm3,
      vm2Hm3,
      vm3Hm3,
      vm1Percent: Math.min(100, (vm1Hm3 / capacityHm3) * 100),
      vm2Percent: Math.min(100, (vm2Hm3 / capacityHm3) * 100),
      vm3Percent: Math.min(100, (vm3Hm3 / capacityHm3) * 100),
    };
  }, [gatilhoMes, capacityHm3]);

  // Volume atual em hm³
  const volumeHm3 = (volumePercent / 100) * capacityHm3;

  // Classificação do estado de seca
  const estadoAtualKey = useMemo((): keyof typeof ESTADO_CONFIG => {
    if (volumeHm3 >= thresholds.vm1Hm3 - 0.001) return "Normal";
    if (volumeHm3 >= thresholds.vm2Hm3 - 0.001) return "Alerta";
    if (volumeHm3 >= thresholds.vm3Hm3 - 0.001) return "Seca";
    return "Seca Severa";
  }, [volumeHm3, thresholds]);

  const estadoConfig = ESTADO_CONFIG[estadoAtualKey];

  // A descarga de fundo fica ativa a menos que esteja em Seca Severa
  const isReleasing = estadoAtualKey !== "Seca Severa";

  // Vazão autorizada total
  const totalVazao = useMemo(() => {
    const isEscassez = estadoAtualKey !== "Normal";
    return waterUses.reduce((acc, u) => acc + (isEscassez ? u.vazao_escassez : u.vazao_normal), 0);
  }, [waterUses, estadoAtualKey]);

  const limitReached =
    simulationDirection === "fill" ? volumePercent >= 100 : volumePercent <= 0;

  const handleSelectDirection = (dir: "fill" | "drain") => {
    setModo("simulacao");
    setSimulationDirection(dir);
    setIsPlaying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna Principal: Visualizador 3D + Dinâmica Hidráulica */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        <div className="relative aspect-[4/3] md:aspect-video lg:h-[540px] rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-[#dcecf1]">
          {/* Rótulo superior do céu */}
          <div className="absolute top-3 right-4 bg-slate-900/60 backdrop-blur-sm text-white/90 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider select-none pointer-events-none z-10 border border-white/10">
            Modelo Conceitual • Volume Não Batimétrico
          </div>

          <ReservoirScene
            level={volumePercent}
            color={estadoConfig.colorHex}
            releasing={isReleasing}
            droughtState={estadoAtualKey}
          />

          {/* HUD Top Left - Volume e Status */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1 select-none pointer-events-none min-w-[200px] z-10">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Volume Armazenado
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${estadoConfig.colorHex}22`,
                  color: estadoConfig.colorHex,
                }}
              >
                {MONTHS_SHORT[monthIndex]}
              </span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: estadoConfig.colorHex }}>
              {volumePercent.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {volumeHm3.toFixed(2)} hm³ de {capacityHm3.toFixed(2)} hm³
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Estado da Seca:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: estadoConfig.colorHex }} />
                <span className="text-xs font-bold" style={{ color: estadoConfig.colorHex }}>
                  {estadoConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Dica de Interação no rodapé da cena */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-sm text-white text-[11px] font-medium px-4 py-1.5 rounded-full border border-white/10 select-none pointer-events-none shadow-sm z-10">
            Arraste para girar · Scroll para zoom
          </div>
        </div>

        {/* Card de Zonas e Dinâmica Hidráulica */}
        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-foreground flex items-center gap-2 text-sm">
              <Waves className="h-4 w-4 text-primary" />
              Zonas do Reservatório & Dinâmica Hidráulica
            </div>
            <span className="text-xs text-muted-foreground">
              Em <strong className="text-foreground">{MONTHS_FULL[monthIndex]}</strong>, {volumePercent.toFixed(1)}% está{" "}
              <strong className="text-primary">
                {volumeHm3 >= thresholds.vm1Hm3
                  ? "acima de VM1 (Normal)"
                  : volumeHm3 >= thresholds.vm2Hm3
                  ? "entre VM1 e VM2 (Alerta)"
                  : volumeHm3 >= thresholds.vm3Hm3
                  ? "entre VM2 e VM3 (Seca)"
                  : "abaixo de VM3 (Seca Severa)"}
              </strong>
            </span>
          </div>

          {/* Grid de Zonas do Relógio */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {(Object.keys(ESTADO_CONFIG) as Array<keyof typeof ESTADO_CONFIG>).map((key) => {
              const cfg = ESTADO_CONFIG[key];
              const isSelected = key === estadoAtualKey;
              return (
                <div
                  key={key}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? "ring-2 shadow-xs"
                      : "bg-muted/30 border-border/40 opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${cfg.colorHex}18` : undefined,
                    borderColor: isSelected ? cfg.colorHex : undefined,
                  }}
                >
                  <span
                    className="w-2.5 h-7 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.colorHex }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate" style={{ color: cfg.colorHex }}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {key === "Normal" && `> ${thresholds.vm1Percent.toFixed(0)}%`}
                      {key === "Alerta" && `${thresholds.vm2Percent.toFixed(0)}% - ${thresholds.vm1Percent.toFixed(0)}%`}
                      {key === "Seca" && `${thresholds.vm3Percent.toFixed(0)}% - ${thresholds.vm2Percent.toFixed(0)}%`}
                      {key === "Seca Severa" && `< ${thresholds.vm3Percent.toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-border/40 text-xs text-muted-foreground">
            <div className="p-2.5 bg-muted/40 rounded-lg border border-border/40 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Nível & Cor da Água
              </span>
              <p className="text-[11px] leading-relaxed">
                A lâmina d'água sobe e preenche a bacia conforme o volume. A cor é <strong>azul</strong> acima de VM1 (Normal), mudando para <strong>amarelo</strong> (Alerta), <strong>laranja</strong> (Seca) e <strong>vermelho</strong> (Seca Severa).
              </p>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-lg border border-border/40 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Vegetação & Caatinga
              </span>
              <p className="text-[11px] leading-relaxed">
                O bioma reage à seca: <strong>verdejante</strong> no estado Normal, <strong>oliva/amarelado</strong> em Alerta, <strong>ocre/palha</strong> na Seca e <strong>caatinga cinzenta</strong> na Seca Severa.
              </p>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-lg border border-border/40 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Descarga de Fundo
              </span>
              <p className="text-[11px] leading-relaxed">
                Válvula de saída na base da barragem com rio a jusante, suspenso automaticamente quando atinge o estado de <strong>Seca Severa</strong>.
              </p>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-lg border border-border/40 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Vertedouro (Soleira)
              </span>
              <p className="text-[11px] leading-relaxed">
                Canal na ombreira da barragem. Quando o volume atinge <strong>&ge; 99%</strong>, o excesso é descarregado automaticamente pelo canal de sangria.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Lateral: Relógio da Seca + Painel de Simulação */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        {/* Card do Relógio da Seca (Drought Clock) */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-b from-muted/50 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Abastecimento & PGPS
                </p>
                <CardTitle className="text-base font-bold text-foreground">
                  Relógio da Seca
                </CardTitle>
              </div>
              <Badge
                className="font-bold text-xs"
                style={{
                  backgroundColor: `${estadoConfig.colorHex}22`,
                  color: estadoConfig.colorHex,
                  borderColor: `${estadoConfig.colorHex}44`,
                }}
              >
                {estadoConfig.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <DroughtClock
              volume={volumePercent}
              vm1={thresholds.vm1Percent}
              vm2={thresholds.vm2Percent}
              vm3={thresholds.vm3Percent}
              stateLabel={estadoConfig.label}
              stateColor={estadoConfig.colorHex}
              monthName={MONTHS_SHORT[monthIndex]}
              vm1Hm3={thresholds.vm1Hm3}
              vm2Hm3={thresholds.vm2Hm3}
              vm3Hm3={thresholds.vm3Hm3}
            />
          </CardContent>
        </Card>

        {/* Card de Controle da Simulação */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold">Controle da Simulação</CardTitle>
              </div>
              {modo === "simulacao" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVolumePercent(realVolumePercent);
                    setMonthIndex(defaultMonthIndex);
                    setIsPlaying(false);
                  }}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-primary gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Redefinir
                </Button>
              )}
            </div>
            <CardDescription className="text-xs">
              Alterne entre a medição oficial e simulações com animação automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de Modo: Real vs Simulação */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Modo de Operação</Label>
              <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setModo("real");
                    setIsPlaying(false);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    modo === "real"
                      ? "bg-background text-primary shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Medição Real
                </button>
                <button
                  type="button"
                  onClick={() => setModo("simulacao")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    modo === "simulacao"
                      ? "bg-background text-primary shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Simulação
                </button>
              </div>
            </div>

            {/* Slider de Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Volume Armazenado
                </Label>
                <span className="text-sm font-bold text-primary">
                  {volumePercent.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                disabled={modo === "real"}
                value={volumePercent}
                onChange={(e) => {
                  setIsPlaying(false);
                  setVolumePercent(parseFloat(e.target.value));
                }}
                className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                <span>0% (Vazio)</span>
                <span>50%</span>
                <span>100% (Cheio)</span>
              </div>
            </div>

            {/* Controles de Animação Automática (Encher / Esvaziar + Play) */}
            <div className="p-3 bg-muted/50 rounded-xl border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                  Animação Contínua
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">80ms / passo</span>
              </div>

              {/* Botões Encher vs Esvaziar */}
              <div className="grid grid-cols-2 gap-2 bg-background p-1 rounded-lg border border-border/50">
                <button
                  type="button"
                  onClick={() => handleSelectDirection("fill")}
                  className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    simulationDirection === "fill"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  Encher
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDirection("drain")}
                  className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    simulationDirection === "drain"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                  Esvaziar
                </button>
              </div>

              {/* Botão Play / Pausar com estilo Funceme */}
              <button
                type="button"
                disabled={limitReached && !isPlaying}
                onClick={() => {
                  setModo("simulacao");
                  setIsPlaying((prev) => !prev);
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-white transition-all shadow-sm ${
                  limitReached && !isPlaying
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.99] shadow-orange-500/20"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-white ml-0.5" />}
                </span>
                {isPlaying ? "Pausar Simulação" : "Iniciar Simulação"}
              </button>

              {/* Status da Simulação */}
              <p className="text-[10px] text-center text-muted-foreground min-h-[14px]">
                {isPlaying
                  ? `${simulationDirection === "fill" ? "Enchendo" : "Esvaziando"} automaticamente...`
                  : limitReached
                  ? "Limite da simulação atingido."
                  : "Escolha o sentido e pressione Iniciar Simulação."}
              </p>
            </div>

            {/* Slider do Mês de Referência */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Mês de Referência
                </Label>
                <span className="text-sm font-bold text-foreground">
                  {MONTHS_FULL[monthIndex]}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="11"
                step="1"
                disabled={modo === "real"}
                value={monthIndex}
                onChange={(e) => {
                  setMonthIndex(parseInt(e.target.value, 10));
                }}
                className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dez</span>
              </div>
            </div>

            {/* Metas PGPS do Mês Selecionado */}
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-2.5">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="font-bold">Gatilhos PGPS ({MONTHS_SHORT[monthIndex]})</span>
                <span className="text-[10px] text-muted-foreground font-medium">hm³ (metas)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-background rounded-lg border border-sky-200 shadow-xs">
                  <span className="text-[10px] font-bold text-sky-600 block">VM1 (Normal)</span>
                  <strong className="text-xs font-extrabold text-foreground block mt-0.5">
                    {thresholds.vm1Hm3.toFixed(2)} hm³
                  </strong>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {thresholds.vm1Percent.toFixed(1)}%
                  </span>
                </div>
                <div className="p-2 bg-background rounded-lg border border-yellow-200 shadow-xs">
                  <span className="text-[10px] font-bold text-yellow-600 block">VM2 (Alerta)</span>
                  <strong className="text-xs font-extrabold text-foreground block mt-0.5">
                    {thresholds.vm2Hm3.toFixed(2)} hm³
                  </strong>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {thresholds.vm2Percent.toFixed(1)}%
                  </span>
                </div>
                <div className="p-2 bg-background rounded-lg border border-orange-200 shadow-xs">
                  <span className="text-[10px] font-bold text-orange-600 block">VM3 (Seca)</span>
                  <strong className="text-xs font-extrabold text-foreground block mt-0.5">
                    {thresholds.vm3Hm3.toFixed(2)} hm³
                  </strong>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {thresholds.vm3Percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Resumo do Enquadramento e Vazão */}
            <div
              className="p-3.5 rounded-xl border space-y-1.5 transition-all"
              style={{
                backgroundColor: `${estadoConfig.colorHex}12`,
                borderColor: `${estadoConfig.colorHex}44`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Enquadramento
                </span>
                <Badge
                  className="font-bold text-xs"
                  style={{
                    backgroundColor: estadoConfig.colorHex,
                    color: "#ffffff",
                  }}
                >
                  {estadoConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {estadoConfig.description}
              </p>
              {totalVazao > 0 && (
                <div className="pt-1.5 mt-1 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Vazão de Referência:</span>
                  <strong className="text-foreground">{totalVazao.toFixed(1)} L/s</strong>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
