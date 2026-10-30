// src/lib/drought-state.ts
// Estados de seca do Plano (sempre exibidos com texto, nunca só cor).

export type DroughtStateKey = "normal" | "alerta" | "seca" | "severa";

export const DROUGHT_STATES: readonly { key: DroughtStateKey; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "alerta", label: "Alerta" },
  { key: "seca", label: "Seca" },
  { key: "severa", label: "Seca Severa" },
];

const BY_NORMALIZED: Record<string, DroughtStateKey> = {
  normal: "normal",
  alerta: "alerta",
  seca: "seca",
  "seca severa": "severa",
};

export function normalizeDroughtState(
  raw: string | null | undefined,
): DroughtStateKey | null {
  if (!raw) return null;
  const normalized = raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[_\s]+/g, " ")
    .trim();
  return BY_NORMALIZED[normalized] ?? null;
}

export function droughtLabel(key: DroughtStateKey): string {
  return DROUGHT_STATES.find((s) => s.key === key)!.label;
}

// Classes completas (literais) para o Tailwind detectar no build.
const CLASSES: Record<DroughtStateKey, { text: string; bg: string; dot: string }> = {
  normal: {
    text: "text-estado-normal-text",
    bg: "bg-estado-normal-bg",
    dot: "bg-estado-normal-dot",
  },
  alerta: {
    text: "text-estado-alerta-text",
    bg: "bg-estado-alerta-bg",
    dot: "bg-estado-alerta-dot",
  },
  seca: {
    text: "text-estado-seca-text",
    bg: "bg-estado-seca-bg",
    dot: "bg-estado-seca-dot",
  },
  severa: {
    text: "text-estado-severa-text",
    bg: "bg-estado-severa-bg",
    dot: "bg-estado-severa-dot",
  },
};

export function droughtClasses(key: DroughtStateKey | null): {
  text: string;
  bg: string;
  dot: string;
} {
  if (!key) return { text: "text-muted-foreground", bg: "bg-muted", dot: "bg-label" };
  return CLASSES[key];
}
