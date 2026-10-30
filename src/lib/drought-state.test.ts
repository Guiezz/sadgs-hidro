import { describe, expect, it } from "vitest";
import {
  DROUGHT_STATES,
  droughtClasses,
  droughtLabel,
  normalizeDroughtState,
} from "./drought-state";

describe("normalizeDroughtState", () => {
  it.each([
    ["Normal", "normal"],
    ["Alerta", "alerta"],
    ["Seca", "seca"],
    ["Seca Severa", "severa"],
    ["SECA SEVERA", "severa"],
    ["seca_severa", "severa"],
    [" Alerta ", "alerta"],
    ["Séca", "seca"],
  ])("%s → %s", (raw, key) => expect(normalizeDroughtState(raw)).toBe(key));

  it.each([[""], [null], [undefined], ["Colapso"]])("%s → null", (raw) =>
    expect(normalizeDroughtState(raw as string)).toBeNull(),
  );
});

it("DROUGHT_STATES na ordem do plano", () =>
  expect(DROUGHT_STATES.map((s) => s.label)).toEqual([
    "Normal",
    "Alerta",
    "Seca",
    "Seca Severa",
  ]));

it("droughtLabel devolve o rótulo", () =>
  expect(droughtLabel("severa")).toBe("Seca Severa"));

it("droughtClasses usa os tokens do estado", () =>
  expect(droughtClasses("alerta")).toEqual({
    text: "text-estado-alerta-text",
    bg: "bg-estado-alerta-bg",
    dot: "bg-estado-alerta-dot",
  }));

it("droughtClasses(null) é neutro", () =>
  expect(droughtClasses(null).bg).toBe("bg-muted"));
