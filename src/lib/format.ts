// src/lib/format.ts
// Formatação de números e coordenadas em pt-BR.

const EMPTY = "—";

function isMissing(value: number | null | undefined): value is null | undefined {
  return value === null || value === undefined || Number.isNaN(value);
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (isMissing(value)) return EMPTY;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Sinal explícito; negativo com "−" (U+2212), como no design.
export function formatSigned(value: number | null | undefined, decimals = 2): string {
  if (isMissing(value)) return EMPTY;
  const abs = formatNumber(Math.abs(value), decimals);
  const rounded = Number(value.toFixed(decimals));
  if (rounded === 0) return abs;
  return `${rounded < 0 ? "−" : "+"}${abs}`;
}

export function formatDms(value: number, axis: "lat" | "long"): string {
  const hemisphere =
    axis === "lat" ? (value < 0 ? "S" : "N") : value < 0 ? "O" : "L";
  let totalSeconds = Math.round(Math.abs(value) * 3600);
  const degrees = Math.floor(totalSeconds / 3600);
  totalSeconds -= degrees * 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${degrees}°${pad(minutes)}′${pad(seconds)}″ ${hemisphere}`;
}
