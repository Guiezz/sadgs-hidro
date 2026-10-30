import { render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Table, TableBody, TableCell, TableRow } from "./table";

const original = Object.getOwnPropertyDescriptors(HTMLElement.prototype);

afterEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", original.scrollWidth ?? { configurable: true, value: 0 });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", original.clientWidth ?? { configurable: true, value: 0 });
});

function medidas(scroll: number, client: number) {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => scroll });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => client });
}

const tabela = (
  <Table aria-label="Resultados">
    <TableBody>
      <TableRow>
        <TableCell>1</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

it("tabela sem rolagem não vira parada de Tab", () => {
  medidas(300, 300);
  render(tabela);
  expect(screen.getByRole("table").parentElement).not.toHaveAttribute("tabindex");
});

it("tabela com rolagem horizontal é focável e nomeada", () => {
  medidas(900, 300);
  render(tabela);
  const box = screen.getByRole("region", { name: "Resultados (role para o lado)" });
  expect(box).toHaveAttribute("tabindex", "0");
});
