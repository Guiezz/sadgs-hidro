import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PlanoAcao } from "@/lib/types";
import { PlanTable } from "./PlanTable";

const plano = (over: Partial<PlanoAcao>): PlanoAcao => ({
  id: 1,
  reservatorio_id: 1,
  situacao: "",
  acoes: "",
  descricao_acao: "",
  responsaveis: "",
  classes_acao: "",
  tipos_impactos: "",
  problemas: "",
  orgaos_envolvidos: "",
  indicadores: "",
  estado_seca: "",
  ...over,
});

describe("PlanTable", () => {
  it("cabeçalhos da tabela", () => {
    render(<PlanTable planos={[plano({})]} />);
    for (const h of ["Impacto", "Descrição da ação", "Classe da ação", "Responsáveis"])
      expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument();
  });

  it("uma linha por plano, título em sentence case", () => {
    render(<PlanTable planos={[plano({ id: 1, tipos_impactos: "IMPACTOS ECONÔMICOS" }), plano({ id: 2 })]} />);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Impactos econômicos")).toBeInTheDocument();
  });

  it("o impacto é o cabeçalho da linha", () => {
    render(<PlanTable planos={[plano({ id: 1, tipos_impactos: "IMPACTOS ECONÔMICOS" })]} />);
    expect(screen.getByRole("rowheader", { name: /Impactos econômicos/ })).toBeInTheDocument();
  });

  it("mostra o texto da planilha inteiro, sem cortar nem deduplicar", () => {
    render(
      <PlanTable
        planos={[
          plano({
            descricao_acao: "Monitoramento da evasão dos\ntrabalhadores agrícolas",
            classes_acao: "Medidas econômicas e\nsociais",
            responsaveis: "Sindicato do\nTrabalhadores\nRurais, COGERH\nCOGERH",
          }),
        ]}
      />,
    );
    expect(screen.getByText("Monitoramento da evasão dos trabalhadores agrícolas")).toBeInTheDocument();
    expect(screen.getByText("Medidas econômicas e sociais")).toBeInTheDocument();
    expect(screen.getByText("Sindicato do Trabalhadores Rurais, COGERH COGERH")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("células vazias viram travessão", () => {
    render(<PlanTable planos={[plano({})]} />);
    expect(screen.getAllByText("—")).toHaveLength(3);
  });
});
