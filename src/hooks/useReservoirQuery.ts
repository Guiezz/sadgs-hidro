"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import type { Reservatorio } from "@/lib/types";

type Resultado<T> = { id: number; data: T | null; error: string | null };

// Busca dados do reservatório selecionado. O resultado fica preso ao
// reservatório que o pediu: ao trocar a seleção, o dado anterior some na hora
// e respostas atrasadas são descartadas. Mudanças só nos `deps` mantêm o dado
// atual na tela até a nova resposta chegar.
export function useReservoirQuery<T>(
  fetcher: (id: number) => Promise<T>,
  deps: unknown[] = [],
): {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
  reservoir: Reservatorio | null;
} {
  const { selectedReservoir } = useReservoir();
  const id = selectedReservoir?.id ?? null;
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const [pendente, setPendente] = useState(false);
  const [nonce, setNonce] = useState(0);
  const requestRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (id === null) {
      requestRef.current++;
      setPendente(false);
      return;
    }
    const request = ++requestRef.current;
    setPendente(true);
    fetcherRef
      .current(id)
      .then((data) => {
        if (request === requestRef.current) setResultado({ id, data, error: null });
      })
      .catch((err: unknown) => {
        if (request !== requestRef.current) return;
        const error = err instanceof Error ? err.message : "Não foi possível carregar os dados.";
        setResultado({ id, data: null, error });
      })
      .finally(() => {
        if (request === requestRef.current) setPendente(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, nonce, ...deps]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const doReservatorio = resultado !== null && resultado.id === id;
  return {
    data: doReservatorio ? resultado.data : null,
    // Durante um reload o erro anterior some, como antes.
    error: doReservatorio && !pendente ? resultado.error : null,
    isLoading: id !== null && (pendente || !doReservatorio),
    reload,
    reservoir: selectedReservoir,
  };
}
