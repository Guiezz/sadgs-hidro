// src/components/dashboard/PaginatedTableCard.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

interface PaginatedTableCardProps<T> {
  icon: React.ReactNode;
  title: string;
  data: T[];
  headers: string[];
  renderRow: (item: T, index: number) => React.ReactNode;
  itemsPerPage?: number;
}

export function PaginatedTableCard<T>({
  icon,
  title,
  data,
  headers,
  renderRow,
  itemsPerPage = 6, // Padrão de 6 itens por página
}: PaginatedTableCardProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // CORREÇÃO: Garante que 'data' seja um array vazio se vier nulo ou undefined
  const safeData = data ?? [];

  const totalPages = Math.ceil(safeData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = safeData.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-card border border-border/40 rounded-xl flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="flex-grow flex flex-col justify-between p-4">
        <div className="border rounded-lg overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead
                    key={index}
                    className={`w-[${100 / headers.length}%]`}
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map(renderRow)
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="text-center">
                    Nenhum dado disponível.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm p-2">
                    Página {currentPage} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
