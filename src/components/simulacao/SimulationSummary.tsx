"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { ResultadoCenario } from "@/lib/types";

interface SimulationSummaryProps {
  cenarios: ResultadoCenario[];
  capacidadeTotal: number;
  demandaBase: number;
  periodoInicio: string;
  periodoFim: string;
}

function gerarResumo(
  cenarios: ResultadoCenario[],
  capacidadeTotal: number,
  demandaBase: number,
): string {
  if (cenarios.length === 0) return "";

  const cenarioBase = cenarios.find(
    (c) => c.ganho_fna === null && c.ganho_volume === null,
  );

  if (!cenarioBase) {
    const melhor = cenarios.reduce((m, c) =>
      c.frequencia_nao_atendida < m.frequencia_nao_atendida ? c : m,
    );
    if (melhor.frequencia_nao_atendida === 0) {
      return `O cenário "${melhor.nome}" apresentou o melhor desempenho, eliminando completamente os déficits de abastecimento durante o período analisado.`;
    }
    return `O cenário "${melhor.nome}" apresentou o menor índice de falha (${melhor.frequencia_nao_atendida.toFixed(1)}%) entre os cenários avaliados.`;
  }

  // Encontrar melhor cenário (excluindo o base)
  const naoBase = cenarios.filter((c) => c.nome !== cenarioBase.nome);
  if (naoBase.length === 0) {
    return "Apenas o cenário base foi simulado. Adicione cenários de redução de demanda para ver a comparação.";
  }

  const melhor = naoBase.reduce((m, c) =>
    c.frequencia_nao_atendida < m.frequencia_nao_atendida ? c : m,
  );

  if (melhor.frequencia_nao_atendida === 0) {
    const reducaoFalhas = cenarioBase.meses_com_falha;
    return `A estratégia "${melhor.nome}" eliminou completamente os déficits de abastecimento durante o período analisado${cenarioBase.meses_com_falha > 0 ? `, reduzindo ${cenarioBase.meses_com_falha} meses de falha para zero` : ""}.`;
  }

  const partes: string[] = [];

  if (cenarioBase.frequencia_nao_atendida > 0 && melhor.ganho_fna !== null && melhor.ganho_fna > 0) {
    partes.push(
      `A frequência de não atendimento foi reduzida de ${cenarioBase.frequencia_nao_atendida.toFixed(1)}% para ${melhor.frequencia_nao_atendida.toFixed(1)}%`,
    );
  }

  if (melhor.volume_final > cenarioBase.volume_final) {
    partes.push(
      `o volume final aumentou de ${cenarioBase.volume_final.toFixed(2)} hm³ para ${melhor.volume_final.toFixed(2)} hm³`,
    );
  }

  if (cenarioBase.meses_com_falha > 0 && melhor.meses_com_falha < cenarioBase.meses_com_falha) {
    partes.push(
      `o número de meses com falha reduziu de ${cenarioBase.meses_com_falha} para ${melhor.meses_com_falha}`,
    );
  }

  if (partes.length === 0) {
    return `O cenário "${melhor.nome}" apresentou resultados similares ao cenário base.`;
  }

  return `A estratégia "${melhor.nome}" apresentou o melhor desempenho entre os cenários avaliados. ${partes[0]}${partes.length > 1 ? ", " + partes.slice(1).join(", ") : ""}.`;
}

export function SimulationSummary({
  cenarios,
  capacidadeTotal,
  demandaBase,
}: SimulationSummaryProps) {
  const [expanded, setExpanded] = useState(true);

  const resumo = gerarResumo(cenarios, capacidadeTotal, demandaBase);

  if (!resumo) return null;

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Resumo da Simulação
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            {resumo}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
