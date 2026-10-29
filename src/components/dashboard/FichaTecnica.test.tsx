import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import type { IdentificationData } from "@/lib/types";
import { FichaTecnica } from "./FichaTecnica";

const base: IdentificationData = {
  id: 1,
  nome: "Acarape do Meio",
  municipio: "Redenção",
  descricao: "",
  lat: -4.1858556,
  long: -38.813525,
  url_imagem: "",
  url_imagem_usos: "",
};

it("mostra só as linhas preenchidas, formatadas", () => {
  render(
    <FichaTecnica
      data={{
        ...base,
        capacidade_hm3: 29.6,
        area_drenagem_km2: 206.2,
        ano_construcao: 1924,
        construtor: "IFOCS (atual DNOCS)",
        rio_barrado: null,
        municipios_atendidos: "Redenção; Acarape",
      }}
    />,
  );
  expect(screen.getByText("29,60 hm³")).toBeInTheDocument();
  expect(screen.getByText("206,20 km²")).toBeInTheDocument();
  expect(screen.getByText("1924 · IFOCS (atual DNOCS)")).toBeInTheDocument();
  expect(screen.queryByText("Rio barrado")).not.toBeInTheDocument();
  const lista = screen.getByRole("list", { name: "Municípios atendidos" });
  expect(within(lista).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Redenção", "Acarape"]);
  expect(screen.getByText("4°11′09″ S · 38°48′49″ O")).toBeInTheDocument();
});

it("sem campos novos mostra só coordenadas", () => {
  render(<FichaTecnica data={base} />);
  expect(screen.getByText("Coordenadas")).toBeInTheDocument();
  expect(screen.queryByText("Capacidade")).not.toBeInTheDocument();
  expect(screen.queryByRole("list", { name: "Municípios atendidos" })).not.toBeInTheDocument();
});
