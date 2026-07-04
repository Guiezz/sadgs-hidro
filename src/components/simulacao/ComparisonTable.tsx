"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResultadoCenario } from "@/lib/types";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ComparisonTableProps {
  cenarios: ResultadoCenario[];
}

export function ComparisonTable({ cenarios }: ComparisonTableProps) {
  if (cenarios.length === 0) return null;

  const maiorFNAGlobal = Math.max(
    ...cenarios.map((c) => c.frequencia_nao_atendida),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela Comparativa</CardTitle>
        <CardDescription>
          Métricas consolidadas de cada cenário de demanda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Cenário</TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Vol. Final (hm³)
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Menor Vol. (hm³)
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Primeira Falha
                </TableHead>
                <TableHead className="text-right min-w-[80px]">
                  Falhas
                </TableHead>
                <TableHead className="text-right min-w-[70px] text-red-600">
                  FNA (%)
                </TableHead>
                <TableHead className="text-right min-w-[90px]">
                  Ganho FNA
                </TableHead>
                <TableHead className="text-right min-w-[90px]">
                  Ganho Vol.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cenarios.map((c) => (
                <TableRow
                  key={c.nome}
                  className={`transition-colors hover:bg-muted/50 ${
                    c.frequencia_nao_atendida === maiorFNAGlobal &&
                    maiorFNAGlobal > 0
                      ? "bg-red-50 hover:bg-red-100/60"
                      : ""
                  }`}
                >
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell className="text-right font-bold text-blue-700">
                    {c.volume_final.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.menor_volume.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.primeira_falha ?? (
                      <span className="text-green-600">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.meses_com_falha}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span
                      className={
                        c.frequencia_nao_atendida === 0
                          ? "text-green-600"
                          : c.frequencia_nao_atendida <= 20
                            ? "text-amber-600"
                            : "text-red-600"
                      }
                    >
                      {c.frequencia_nao_atendida.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.ganho_fna !== null ? (
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold ${
                          c.ganho_fna > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {c.ganho_fna > 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : c.ganho_fna < 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {Math.abs(c.ganho_fna).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.ganho_volume !== null ? (
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold ${
                          c.ganho_volume > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {c.ganho_volume > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : c.ganho_volume < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {c.ganho_volume > 0 ? "+" : ""}
                        {c.ganho_volume.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
