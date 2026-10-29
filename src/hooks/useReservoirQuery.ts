"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import type { Reservatorio } from "@/lib/types";

// Busca dados do reservatório selecionado. Se a seleção mudar no meio de uma
// requisição, a resposta antiga é descartada.
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
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(id !== null);
  const [nonce, setNonce] = useState(0);
  const requestRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (id === null) {
      setData(null);
      setIsLoading(false);
      return;
    }
    const request = ++requestRef.current;
    setIsLoading(true);
    setError(null);
    fetcherRef
      .current(id)
      .then((result) => {
        if (request === requestRef.current) setData(result);
      })
      .catch((err: unknown) => {
        if (request !== requestRef.current) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os dados.");
      })
      .finally(() => {
        if (request === requestRef.current) setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, nonce, ...deps]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, error, isLoading, reload, reservoir: selectedReservoir };
}
