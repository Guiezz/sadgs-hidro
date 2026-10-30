import { describe, expect, it } from "vitest";
import type { UsoAgua } from "./types";
import {
  findPerdas,
  garantiaStatus,
  groupTopN,
  mesesAbaixoDaDemanda,
  reductionPct,
  resumoAfluencia,
  sortUsosByNormal,
  sumBy,
} from "./water";

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

describe("balanço", () => {
  const od = (c: string, oferta: number, demanda: number) => ({
    "Cenário": c,
    "Oferta (L/s)": oferta,
    "Demanda (L/s)": demanda,
  });
  it("garantia que atende", () =>
    expect(garantiaStatus(od(" Garantia 90% ", 848, 748))).toEqual({
      label: "Garantia 90%",
      oferta: 848,
      demanda: 748,
      saldo: 100,
      atende: true,
    }));
  it("garantia em déficit", () => expect(garantiaStatus(od("G95", 711, 748)).saldo).toBe(-37));
  it("oferta igual à demanda atende", () => expect(garantiaStatus(od("G", 748, 748)).atende).toBe(true));

  it("groupTopN agrupa o resto em Outros", () => {
    const g = groupTopN(
      [["a", 235], ["b", 140], ["c", 110], ["d", 100], ["e", 60], ["f", 30], ["g", 20]].map(([label, value]) => ({
        label: String(label),
        value: Number(value),
      })),
    );
    expect(g).toHaveLength(6);
    expect(g[5]).toEqual({ label: "Outros 2 usos", value: 50, pct: 7.2, members: ["f", "g"] });
  });
  it("groupTopN com um item", () => expect(groupTopN([{ label: "a", value: 1 }])).toEqual([{ label: "a", value: 1, pct: 100 }]));
  it("groupTopN com total zero", () =>
    expect(groupTopN([{ label: "a", value: 0 }])).toEqual([{ label: "a", value: 0, pct: 0 }]));

  it("mesesAbaixoDaDemanda", () =>
    expect(
      mesesAbaixoDaDemanda([
        { "Mês": "Jan", "Afluência (m³/s)": 0.38, "Demanda (m³/s)": 0.748, "Balanço (m³/s)": 0, "Evaporação (m³/s)": 0 },
        { "Mês": "Fev", "Afluência (m³/s)": 0.82, "Demanda (m³/s)": 0.748, "Balanço (m³/s)": 0, "Evaporação (m³/s)": 0 },
      ]),
    ).toEqual(["Jan"]));

  it("resumoAfluencia sem meses", () =>
    expect(resumoAfluencia([])).toBe("A afluência supera a demanda em todos os meses."));
  it("resumoAfluencia com um mês", () =>
    expect(resumoAfluencia(["agosto"])).toBe(
      "Em 1 mês (agosto) a afluência fica abaixo da demanda: o reservatório depende do volume acumulado na quadra chuvosa.",
    ));
  it("resumoAfluencia com vários meses", () =>
    expect(resumoAfluencia(["agosto", "setembro"])).toBe(
      "Em 2 meses (agosto e setembro) a afluência fica abaixo da demanda: o reservatório depende do volume acumulado na quadra chuvosa.",
    ));
});
