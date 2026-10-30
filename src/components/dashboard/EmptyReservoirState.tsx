"use client";

import { Loader2, MapPin } from "lucide-react";
import { useReservoir } from "@/context/ReservoirContext";
import { EmptyState } from "@/components/app/EmptyState";

interface EmptyReservoirStateProps {
  title?: string;
  description?: string;
}

export function EmptyReservoirState({
  title = "Nenhum hidrossistema selecionado",
  description = "Escolha um hidrossistema no seletor do topo da página para ver as informações.",
}: EmptyReservoirStateProps) {
  const { isLoading } = useReservoir();

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-1 items-center justify-center px-4 py-16 md:px-10">
      {isLoading ? (
        <div role="status" className="w-full max-w-md">
          <EmptyState
            icon={Loader2}
            title="Carregando hidrossistemas…"
            description="O primeiro carregamento pode levar até 1 minuto enquanto o servidor inicia."
            className="[&_svg]:animate-spin"
          />
        </div>
      ) : (
        <EmptyState icon={MapPin} title={title} description={description} className="w-full max-w-md" />
      )}
    </div>
  );
}
