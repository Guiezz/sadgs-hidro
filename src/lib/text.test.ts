import { expect, it } from "vitest";
import { cellText, normalizeText, slugify, splitActions, splitList } from "./text";

it("splitList separa por ; , e quebra de linha, preservando parênteses", () =>
  expect(splitList("Poder Público (Mun., Est., Fed.), CAGECE; COGERH\nSDA")).toEqual([
    "Poder Público (Mun., Est., Fed.)",
    "CAGECE",
    "COGERH",
    "SDA",
  ]));

it("splitList vazio", () => {
  expect(splitList("  ")).toEqual([]);
  expect(splitList(null)).toEqual([]);
});

it("normalizeText remove acentos e caixa", () => expect(normalizeText("  Poços ")).toBe("pocos"));

it("splitActions: uma ação por linha", () =>
  expect(splitActions("Subsídios do governo\nProgramas assistenciais\n")).toEqual([
    "Subsídios do governo",
    "Programas assistenciais",
  ]));

it("splitActions: blocos separados por linha em branco juntam as quebras internas", () =>
  expect(
    splitActions(
      "Poços para irrigação em locais estratégicos\n\nConstruir adutora ligando\ninterligando o Açude, o\nMamoeiro",
    ),
  ).toEqual(["Poços para irrigação em locais estratégicos", "Construir adutora ligando interligando o Açude, o Mamoeiro"]));

it("splitActions vazio", () => expect(splitActions("")).toEqual([]));

it("splitList: quebra de linha dentro de parênteses vira espaço", () =>
  expect(splitList("Maranguape;\nMaracanaú (Distrito\nIndustrial).")).toEqual([
    "Maranguape",
    "Maracanaú (Distrito Industrial).",
  ]));

it("slugify gera âncoras estáveis", () => {
  expect(slugify("Créditos Institucionais")).toBe("creditos-institucionais");
  expect(slugify("COMISSÃO GESTORA DO AÇUDE ACARAPE DO MEIO")).toBe("comissao-gestora-do-acude-acarape-do-meio");
  expect(slugify("  Equipe – CEPAS/UFC  ")).toBe("equipe-cepas-ufc");
});

it("cellText junta as linhas da célula sem cortar nomes", () => {
  expect(cellText("Sindicato do\nTrabalhadores\r\n  Rurais, SEMA ")).toBe("Sindicato do Trabalhadores Rurais, SEMA");
  expect(cellText(null)).toBe("");
});
