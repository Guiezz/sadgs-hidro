"use client";

import { useState, useEffect, useMemo } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";

import { PlanoAcao, ActionPlanFilterOptions } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

export default function ActionPlanClient() {
  const { selectedReservoir } = useReservoir();

  const [filterOptions, setFilterOptions] =
    useState<ActionPlanFilterOptions | null>(null);

  const [estado, setEstado] = useState<string>("");
  const [impacto, setImpacto] = useState<string>("");
  const [problema, setProblema] = useState<string>("");
  const [acao, setAcao] = useState<string>("");
  const [plans, setPlans] = useState<PlanoAcao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Se não houver reservatório, paramos o estado de carregamento dos filtros
    if (!selectedReservoir) {
      setIsFiltersLoading(false);
      return;
    }

    const fetchFilters = async () => {
      setIsFiltersLoading(true);
      handleResetFilters();
      setPlans([]);

      try {
        const res = await fetch(
          `${config.apiBaseUrl}/reservatorios/${selectedReservoir.id}/action-plans/filters`,
        );
        if (!res.ok) throw new Error("Falha ao buscar opções de filtro");
        const data: ActionPlanFilterOptions = await res.json();
        setFilterOptions(data);
      } catch (error) {
        console.error("Erro ao buscar filtros:", error);
        setFilterOptions(null);
      } finally {
        setIsFiltersLoading(false);
      }
    };

    fetchFilters();
  }, [selectedReservoir]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (estado) params.append("estado", estado);
    if (impacto) params.append("impacto", impacto);
    if (problema) params.append("problema", problema);
    if (acao) params.append("acao", acao);
    return params.toString();
  }, [estado, impacto, problema, acao]);

  useEffect(() => {
    if (!selectedReservoir) return;
    setCurrentPage(1);

    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${config.apiBaseUrl}/reservatorios/${selectedReservoir.id}/action-plans?${queryParams}`,
        );
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);

        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error("Erro ao buscar planos de ação:", error);
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [queryParams, selectedReservoir]);

  const handleResetFilters = () => {
    setEstado("");
    setImpacto("");
    setProblema("");
    setAcao("");
  };

  const totalPages = Math.max(1, Math.ceil(plans.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlans = plans.slice(startIndex, endIndex);

  // 1. ESTADO: NADA SELECIONADO
  if (!selectedReservoir) {
    return (
      <EmptyReservoirState
        title="Planos de Ação Indisponíveis"
        description="Por favor, selecione um hidrossistema no seletor acima para consultar os planos de ação e medidas preventivas."
      />
    );
  }

  // 2. ESTADO: CARREGANDO ESTRUTURA INICIAL (Filtros)
  if (isFiltersLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando filtros...</p>
        </div>
      </div>
    );
  }

  // 3. ESTADO: SUCESSO
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">Filtrar Planos de Ação</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Estado de Seca" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions?.estados &&
                  filterOptions.estados
                    .filter((opt) => opt && opt.trim() !== "")
                    .map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            <Select value={impacto} onValueChange={setImpacto}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Tipo de Impacto" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions?.impactos &&
                  filterOptions.impactos
                    .filter((opt) => opt && opt.trim() !== "")
                    .map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            <Select value={problema} onValueChange={setProblema}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Problema" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions?.problemas &&
                  filterOptions.problemas
                    .filter((opt) => opt && opt.trim() !== "")
                    .map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            <Select value={acao} onValueChange={setAcao}>
              <SelectTrigger className="w-full truncate">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions?.acoes &&
                  filterOptions.acoes
                    .filter((opt) => opt && opt.trim() !== "")
                    .map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            <button
              onClick={handleResetFilters}
              className="lg:col-start-5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-md text-sm py-2 px-4 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">Resultados</h3>
        </div>
        <div className="p-4">
          <div className="border rounded-lg overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Descrição da Ação</TableHead>
                  <TableHead className="w-[25%]">Classe da Ação</TableHead>
                  <TableHead className="w-[25%]">Responsáveis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando resultados...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : plans.length > 0 ? (
                  paginatedPlans.map((plan, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-normal break-words align-top py-4">
                        {plan.descricao_acao}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words align-top py-4">
                        {plan.classes_acao}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words align-top py-4">
                        {plan.responsaveis}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Nenhum resultado encontrado para os filtros selecionados.
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
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .map((p, idx, arr) => (
                      <PaginationItem key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={p === currentPage ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(p)}
                          className="min-w-9"
                        >
                          {p}
                        </Button>
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
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
      </div>
    </div>
  );
}
