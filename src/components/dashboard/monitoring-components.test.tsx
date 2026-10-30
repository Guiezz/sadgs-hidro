import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MonitoringKpis } from "./MonitoringKpis";
import { VolumeChart } from "./VolumeChart";

const base = {
  volumeHm3: 23.02,
  volumePct: 78.6,
  capacidadeHm3: 29.6,
  diasNoEstado: 364,
  limites: [10, 12.7, 15.7],
  medidasAtivas: 4,
  estado: "NORMAL",
};

it("variação mostra o período real quando não é 7 dias", () => {
  render(
    <dl>
      <MonitoringKpis {...base} variation={{ deltaHm3: -0.58, perDay: -0.06, days: 10 }} />
    </dl>,
  );
  expect(screen.getByText("Variação em 10 dias")).toBeInTheDocument();
});

it("variação de 7 dias mantém o rótulo", () => {
  render(
    <dl>
      <MonitoringKpis {...base} variation={{ deltaHm3: -0.49, perDay: -0.07, days: 7 }} />
    </dl>,
  );
  expect(screen.getByText("Variação em 7 dias")).toBeInTheDocument();
});

it("distância usa o limite ordenado", () => {
  render(
    <dl>
      <MonitoringKpis {...base} variation={null} />
    </dl>,
  );
  expect(screen.getByText("62,9 p.p. acima do limite do estado Normal")).toBeInTheDocument();
});

it("série com um único ponto mostra estado vazio", () => {
  render(
    <VolumeChart
      data={[{ Data: "2026-10-20", volume: 23, meta1: 0.1, meta2: 0.08, meta3: 0.05 }]}
      capacidadeMaxima={29.6}
      reservatorio="Acarape do Meio"
    />,
  );
  expect(screen.getByText("Sem dados de volume")).toBeInTheDocument();
});
