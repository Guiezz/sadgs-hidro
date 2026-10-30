import { expect, it } from "vitest";
import type { PlanoAcao } from "@/lib/types";
import { activeFilterChips, classOptions, matchesClass, matchesSearch } from "./filters";

const p: PlanoAcao = {
  id: 1,
  reservatorio_id: 1,
  situacao: "Não iniciado",
  acoes: "Subsídios do governo",
  descricao_acao: "",
  responsaveis: "CAGECE",
  classes_acao: "Medidas preventivas\n\nMedidas econômicas e sociais",
  tipos_impactos: "IMPACTOS ECONÔMICOS",
  problemas: "",
  orgaos_envolvidos: "",
  indicadores: "",
  estado_seca: "NORMAL",
};

it("busca ignora acentos e caixa", () =>
  expect(matchesSearch({ ...p, descricao_acao: "Poços para irrigação" }, "pocos")).toBe(true));
it("busca em responsáveis", () => expect(matchesSearch({ ...p, responsaveis: "COGERH" }, "cogerh")).toBe(true));
it("busca vazia aceita tudo", () => expect(matchesSearch(p, "  ")).toBe(true));
it("busca sem resultado", () => expect(matchesSearch(p, "inexistente")).toBe(false));

it("chips só dos filtros preenchidos", () =>
  expect(activeFilterChips({ estado: "Normal", classe: "" })).toEqual([{ key: "estado", label: "Estado: Normal" }]));

it("chips com todos os rótulos", () =>
  expect(
    activeFilterChips({ estado: "Alerta", impacto: "Sociais", problema: "Doenças", classe: "Preventivas" }).map(
      (c) => c.label,
    ),
  ).toEqual(["Estado: Alerta", "Impacto: Sociais", "Problema: Doenças", "Classe: Preventivas"]));

it("classOptions junta, deduplica e ordena", () =>
  expect(classOptions([p, { ...p, id: 2, classes_acao: "Medidas preventivas" }])).toEqual([
    "Medidas econômicas e sociais",
    "Medidas preventivas",
  ]));

it("matchesClass", () => {
  expect(matchesClass(p, "Medidas preventivas")).toBe(true);
  expect(matchesClass(p, "")).toBe(true);
  expect(matchesClass(p, "Normativas")).toBe(false);
});
