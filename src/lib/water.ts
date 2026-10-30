// src/lib/water.ts
// Cálculos de Usos da Água e Balanço Hídrico.
import type { UsoAgua } from "./types";
import { normalizeText } from "./text";

export function sumBy<T>(items: T[], pick: (t: T) => number): number {
  return items.reduce((acc, item) => acc + (pick(item) || 0), 0);
}

export function sortUsosByNormal(usos: UsoAgua[]): UsoAgua[] {
  return [...usos].sort(
    (a, b) => b.vazao_normal - a.vazao_normal || a.uso.localeCompare(b.uso, "pt-BR"),
  );
}

export function findPerdas(usos: UsoAgua[]): UsoAgua | null {
  return (
    usos.find((u) => {
      const name = normalizeText(u.uso);
      return name.includes("perda") || name.includes("irregular");
    }) ?? null
  );
}

// Quanto a demanda cai da normalidade para a escassez, em %.
export function reductionPct(normal: number, escassez: number): number | null {
  if (!normal) return null;
  return Math.round((1 - escassez / normal) * 100);
}
