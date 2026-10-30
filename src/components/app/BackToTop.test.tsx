import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BackToTop } from "./BackToTop";

const original = {
  scrollY: Object.getOwnPropertyDescriptor(window, "scrollY"),
  innerHeight: Object.getOwnPropertyDescriptor(window, "innerHeight"),
  scrollTo: Object.getOwnPropertyDescriptor(window, "scrollTo"),
};

function restaurar(chave: keyof typeof original) {
  const d = original[chave];
  if (d) Object.defineProperty(window, chave, d);
  else delete (window as unknown as Record<string, unknown>)[chave];
}

function rolar(scrollY: number, innerHeight: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: scrollY });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: innerHeight });
  fireEvent.scroll(window);
}

beforeEach(() => {
  window.scrollTo = vi.fn();
});

afterEach(() => {
  restaurar("scrollY");
  restaurar("innerHeight");
  restaurar("scrollTo");
});

it("escondido no topo da página", () => {
  rolar(0, 800);
  render(<BackToTop />);
  expect(screen.queryByRole("button", { name: "Voltar ao topo" })).toBeNull();
});

it("aparece depois de uma tela e some ao voltar", () => {
  render(<BackToTop />);
  act(() => rolar(900, 800));
  expect(screen.getByRole("button", { name: "Voltar ao topo" })).toBeInTheDocument();
  act(() => rolar(300, 800));
  expect(screen.queryByRole("button", { name: "Voltar ao topo" })).toBeNull();
});

it("reavalia ao redimensionar a janela", () => {
  render(<BackToTop />);
  act(() => rolar(900, 1000));
  expect(screen.queryByRole("button", { name: "Voltar ao topo" })).toBeNull();
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  act(() => {
    fireEvent(window, new Event("resize"));
  });
  expect(screen.getByRole("button", { name: "Voltar ao topo" })).toBeInTheDocument();
});

it("clique sobe e devolve o foco ao conteúdo", async () => {
  render(
    <>
      <main id="conteudo" tabIndex={-1} />
      <BackToTop />
    </>,
  );
  act(() => rolar(900, 800));
  await userEvent.click(screen.getByRole("button", { name: "Voltar ao topo" }));
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  expect(document.activeElement).toBe(document.getElementById("conteudo"));
});
