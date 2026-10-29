"use client";

import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/app/EmptyState";

interface EmptyReservoirStateProps {
  title?: string;
  description?: string;
}

export function EmptyReservoirState({
  title = "Nenhum hidrossistema selecionado",
  description = "Escolha um hidrossistema no seletor do topo da página para ver as informações.",
}: EmptyReservoirStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-1 items-center justify-center px-4 py-16 md:px-10">
      <EmptyState icon={MapPin} title={title} description={description} className="w-full max-w-md" />
    </div>
  );
}
