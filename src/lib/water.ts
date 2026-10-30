// src/lib/water.ts
// Cálculos de Usos da Água e Balanço Hídrico.
import type { BalancoMensal, OfertaDemanda, UsoAgua } from "./types";
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

export function garantiaStatus(o: OfertaDemanda): {
  label: string;
  oferta: number;
  demanda: number;
  saldo: number;
  atende: boolean;
} {
  const oferta = o["Oferta (L/s)"];
  const demanda = o["Demanda (L/s)"];
  return { label: o["Cenário"].trim(), oferta, demanda, saldo: oferta - demanda, atende: oferta >= demanda };
}

// Ordena por valor e junta o que passa de n em "Outros N usos".
export function groupTopN(
  items: { label: string; value: number }[],
  n = 5,
): { label: string; value: number; pct: number; members?: string[] }[] {
  const total = sumBy(items, (i) => i.value);
  const pct = (v: number) => (total ? Math.round((v / total) * 1000) / 10 : 0);
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, n).map((i) => ({ label: i.label, value: i.value, pct: pct(i.value) }));
  const rest = sorted.slice(n);
  if (rest.length === 0) return top;
  const value = sumBy(rest, (i) => i.value);
  return [...top, { label: `Outros ${rest.length} usos`, value, pct: pct(value), members: rest.map((i) => i.label) }];
}

export function mesesAbaixoDaDemanda(balanco: BalancoMensal[]): string[] {
  return balanco.filter((m) => m["Afluência (m³/s)"] < m["Demanda (m³/s)"]).map((m) => m["Mês"]);
}

export function resumoAfluencia(meses: string[]): string {
  if (meses.length === 0) return "A afluência supera a demanda em todos os meses.";
  const lista = new Intl.ListFormat("pt-BR", { type: "conjunction" }).format(meses);
  const qtd = meses.length === 1 ? "1 mês" : `${meses.length} meses`;
  return `Em ${qtd} (${lista}) a afluência fica abaixo da demanda: o reservatório depende do volume acumulado na quadra chuvosa.`;
}
