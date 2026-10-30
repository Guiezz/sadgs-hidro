import { expect, it } from "vitest";
import { formatDms, formatNumber, formatSigned } from "./format";

it("formatNumber em pt-BR", () => {
  expect(formatNumber(23.0234)).toBe("23,02");
  expect(formatNumber(1774.95, 2)).toBe("1.774,95");
  expect(formatNumber(720, 0)).toBe("720");
});

it("formatNumber sem valor vira travessão", () => {
  expect(formatNumber(null)).toBe("—");
  expect(formatNumber(undefined)).toBe("—");
  expect(formatNumber(Number.NaN)).toBe("—");
});

it("formatSigned usa o sinal de menos tipográfico", () => {
  expect(formatSigned(-0.49)).toBe("−0,49");
  expect(formatSigned(0.12)).toBe("+0,12");
  expect(formatSigned(0)).toBe("0,00");
  expect(formatSigned(null)).toBe("—");
});

it("formatDms converte coordenadas decimais", () => {
  expect(formatDms(-4.1858556, "lat")).toBe("4°11′09″ S");
  expect(formatDms(-38.813525, "long")).toBe("38°48′49″ O");
  expect(formatDms(-4.9999999, "lat")).toBe("5°00′00″ S");
  expect(formatDms(3.5, "lat")).toBe("3°30′00″ N");
});
