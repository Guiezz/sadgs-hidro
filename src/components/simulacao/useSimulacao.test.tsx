import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { ReservoirContext } from "@/context/ReservoirContext";
import type { Reservatorio, SimulacaoResponse } from "@/lib/types";

const pendentes: ((r: SimulacaoResponse) => void)[] = [];

vi.mock("@/lib/api", () => ({
  api: {
    getSimulacaoAcudes: vi.fn().mockResolvedValue([
      { codigo: 78, nome: "Acarape do Meio", capacidade_m3: 29600000, municipio: "", estacao_evap_id: 0 },
      { codigo: 99, nome: "Trussu", capacidade_m3: 255270000, municipio: "", estacao_evap_id: 0 },
    ]),
    getSimulacaoAnos: vi.fn().mockResolvedValue({ anos: [1911, 2017] }),
    getGatilhosPGPS: vi.fn().mockResolvedValue({ gatilhos: [] }),
    getDashboardSummary: vi.fn().mockResolvedValue({ volumePercentual: 50 }),
    getUsosAgua: vi.fn().mockResolvedValue([]),
    runSimulacao: vi.fn(() => new Promise<SimulacaoResponse>((res) => pendentes.push(res))),
  },
}));

import { useSimulacao } from "./useSimulacao";

const r = (id: number, nome: string): Reservatorio => ({ id, nome, municipio: "", capacidade_hm3: 1 });

function wrapperFor(get: () => Reservatorio | null) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ReservoirContext.Provider
        value={{ reservatorios: [], selectedReservoir: get(), setSelectedReservoir: () => {}, isLoading: false, error: null }}
      >
        {children}
      </ReservoirContext.Provider>
    );
  }
  return Wrapper;
}

beforeEach(() => {
  pendentes.length = 0;
});

it("descarta o resultado de uma simulação se o reservatório mudou no meio", async () => {
  let selected: Reservatorio | null = r(1, "Acarape do Meio");
  const { result, rerender } = renderHook(() => useSimulacao(), { wrapper: wrapperFor(() => selected) });
  await waitFor(() => expect(result.current.selectedAcudeId).toBe("78"));

  act(() => {
    void result.current.handleSimular();
  });
  await waitFor(() => expect(pendentes).toHaveLength(1));

  selected = r(16, "Trussu");
  rerender();
  await waitFor(() => expect(result.current.selectedAcudeId).toBe("99"));

  await act(async () => pendentes[0]({ resultados: [], frequencia_nao_atendida: 15, volume_final: 1 }));
  expect(result.current.resultado).toBeNull();
  expect(result.current.simulating).toBe(false);
});

it("mantém o resultado quando o reservatório não muda", async () => {
  const { result } = renderHook(() => useSimulacao(), { wrapper: wrapperFor(() => r(1, "Acarape do Meio")) });
  await waitFor(() => expect(result.current.selectedAcudeId).toBe("78"));
  act(() => {
    void result.current.handleSimular();
  });
  await waitFor(() => expect(pendentes).toHaveLength(1));
  await act(async () => pendentes[0]({ resultados: [], frequencia_nao_atendida: 15, volume_final: 1 }));
  expect(result.current.resultado?.frequencia_nao_atendida).toBe(15);
});
