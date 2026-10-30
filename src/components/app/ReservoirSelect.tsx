"use client";

import { useReservoir } from "@/context/ReservoirContext";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReservoirSelectProps {
  id: string;
  className?: string;
}

// Seletor de hidrossistema; o <label htmlFor={id}> fica com quem usa.
export function ReservoirSelect({ id, className }: ReservoirSelectProps) {
  const { reservatorios, selectedReservoir, setSelectedReservoir, isLoading } =
    useReservoir();

  return (
    <Select
      disabled={isLoading}
      value={selectedReservoir ? String(selectedReservoir.id) : ""}
      onValueChange={(value) =>
        setSelectedReservoir(reservatorios.find((r) => String(r.id) === value) ?? null)
      }
    >
      <SelectTrigger
        id={id}
        className={cn(
          "h-10 min-w-[220px] rounded-[10px] border-input bg-background text-sm font-medium",
          className,
        )}
      >
        <SelectValue placeholder={isLoading ? "Carregando…" : "Selecione o hidrossistema"} />
      </SelectTrigger>
      <SelectContent>
        {reservatorios.map((r) => (
          <SelectItem key={r.id} value={String(r.id)}>
            {r.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
