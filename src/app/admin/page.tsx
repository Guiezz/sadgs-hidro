"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useReservoir } from "@/context/ReservoirContext";
import { api } from "@/lib/api";
import { PlanoAcao } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Edit2,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ListChecks,
  CircleDashed,
  Filter,
  Database,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { selectedReservoir } = useReservoir();
  const router = useRouter();

  // Estados das listas de ações
  const [notStarted, setNotStarted] = useState<PlanoAcao[]>([]);
  const [ongoing, setOngoing] = useState<PlanoAcao[]>([]);
  const [completed, setCompleted] = useState<PlanoAcao[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Estados dos filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [opcoesEstados, setOpcoesEstados] = useState<string[]>([]);

  // Estados de edição
  const [editingAction, setEditingAction] = useState<PlanoAcao | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados do backfill (admin only)
  const [backfillDataInicio, setBackfillDataInicio] = useState("2020-01-01");
  const [isBackfilling, setIsBackfilling] = useState(false);

  // Proteção de rota
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Carrega as opções de filtro de estado de seca
  useEffect(() => {
    if (isAuthenticated && selectedReservoir) {
      api
        .getActionPlanFilters(selectedReservoir.id)
        .then((data) => setOpcoesEstados(data.estados))
        .catch((err) => console.error("Erro ao carregar filtros:", err));
    }
  }, [selectedReservoir, isAuthenticated]);

  // Função para buscar os dados filtrados
  const fetchData = useCallback(async () => {
    if (!selectedReservoir) return;

    setIsLoadingData(true);
    const estadoParam = filtroEstado === "todos" ? "" : filtroEstado;

    try {
      const [notStartedRes, ongoingRes, completedRes] = await Promise.all([
        api.getNotStartedActions(selectedReservoir.id, estadoParam),
        api.getOngoingActions(selectedReservoir.id, estadoParam),
        api.getCompletedActions(selectedReservoir.id, estadoParam),
      ]);
      setNotStarted(notStartedRes);
      setOngoing(ongoingRes);
      setCompleted(completedRes);
    } catch (error) {
      console.error("Erro ao buscar ações:", error);
      toast.error("Falha ao carregar as ações do reservatório.");
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedReservoir, filtroEstado]);

  useEffect(() => {
    if (isAuthenticated && selectedReservoir) {
      fetchData();
    }
  }, [selectedReservoir, isAuthenticated, filtroEstado, fetchData]);

  const handleEditClick = (action: PlanoAcao) => {
    setEditingAction(action);
    setNewStatus(action.situacao);
  };

  const handleSaveStatus = async () => {
    if (!editingAction || !newStatus || !selectedReservoir) return;
    setIsUpdating(true);
    try {
      await api.updateActionStatus(
        selectedReservoir.id,
        editingAction.id,
        newStatus,
      );
      toast.success("Status atualizado com sucesso!");
      setEditingAction(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBackfill = async () => {
    if (!selectedReservoir) return;
    setIsBackfilling(true);
    try {
      const resp = await api.runFuncemeBackfill(
        selectedReservoir.id,
        backfillDataInicio,
      );
      toast.success(`${resp.message} — ${resp.registros} registros inseridos.`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao executar backfill");
    } finally {
      setIsBackfilling(false);
    }
  };

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8 bg-background">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <ShieldAlert className="h-8 w-8" />
          Gestão de Implementação
        </h1>
        <p className="text-muted-foreground">
          Gestor logado:{" "}
          <span className="font-semibold text-foreground">{user?.nome}</span> |
          Reservatório:{" "}
          <span className="font-semibold text-foreground">
            {selectedReservoir?.nome || "Selecione um sistema"}
          </span>
        </p>
      </div>

      {!selectedReservoir ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold">
              Nenhum reservatório selecionado
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Escolha um reservatório no menu superior para gerenciar as ações.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardHeader className="border-b bg-muted/10 pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle>Painel de Controle de Ações</CardTitle>
                  <CardDescription>
                    Gerencie o ciclo de vida das medidas recomendadas.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-4 text-sm bg-background/50 p-3 rounded-lg border">
                  <div className="flex flex-col items-center px-2">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold">
                      Não iniciadas
                    </span>
                    <span className="font-bold text-orange-500">
                      {notStarted.length}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-border"></div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold">
                      Em andamento
                    </span>
                    <span className="font-bold text-primary">
                      {ongoing.length}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-border"></div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold">
                      Concluídas
                    </span>
                    <span className="font-bold text-green-600">
                      {completed.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <Tabs defaultValue="ongoing" className="w-full">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 py-4 bg-muted/5 gap-4 border-b">
                <TabsList className={`grid w-full max-w-[600px] ${user?.role === "admin_cogerh" ? "grid-cols-4" : "grid-cols-3"}`}>
                  <TabsTrigger value="not_started" className="gap-2">
                    <CircleDashed className="h-4 w-4" />
                    Não Iniciadas
                  </TabsTrigger>
                  <TabsTrigger value="ongoing" className="gap-2">
                    <ListChecks className="h-4 w-4" />
                    Em Andamento
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Concluídas
                  </TabsTrigger>
                  {user?.role === "admin_cogerh" && (
                    <TabsTrigger value="backfill" className="gap-2">
                      <Database className="h-4 w-4" />
                      Backfill
                    </TabsTrigger>
                  )}
                </TabsList>

                <div className="flex items-center gap-3 w-full lg:w-auto bg-background p-1.5 rounded-md border border-input shadow-sm">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                  <span className="text-xs font-bold uppercase text-muted-foreground hidden sm:inline">
                    Filtrar Seca:
                  </span>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-full sm:w-[200px] h-8 border-none focus:ring-0 shadow-none">
                      <SelectValue placeholder="Todos os Estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Estados</SelectItem>
                      {opcoesEstados.map((est) => (
                        <SelectItem key={est} value={est}>
                          {est}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <CardContent className="p-6">
                {isLoadingData ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                  </div>
                ) : (
                  <>
                    <TabsContent value="not_started" className="m-0">
                      <ActionTable
                        data={notStarted}
                        onEdit={handleEditClick}
                        emptyMessage="Nenhuma ação pendente de início para este filtro."
                      />
                    </TabsContent>
                    <TabsContent value="ongoing" className="m-0">
                      <ActionTable
                        data={ongoing}
                        onEdit={handleEditClick}
                        emptyMessage="Nenhuma ação em andamento para este filtro."
                      />
                    </TabsContent>
                    <TabsContent value="completed" className="m-0">
                      <ActionTable
                        data={completed}
                        onEdit={handleEditClick}
                        emptyMessage="Nenhuma ação concluída encontrada para este filtro."
                      />
                    </TabsContent>
                    {user?.role === "admin_cogerh" && (
                      <TabsContent value="backfill" className="m-0">
                        <div className="space-y-6">
                          <div className="p-6 rounded-lg border border-dashed border-amber-300 bg-amber-50/50">
                            <h3 className="text-sm font-semibold text-amber-800 mb-2">
                              Backfill de Dados Históricos FUNCEME
                            </h3>
                            <p className="text-sm text-amber-700/80 mb-4">
                              Busca dados históricos de volume desde a data
                              informada e insere no banco, evitando duplicatas.
                              Requer permissão de administrador.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase">
                                  Data Início
                                </label>
                                <input
                                  type="date"
                                  value={backfillDataInicio}
                                  onChange={(e) =>
                                    setBackfillDataInicio(e.target.value)
                                  }
                                  className="h-10 px-3 rounded-md border bg-background text-sm"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  onClick={handleBackfill}
                                  disabled={isBackfilling || !selectedReservoir}
                                  className="gap-2"
                                >
                                  {isBackfilling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Database className="h-4 w-4" />
                                  )}
                                  {isBackfilling
                                    ? "Executando..."
                                    : "Executar Backfill"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    )}
                  </>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      )}

      {/* PAINEL LATERAL DE EDIÇÃO */}
      <Sheet
        open={!!editingAction}
        onOpenChange={(open) => !open && setEditingAction(null)}
      >
        <SheetContent className="p-2 w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar Status da Ação</SheetTitle>
            <SheetDescription>
              A alteração de status será registada no histórico de auditoria
              associada ao seu utilizador.
            </SheetDescription>
          </SheetHeader>

          <div className="py-8 space-y-6">
            <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Ação em Edição
              </span>
              <p className="mt-1 text-sm font-medium leading-relaxed">
                {editingAction?.acoes}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold">Novo Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Não iniciado">Não iniciado</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={() => setEditingAction(null)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 h-11"
              onClick={handleSaveStatus}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Salvar Alteração
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Subcomponente da Tabela com Paginação e Quebra de Texto
function ActionTable({
  data,
  onEdit,
  emptyMessage,
}: {
  data: PlanoAcao[];
  onEdit: (a: PlanoAcao) => void;
  emptyMessage: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
        <p className="text-sm italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[45%] text-xs uppercase font-bold tracking-wider">
                Ação
              </TableHead>
              <TableHead className="w-[30%] text-xs uppercase font-bold tracking-wider">
                Responsáveis
              </TableHead>
              <TableHead className="w-[15%] text-xs uppercase font-bold tracking-wider">
                Status
              </TableHead>
              <TableHead className="w-[10%] text-right pr-6 text-xs uppercase font-bold tracking-wider">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/5 transition-colors group"
              >
                <TableCell className="font-medium align-top py-5 text-sm leading-relaxed whitespace-normal break-words">
                  {item.acoes}
                </TableCell>
                <TableCell className="align-top py-5 text-xs text-muted-foreground leading-relaxed whitespace-normal break-words">
                  {item.responsaveis}
                </TableCell>
                <TableCell className="align-top py-5">
                  <Badge
                    variant={
                      item.situacao === "Concluído"
                        ? "secondary"
                        : item.situacao === "Não iniciado"
                          ? "destructive"
                          : "outline"
                    }
                    className="font-normal text-[10px]"
                  >
                    {item.situacao}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-4 align-top py-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 text-primary hover:bg-primary/10 transition-transform active:scale-95"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent className="bg-background border rounded-lg p-1 shadow-sm">
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
              </PaginationItem>
              <PaginationItem>
                <div className="text-[11px] font-medium text-muted-foreground px-4">
                  {currentPage} / {totalPages}
                </div>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
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
