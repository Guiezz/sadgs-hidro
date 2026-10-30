import { describe, expect, it } from "vitest";
import type { UsoAgua } from "./types";
import { findPerdas, reductionPct, sortUsosByNormal, sumBy } from "./water";

const u = (uso: string, vazao_normal = 0, vazao_escassez = 0): UsoAgua => ({
  id: Math.random(),
  reservatorio_id: 1,
  uso,
  vazao_normal,
  vazao_escassez,
});

describe("usos", () => {
  it("reductionPct arredonda", () => expect(reductionPct(720, 352)).toBe(51));
  it("reductionPct sem demanda normal", () => expect(reductionPct(0, 0)).toBeNull());
  it("findPerdas acha pelo nome", () =>
    expect(findPerdas([u("ETA Guaiúba"), u("Irregularidades, perdas em trânsito")])?.uso).toMatch(/Irregularidades/));
  it("findPerdas sem perdas", () => expect(findPerdas([u("ETA Guaiúba")])).toBeNull());
  it("sortUsosByNormal desc com desempate por nome", () =>
    expect(sortUsosByNormal([u("B", 10), u("A", 10), u("C", 140)]).map((x) => x.uso)).toEqual(["C", "A", "B"]));
  it("sortUsosByNormal não altera a entrada", () => {
    const input = [u("B", 1), u("A", 2)];
    sortUsosByNormal(input);
    expect(input.map((x) => x.uso)).toEqual(["B", "A"]);
  });
  it("sumBy", () => expect(sumBy([u("A", 10), u("B", 5)], (x) => x.vazao_normal)).toBe(15));
});
