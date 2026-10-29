import { expect, it } from "vitest";
import { normalizeText, splitList } from "./text";

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
