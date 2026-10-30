import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { PlanoAcao } from "@/lib/types";
import { MeasureList } from "./MeasureList";

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

describe("MeasureList", () => {
  it("cabeçalhos e numeração", () => {
    render(<MeasureList planos={[plano({ id: 1 }), plano({ id: 2 })]} />);
    for (const h of ["Nº", "Ação", "Descrição", "Situação"])
      expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "2" })).toBeInTheDocument();
  });

  it("situação normalizada", () => {
    render(
      <MeasureList
        planos={[
          plano({ id: 1, situacao: "Em andamento" }),
          plano({ id: 2, situacao: "Concluído" }),
          plano({ id: 3, situacao: "" }),
        ]}
      />,
    );
    expect(screen.getByText("Em andamento")).toBeInTheDocument();
    expect(screen.getByText("Concluída")).toBeInTheDocument();
    expect(screen.getByText("Não iniciada")).toBeInTheDocument();
  });

  it("ação e descrição com o texto da planilha inteiro", () => {
    render(
      <MeasureList
        planos={[plano({ acoes: "Uso de culturas que\nnecessitam um menor\nemprego de água", descricao_acao: "Estabelecer\nconvênios" })]}
      />,
    );
    expect(screen.getByText("Uso de culturas que necessitam um menor emprego de água")).toBeInTheDocument();
    expect(screen.getByText("Estabelecer convênios")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("células vazias viram travessão", () => {
    render(<MeasureList planos={[plano({})]} />);
    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});

describe("MeasureList paginada", () => {
  const muitos = Array.from({ length: 12 }, (_, i) => plano({ id: i + 1 }));

  it("mostra 10 medidas por página e continua a numeração", async () => {
    render(<MeasureList planos={muitos} />);
    expect(screen.getAllByRole("rowheader")).toHaveLength(10);
    await userEvent.click(screen.getByRole("button", { name: "Página 2" }));
    expect(screen.getAllByRole("rowheader").map((c) => c.textContent)).toEqual(["11", "12"]);
  });

  it("até 10 medidas não tem paginação", () => {
    render(<MeasureList planos={muitos.slice(0, 10)} />);
    expect(screen.queryByRole("navigation", { name: "Paginação" })).toBeNull();
  });
});
