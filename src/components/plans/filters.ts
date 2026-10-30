// src/components/plans/filters.ts
import type { PlanoAcao } from "@/lib/types";
import { normalizeText, splitActions } from "@/lib/text";

export type PlanFilterState = {
  estado?: string;
  impacto?: string;
  problema?: string;
  classe?: string;
};

const LABELS: Record<keyof PlanFilterState, string> = {
  estado: "Estado",
  impacto: "Impacto",
  problema: "Problema",
  classe: "Classe",
};

export function matchesSearch(plano: PlanoAcao, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;
  return [plano.acoes, plano.descricao_acao, plano.responsaveis].some((field) =>
    normalizeText(field ?? "").includes(q),
  );
}

export function activeFilterChips(f: PlanFilterState): { key: keyof PlanFilterState; label: string }[] {
  return (Object.keys(LABELS) as (keyof PlanFilterState)[])
    .filter((key) => f[key])
    .map((key) => ({ key, label: `${LABELS[key]}: ${f[key]}` }));
}

// Classes da ação vêm em texto livre da planilha; cada bloco vira uma opção.
export function classOptions(planos: PlanoAcao[]): string[] {
  const set = new Set(planos.flatMap((p) => splitActions(p.classes_acao)));
  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function matchesClass(plano: PlanoAcao, classe: string): boolean {
  if (!classe) return true;
  return splitActions(plano.classes_acao).includes(classe);
}
