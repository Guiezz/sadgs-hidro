import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { KpiCard } from "./KpiCard";
import { PageHeader } from "./PageHeader";
import { SegmentedControl } from "./SegmentedControl";
import { StateBadge } from "./StateBadge";

it("StateBadge normaliza o estado", () => {
  render(<StateBadge state="SECA SEVERA" />);
  expect(screen.getByText("Seca Severa")).toBeInTheDocument();
});

it("StateBadge desconhecido mostra Sem estado", () => {
  render(<StateBadge state="xyz" />);
  expect(screen.getByText("Sem estado")).toBeInTheDocument();
});

it("KpiCard sem valor mostra travessão", () => {
  render(
    <dl>
      <KpiCard label="Volume" value={null} unit="hm³" />
    </dl>,
  );
  expect(screen.getByText("—")).toBeInTheDocument();
  expect(screen.queryByText("hm³")).not.toBeInTheDocument();
});

it("KpiCard formata em pt-BR", () => {
  render(
    <dl>
      <KpiCard label="Volume" value={23.0234} unit="hm³" />
    </dl>,
  );
  expect(screen.getByText("23,02")).toBeInTheDocument();
});

it("SegmentedControl marca o ativo e avisa a troca", async () => {
  const onChange = vi.fn();
  render(
    <SegmentedControl
      label="Período"
      options={[
        { value: "1a", label: "1 ano" },
        { value: "tudo", label: "Tudo" },
      ]}
      value="1a"
      onChange={onChange}
    />,
  );
  expect(screen.getByRole("button", { name: "1 ano" })).toHaveAttribute("aria-pressed", "true");
  await userEvent.click(screen.getByRole("button", { name: "Tudo" }));
  expect(onChange).toHaveBeenCalledWith("tudo");
});

it("SegmentedControl tem alvo de toque de 44px", () => {
  render(
    <SegmentedControl label="Formato" options={[{ value: "a", label: "A" }]} value="a" onChange={() => {}} />,
  );
  expect(screen.getByRole("button", { name: "A" })).toHaveClass("min-h-11");
});

it("PageHeader justifica a descrição", () => {
  render(<PageHeader title="T" description="Texto longo" />);
  expect(screen.getByText("Texto longo")).toHaveClass("texto-corrido");
});
