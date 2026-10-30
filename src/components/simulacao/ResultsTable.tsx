"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "./helpers";
import { SimulacaoResultadoPonto } from "@/lib/types";

interface ResultsTableProps {
  data: SimulacaoResultadoPonto[];
}

export function ResultsTable({ data }: ResultsTableProps) {
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Dados Mensais</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-right text-water">
                  Vol. Inicial
                </TableHead>
                <TableHead className="text-right text-estado-normal-text">
                  Afluência
                </TableHead>
                <TableHead className="text-right">Evaporação</TableHead>
                <TableHead className="text-right text-estado-severa-text">
                  Retirada
                </TableHead>
                <TableHead className="text-right">Vertimento</TableHead>
                <TableHead className="text-right text-water font-bold">
                  Vol. Final
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {formatDate(item.data)}
                  </TableCell>
                  {/* Volume Inicial */}
                  <TableCell className="text-right text-water">
                    {item.volume_inicial_hm3.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.afluencia_hm3.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.evaporacao_hm3.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.retirada_hm3.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {item.vertimento_hm3 > 0
                      ? item.vertimento_hm3.toFixed(2)
                      : "-"}
                  </TableCell>
                  {/* Volume Final (Destaque) */}
                  <TableCell className="text-right font-bold text-water">
                    {item.volume_final_hm3.toFixed(2)}
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
