import { render, screen } from "@testing-library/react";
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
    for (const h of ["Nº", "Ações", "Situação"])
      expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2" })).toBeInTheDocument();
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

  it("mais de 5 ações abre com Ver mais", () => {
    render(<MeasureList planos={[plano({ acoes: "a\nb\nc\nd\ne\nf" })]} />);
    expect(screen.getByRole("button", { name: "Ver mais 1 ação" })).toBeInTheDocument();
  });
});
