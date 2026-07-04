// src/components/dashboard/ActionStatusTabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { ListChecks, CheckCircle, Search } from "lucide-react";
import type { PlanoAcao } from "@/lib/types";

interface Props {
  ongoing: PlanoAcao[];
  completed: PlanoAcao[];
}

function PaginatedTable({ data }: { data: PlanoAcao[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div>
      <div className="border rounded-lg overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Ação</TableHead>
              <TableHead className="w-[35%]">Responsáveis</TableHead>
              <TableHead className="w-[20%]">Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((action, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium whitespace-normal break-all align-top py-4">
                  {action.acoes}
                </TableCell>
                <TableCell className="whitespace-normal break-all align-top py-4">
                  {action.responsaveis}
                </TableCell>
                <TableCell className="whitespace-normal break-all align-top py-4">
                  <Badge
                    variant={
                      action.situacao === "Concluído" ? "secondary" : "outline"
                    }
                  >
                    {action.situacao}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
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
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
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
  );
}

export function ActionStatusTabs({ ongoing, completed }: Props) {
  return (
    <div className="bg-card border border-border/40 rounded-xl flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Situação das Ações</h3>
      </div>
      <div className="p-4">
        <Tabs defaultValue="ongoing">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ongoing">
              <ListChecks className="h-4 w-4 mr-2" />
              Em Andamento ({ongoing.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluídas ({completed.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing" className="mt-4">
            {ongoing.length > 0 ? (
              <PaginatedTable data={ongoing} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma ação em andamento no momento.
              </p>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            {completed.length > 0 ? (
              <PaginatedTable data={completed} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma ação foi concluída ainda.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
