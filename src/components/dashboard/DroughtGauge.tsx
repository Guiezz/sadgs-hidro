"use client";

import React from "react";

export interface GaugeThresholds {
  meta1: number;
  meta2: number;
  meta3: number;
}

interface DroughtGaugeProps {
  percentage: number;
  currentState: string;
  thresholds?: GaugeThresholds;
  width?: number;
  height?: number;
}

// --- Funções Auxiliares SVG (Mantidas iguais) ---
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  if (startAngle >= endAngle) return "";

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}
// ------------------------------

export function DroughtGauge({
  percentage,
  currentState,
  thresholds,
  width = 240,
  height = 140,
}: DroughtGaugeProps) {
  const value = Math.min(Math.max(percentage, 0), 100);
  const compact = width < 200;

  // Configurações Visuais
  const radius = 80;
  const strokeWidth = 25;
  const cx = 100;
  const cy = 100;
  const startAngle = 180; // 9 horas
  const totalAngle = 180; // Semicírculo

  // 1. Definição das Metas (CORREÇÃO DE ORDENAÇÃO)
  // Coletamos os valores brutos
  const rawThresholds = [
    thresholds?.meta1 ?? 0,
    thresholds?.meta2 ?? 0,
    thresholds?.meta3 ?? 0,
  ];

  // Ordenamos do MENOR para o MAIOR.
  // [0] = Menor valor (Limite do Vermelho)
  // [1] = Valor médio (Limite do Laranja)
  // [2] = Maior valor (Limite do Amarelo)
  const sortedValues = rawThresholds.sort((a, b) => a - b);

  let m1 = sortedValues[0] * 100; // Limite Crítico
  let m2 = sortedValues[1] * 100; // Limite Seca
  let m3 = sortedValues[2] * 100; // Limite Alerta

  // Fallback de segurança: se o maior valor for quase zero, aplica padrão
  if (m3 <= 0.1) {
    m1 = 20;
    m2 = 40;
    m3 = 60;
  }

  // A ordenação acima já garante m1 <= m2 <= m3, mas mantemos o Max por segurança
  m1 = Math.max(0, m1);
  m2 = Math.max(m1, m2);
  m3 = Math.max(m2, m3);

  // 2. Cálculo dos Ângulos Finais de cada faixa
  const angleRed = startAngle + (m1 / 100) * totalAngle;
  const angleOrange = startAngle + (m2 / 100) * totalAngle;
  const angleYellow = startAngle + (m3 / 100) * totalAngle;
  const angleGreen = startAngle + totalAngle; // Vai até o fim (100%)

  // Rotação da Agulha
  const needleAngle = startAngle + (value / 100) * totalAngle;

  // Cor do Texto
  const normalizedState = currentState ? currentState.toLowerCase() : "";
  let stateColor = "#64748b";
  if (
    normalizedState.includes("normal") ||
    normalizedState.includes("conforto")
  )
    stateColor = "#15803d";
  else if (normalizedState.includes("alerta")) stateColor = "#a16207";
  else if (
    normalizedState.includes("seca") &&
    !normalizedState.includes("severa")
  )
    stateColor = "#c2410c";
  else if (
    normalizedState.includes("severa") ||
    normalizedState.includes("crítico")
  )
    stateColor = "#b91c1c";

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        width={width}
        height={height}
        viewBox="0 20 200 120"
        className="overflow-visible"
      >
        {/* ESTRATÉGIA DE EMPILHAMENTO (LAYERING) */}
        {/* Desenhamos do MAIOR para o MENOR para que o menor fique "por cima" */}

        {/* 1. Base: Verde (Conforto) - Do fim do Amarelo até 100% */}
        <path
          d={describeArc(cx, cy, radius, angleYellow, angleGreen)}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
        />

        {/* 2. Amarelo (Alerta) - Do fim do Laranja até o fim do Amarelo */}
        <path
          d={describeArc(cx, cy, radius, angleOrange, angleYellow)}
          fill="none"
          stroke="#eab308"
          strokeWidth={strokeWidth}
        />

        {/* 3. Laranja (Seca) - Do fim do Vermelho até o fim do Laranja */}
        <path
          d={describeArc(cx, cy, radius, angleRed, angleOrange)}
          fill="none"
          stroke="#f97316"
          strokeWidth={strokeWidth}
        />

        {/* 4. Vermelho (Crítico) - Do zero até o fim do Vermelho */}
        <path
          d={describeArc(cx, cy, radius, startAngle, angleRed)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
        />

        {/* Agulha */}
        <g
          transform={`rotate(${needleAngle} ${cx} ${cy})`}
          style={{ transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          {/* Linha da agulha */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + radius - 5}
            y2={cy}
            stroke="#334155"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Círculo da base */}
          <circle cx={cx} cy={cy} r="6" fill="#334155" />
        </g>

        {/* Marcadores 0% e 100% */}
        <text x="10" y="110" className="text-[10px] fill-slate-400 font-bold">
          0%
        </text>
        <text x="170" y="110" className="text-[10px] fill-slate-400 font-bold">
          100%
        </text>
      </svg>

      <div className={`flex flex-col items-center text-center z-10 ${compact ? "mt-[-16px]" : "mt-[-20px]"}`}>
        <span className={`font-black text-slate-800 dark:text-slate-100 ${compact ? "text-lg" : "text-3xl"}`}>
          {value.toFixed(1)}%
        </span>
        <span
          className={`font-semibold uppercase ${compact ? "text-[10px]" : "text-sm"}`}
          style={{ color: stateColor }}
        >
          {currentState}
        </span>
      </div>
    </div>
  );
}
