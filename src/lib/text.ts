// src/lib/text.ts

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Texto de uma célula da planilha como parágrafo. Nas células dos planos a
// quebra de linha ora separa itens, ora só quebra o texto, então não dá
// para separar sem cortar nomes: juntamos as linhas.
export function cellText(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s+/g, " ").trim();
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
    const isSeparator = ch === ";" || ((ch === "\n" || ch === ",") && depth === 0);
    if (ch === "\n" && depth > 0) {
      current += " ";
    } else if (isSeparator) {
      items.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  items.push(current);
  return items.map((s) => s.trim()).filter(Boolean);
}

// Ações de um plano vêm de células da planilha: uma por linha ou, quando os
// itens quebram em várias linhas, separadas por uma linha em branco.
export function splitActions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const text = raw.replace(/\r/g, "").trim();
  const items = /\n\s*\n/.test(text)
    ? text.split(/\n\s*\n/).map((block) => block.replace(/\s*\n\s*/g, " "))
    : text.split("\n");
  return items.map((s) => s.trim()).filter(Boolean);
}

// "Créditos Institucionais" → "creditos-institucionais" (âncoras e nomes de arquivo).
export function slugify(s: string): string {
  return normalizeText(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
