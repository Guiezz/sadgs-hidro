import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Reservatorio } from "@/lib/types";
import { ReservoirProvider, useReservoir } from "./ReservoirContext";

const lista: Reservatorio[] = [
  { id: 1, nome: "Acarape do Meio", municipio: "Redenção", capacidade_hm3: 29 },
  { id: 2, nome: "Castanhão", municipio: "Alto Santo", capacidade_hm3: 6700 },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <ReservoirProvider>{children}</ReservoirProvider>
);

let trackSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  trackSpy = vi.fn();
  window.umami = { track: trackSpy };
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(lista), { status: 200 })),
  );
});

afterEach(() => {
  delete window.umami;
  vi.unstubAllGlobals();
});

it("a seleção automática do primeiro hidrossistema não conta como escolha", async () => {
  const { result } = renderHook(() => useReservoir(), { wrapper });
  await waitFor(() => expect(result.current.selectedReservoir?.id).toBe(1));
  expect(trackSpy).not.toHaveBeenCalled();
});

it("registra o hidrossistema escolhido pelo visitante", async () => {
  const { result } = renderHook(() => useReservoir(), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => result.current.setSelectedReservoir(lista[1]));

  expect(result.current.selectedReservoir?.id).toBe(2);
  expect(trackSpy).toHaveBeenCalledWith("hidrossistema-selecionado", { nome: "Castanhão" });
});

it("limpar a seleção não gera evento", async () => {
  const { result } = renderHook(() => useReservoir(), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => result.current.setSelectedReservoir(null));

  expect(trackSpy).not.toHaveBeenCalled();
});
