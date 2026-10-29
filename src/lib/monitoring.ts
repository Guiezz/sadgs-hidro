// src/lib/monitoring.ts
// Cálculos da tela de Monitoramento sobre /volume-chart e /history.
import type { ChartDataPoint, HistoryEntry } from "./types";

export type ChartPeriod = "1a" | "5a" | "10a" | "tudo";

const PERIOD_YEARS: Record<Exclude<ChartPeriod, "tudo">, number> = { "1a": 1, "5a": 5, "10a": 10 };
const DAY_MS = 24 * 60 * 60 * 1000;

const round = (value: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
};

// "aaaa-mm-dd" (volume-chart) → comparável como texto; recorte relativo ao último ponto.
export function filterByPeriod(points: ChartDataPoint[], period: ChartPeriod): ChartDataPoint[] {
  if (period === "tudo" || points.length === 0) return points;
  const last = points[points.length - 1].Data;
  const [y, m, d] = last.split("-");
  const cutoff = `${Number(y) - PERIOD_YEARS[period]}-${m}-${d}`;
  return points.filter((p) => p.Data >= cutoff);
}

// "dd/mm/aaaa" (history) → Date em UTC, para contar dias sem fuso.
function parseBr(date: string): number {
  const [d, m, y] = date.split("/").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function variation7d(
  history: HistoryEntry[],
): { deltaHm3: number; perDay: number; days: number } | null {
  if (history.length < 2) return null;
  const last = history[history.length - 1];
  const lastTime = parseBr(last.Data);
  const target = lastTime - 7 * DAY_MS;

  let base = history[0];
  for (let i = history.length - 2; i >= 0; i--) {
    if (parseBr(history[i].Data) <= target) {
      base = history[i];
      break;
    }
  }
  const days = Math.round((lastTime - parseBr(base.Data)) / DAY_MS);
  if (days <= 0) return null;
  const delta = last["Volume (hm3)"] - base["Volume (hm3)"];
  return { deltaHm3: round(delta, 2), perDay: round(delta / days, 2), days };
}

export function dailyDiffs(history: HistoryEntry[]): (number | null)[] {
  return history.map((entry, i) =>
    i === 0 ? null : round(entry["Volume (hm3)"] - history[i - 1]["Volume (hm3)"], 2),
  );
}

function csvField(value: string): string {
  return /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const csvNumber = (n: number) => n.toFixed(2).replace(".", ",");

// CSV para Excel pt-BR: BOM UTF-8, ";" e vírgula decimal.
export function historyToCsv(history: HistoryEntry[]): string {
  const diffs = dailyDiffs(history);
  const lines = ["Data;Estado;Volume (hm³);Variação"];
  history.forEach((entry, i) => {
    lines.push(
      [
        csvField(entry.Data),
        csvField(entry["Estado de Seca"]),
        csvNumber(entry["Volume (hm3)"]),
        diffs[i] === null ? "" : csvNumber(diffs[i] as number),
      ].join(";"),
    );
  });
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export function distanceToMetaPp(volumePct: number, metaPct: number): number {
  return round(volumePct - metaPct, 1);
}
