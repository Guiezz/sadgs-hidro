"use client";

import React from "react";
import "./drought-clock.css";

interface DroughtClockProps {
  volume: number;
  vm1: number;
  vm2: number;
  vm3: number;
  stateLabel: string;
  stateColor: string;
  monthName: string;
  vm1Hm3?: number;
  vm2Hm3?: number;
  vm3Hm3?: number;
}

export function DroughtClock({
  volume,
  vm1,
  vm2,
  vm3,
  stateLabel,
  stateColor,
  monthName,
  vm1Hm3,
  vm2Hm3,
  vm3Hm3,
}: DroughtClockProps) {
  const safeVm1 = Math.max(0, Math.min(100, vm1));
  const safeVm2 = Math.max(0, Math.min(safeVm1, vm2));
  const safeVm3 = Math.max(0, Math.min(safeVm2, vm3));
  const safeVolume = Math.max(0, Math.min(100, volume));

  const thresholds = [safeVm1, safeVm2, safeVm3];

  // Mesma orientação do medidor do Monitoramento: 0% à esquerda, 100% à direita.
  // O arco cônico vai da esquerda (270deg) até a direita passando pelo topo.
  const clockStyle = {
    "--severa-end": `${safeVm3 / 2}%`,
    "--dry-end": `${safeVm2 / 2}%`,
    "--alert-end": `${safeVm1 / 2}%`,
    "--hand-angle": `${-(100 - safeVolume) * 1.8}deg`,
    "--state": stateColor,
  } as React.CSSProperties;

  return (
    <section className="drought-clock flex flex-col items-center" style={clockStyle}>
      <div
        className="clock-face w-full"
        role="img"
        aria-label={`Relógio da Seca em ${safeVolume.toFixed(1)}%, estado ${stateLabel}, para ${monthName}`}
      >
        <div className="clock-arc" />
        <div className="clock-inner" />
        {thresholds.map((threshold, index) => (
          <span
            className="clock-threshold"
            key={index}
            style={
              {
                "--threshold-angle": `${-(100 - threshold) * 1.8}deg`,
              } as React.CSSProperties
            }
          />
        ))}
        <div className="clock-value">
          <strong style={{ color: stateColor }}>{safeVolume.toFixed(0)}%</strong>
          <span>{stateLabel}</span>
        </div>
        <div className="clock-hand" />
        <div className="clock-hub" />
        <span className="clock-scale clock-scale-max">100%</span>
        <span className="clock-scale clock-scale-min">0%</span>
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-2 leading-relaxed font-medium">
        Níveis-meta ({monthName}):{" "}
        <span className="text-water font-bold">{safeVm1.toFixed(1)}%</span> ·{" "}
        <span className="text-estado-alerta-text font-bold">{safeVm2.toFixed(1)}%</span> ·{" "}
        <span className="text-estado-seca-text font-bold">{safeVm3.toFixed(1)}%</span>
      </p>
    </section>
  );
}
