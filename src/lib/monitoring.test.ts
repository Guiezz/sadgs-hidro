import { describe, expect, it } from "vitest";
import type { HistoryEntry } from "./types";
import {
  dailyDiffs,
  distanceToMetaPp,
  filterByPeriod,
  historyToCsv,
  variation7d,
} from "./monitoring";

const pts = ["2015-01-01", "2021-10-19", "2025-10-20", "2026-10-20"].map((Data) => ({
  Data,
  volume: 1,
  meta1: 0,
  meta2: 0,
  meta3: 0,
}));
const h = (Data: string, v: number): HistoryEntry => ({
  Data,
  "Estado de Seca": "Normal",
  "Volume (hm3)": v,
});

describe("filterByPeriod", () => {
  it("1 ano a partir do último ponto, inclusivo", () =>
    expect(filterByPeriod(pts, "1a").map((p) => p.Data)).toEqual(["2025-10-20", "2026-10-20"]));
  it("5 anos", () =>
    expect(filterByPeriod(pts, "5a").map((p) => p.Data)).toEqual(["2025-10-20", "2026-10-20"]));
  it("10 anos", () => expect(filterByPeriod(pts, "10a")).toHaveLength(3));
  it("tudo", () => expect(filterByPeriod(pts, "tudo")).toHaveLength(4));
  it("vazio", () => expect(filterByPeriod([], "1a")).toEqual([]));
});

describe("variation7d", () => {
  it("compara com o registro de 7 dias antes", () =>
    expect(variation7d([h("10/10/2026", 23.6), h("13/10/2026", 23.51), h("20/10/2026", 23.02)])).toEqual({
      deltaHm3: -0.49,
      perDay: -0.07,
      days: 7,
    }));
  it("com lacuna usa o registro anterior mais próximo", () =>
    expect(variation7d([h("10/10/2026", 23.6), h("20/10/2026", 23.02)])).toEqual({
      deltaHm3: -0.58,
      perDay: -0.06,
      days: 10,
    }));
  it("série curta usa o primeiro registro", () =>
    expect(variation7d([h("18/10/2026", 23.2), h("20/10/2026", 23.02)])).toEqual({
      deltaHm3: -0.18,
      perDay: -0.09,
      days: 2,
    }));
  it("um registro ou nenhum", () => {
    expect(variation7d([h("20/10/2026", 23.02)])).toBeNull();
    expect(variation7d([])).toBeNull();
  });
});

it("dailyDiffs", () =>
  expect(dailyDiffs([h("13/10/2026", 23.51), h("14/10/2026", 23.45), h("15/10/2026", 23.36)])).toEqual([
    null,
    -0.06,
    -0.09,
  ]));

describe("historyToCsv", () => {
  const csv = historyToCsv([h("13/10/2026", 23.51), h("14/10/2026", 23.45)]);
  it("BOM e cabeçalho", () => expect(csv.startsWith("﻿Data;Estado;Volume (hm³);Variação\r\n")).toBe(true));
  it("primeira linha sem variação", () => expect(csv).toContain("13/10/2026;Normal;23,51;\r\n"));
  it("vírgula decimal e hífen ASCII", () => expect(csv).toContain("14/10/2026;Normal;23,45;-0,06"));
  it("escapa ; e aspas", () =>
    expect(historyToCsv([{ ...h("14/10/2026", 1), "Estado de Seca": 'A;"B"' }])).toContain('"A;""B"""'));
});

it("distanceToMetaPp", () => expect(distanceToMetaPp(78.6, 15.7)).toBe(62.9));
