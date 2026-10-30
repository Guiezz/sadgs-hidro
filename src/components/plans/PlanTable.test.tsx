import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    for (const h of ["Impacto", "Ações", "Classe", "Responsáveis"])
      expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument();
  });

  it("uma linha por plano, título em sentence case", () => {
    render(<PlanTable planos={[plano({ id: 1, tipos_impactos: "IMPACTOS ECONÔMICOS" }), plano({ id: 2 })]} />);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Impactos econômicos")).toBeInTheDocument();
  });

  it("mais de 5 ações abre com Ver mais", async () => {
    render(<PlanTable planos={[plano({ acoes: "a\nb\nc\nd\ne\nf\ng" })]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: "Ver mais 2 itens" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
  });

  it("exatamente 5 ações não tem Ver mais", () => {
    render(<PlanTable planos={[plano({ acoes: "a\nb\nc\nd\ne" })]} />);
    expect(screen.queryByRole("button", { name: /Ver mais/ })).toBeNull();
  });

  it("sem ações mostra aviso", () => {
    render(<PlanTable planos={[plano({ acoes: "" })]} />);
    expect(screen.getByText("Sem itens cadastrados.")).toBeInTheDocument();
  });

  it("classe e responsáveis deduplicados; vazios viram travessão", () => {
    render(
      <PlanTable
        planos={[
          plano({ id: 1, classes_acao: "Educação\nEducação", responsaveis: "COGERH; SRH; COGERH" }),
          plano({ id: 2 }),
        ]}
      />,
    );
    expect(screen.getByText("Educação")).toBeInTheDocument();
    expect(screen.getByText("COGERH, SRH")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});
