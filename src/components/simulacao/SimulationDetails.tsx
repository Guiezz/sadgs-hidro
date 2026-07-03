"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import { ResultadoCenario } from "@/lib/types";

interface SimulationDetailsProps {
  capacidadeTotal: number;
  demandaBase: number;
  periodoInicio: string;
  periodoFim: string;
  numCenarios: number;
  numMeses: number;
  volumeInicial: number;
}

export function SimulationDetails({
  capacidadeTotal,
  demandaBase,
  periodoInicio,
  periodoFim,
  numCenarios,
  numMeses,
  volumeInicial,
}: SimulationDetailsProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Detalhes da Simulação
          </CardTitle>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Capacidade Total</p>
              <p className="font-semibold">{capacidadeTotal.toFixed(2)} hm³</p>
            </div>
            <div>
              <p className="text-muted-foreground">Demanda Base</p>
              <p className="font-semibold">{demandaBase.toFixed(2)} hm³/mês</p>
            </div>
            <div>
              <p className="text-muted-foreground">Volume Inicial</p>
              <p className="font-semibold">{volumeInicial.toFixed(2)} hm³</p>
            </div>
            <div>
              <p className="text-muted-foreground">Período</p>
              <p className="font-semibold">
                {periodoInicio} a {periodoFim}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cenários</p>
              <p className="font-semibold">{numCenarios}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Meses Simulados</p>
              <p className="font-semibold">{numMeses}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
