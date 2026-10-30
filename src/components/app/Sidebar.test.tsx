import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, logout: vi.fn() }),
}));

it("botão de recolher vem antes da navegação", () => {
  render(<Sidebar collapsed={false} onToggle={() => {}} />);
  const botao = screen.getByRole("button", { name: "Recolher menu" });
  const link = screen.getByRole("link", { name: /Visão Geral/ });
  expect(botao.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("recolhida, o botão vira Expandir menu", async () => {
  const onToggle = vi.fn();
  render(<Sidebar collapsed onToggle={onToggle} />);
  const botao = screen.getByRole("button", { name: "Expandir menu" });
  expect(botao).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(botao);
  expect(onToggle).toHaveBeenCalledOnce();
});
