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

  const clockStyle = {
    "--normal-end": `${(100 - safeVm1) / 2}%`,
    "--alert-end": `${(100 - safeVm2) / 2}%`,
    "--dry-end": `${(100 - safeVm3) / 2}%`,
    "--hand-angle": `${-safeVolume * 1.8}deg`,
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
                "--threshold-angle": `${-threshold * 1.8}deg`,
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
        <span className="text-sky-600 font-bold">{safeVm1.toFixed(1)}%</span> ·{" "}
        <span className="text-yellow-600 font-bold">{safeVm2.toFixed(1)}%</span> ·{" "}
        <span className="text-orange-600 font-bold">{safeVm3.toFixed(1)}%</span>
      </p>
    </section>
  );
}
