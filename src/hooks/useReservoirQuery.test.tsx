import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { ReservoirContext } from "@/context/ReservoirContext";
import type { Reservatorio } from "@/lib/types";
import { useReservoirQuery } from "./useReservoirQuery";

const r = (id: number): Reservatorio => ({ id, nome: `R${id}`, municipio: "X", capacidade_hm3: 1 });

function wrapperFor(getSelected: () => Reservatorio | null) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ReservoirContext.Provider
        value={{
          reservatorios: [],
          selectedReservoir: getSelected(),
          setSelectedReservoir: () => {},
          isLoading: false,
          error: null,
        }}
      >
        {children}
      </ReservoirContext.Provider>
    );
  }
  return Wrapper;
}

it("descarta resposta antiga ao trocar de reservatório", async () => {
  let selected: Reservatorio | null = r(1);
  const resolvers: Record<number, (v: string) => void> = {};
  const fetcher = (id: number) => new Promise<string>((res) => (resolvers[id] = res));
  const { result, rerender } = renderHook(() => useReservoirQuery(fetcher), {
    wrapper: wrapperFor(() => selected),
  });
  selected = r(2);
  rerender();
  await act(async () => resolvers[2]("dados-2"));
  await act(async () => resolvers[1]("dados-1"));
  expect(result.current.data).toBe("dados-2");
  expect(result.current.isLoading).toBe(false);
});

it("sem reservatório selecionado não chama o fetcher", () => {
  const fetcher = vi.fn();
  const { result } = renderHook(() => useReservoirQuery(fetcher), { wrapper: wrapperFor(() => null) });
  expect(fetcher).not.toHaveBeenCalled();
  expect(result.current.isLoading).toBe(false);
  expect(result.current.data).toBeNull();
});

it("erro vira mensagem e reload refaz a chamada", async () => {
  const fetcher = vi.fn().mockRejectedValueOnce(new Error("falhou")).mockResolvedValueOnce("ok");
  const { result } = renderHook(() => useReservoirQuery(fetcher), { wrapper: wrapperFor(() => r(1)) });
  await waitFor(() => expect(result.current.error).toBe("falhou"));
  act(() => result.current.reload());
  await waitFor(() => expect(result.current.data).toBe("ok"));
  expect(result.current.error).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it("ao trocar de reservatório não devolve o dado do anterior enquanto carrega", async () => {
  let selected: Reservatorio | null = r(1);
  const resolvers: Record<number, (v: string) => void> = {};
  const fetcher = (id: number) => new Promise<string>((res) => (resolvers[id] = res));
  const { result, rerender } = renderHook(() => useReservoirQuery(fetcher), {
    wrapper: wrapperFor(() => selected),
  });
  await act(async () => resolvers[1]("dados-1"));
  expect(result.current.data).toBe("dados-1");

  selected = r(2);
  rerender();
  expect(result.current.data).toBeNull();
  expect(result.current.isLoading).toBe(true);
});

it("mudança só nos deps mantém o dado do mesmo reservatório", async () => {
  let filtro = "a";
  const resolvers: Record<string, (v: string) => void> = {};
  const fetcher = () => new Promise<string>((res) => (resolvers[filtro] = res));
  const { result, rerender } = renderHook(() => useReservoirQuery(fetcher, [filtro]), {
    wrapper: wrapperFor(() => r(1)),
  });
  await act(async () => resolvers.a("dados-a"));
  filtro = "b";
  rerender();
  expect(result.current.data).toBe("dados-a");
});
