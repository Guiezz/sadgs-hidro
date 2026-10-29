// src/lib/text.ts

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Separa listas vindas da planilha por ";", "," e quebra de linha,
// sem quebrar vírgulas dentro de parênteses: "Poder Público (Mun., Est.)".
export function splitList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const items: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of raw) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    const isSeparator = ch === ";" || ch === "\n" || (ch === "," && depth === 0);
    if (isSeparator) {
      items.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  items.push(current);
  return items.map((s) => s.trim()).filter(Boolean);
}
