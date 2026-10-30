import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { PageNav } from "./PageNav";

it("uma página só não mostra navegação", () => {
  render(<PageNav page={1} pages={1} onChange={() => {}} />);
  expect(screen.queryByRole("navigation")).toBeNull();
});

it("marca a página atual e navega", async () => {
  const onChange = vi.fn();
  render(<PageNav page={1} pages={3} onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Página 1" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
  await userEvent.click(screen.getByRole("button", { name: "Página 3" }));
  expect(onChange.mock.calls).toEqual([[2], [3]]);
});
