"use client";

import { useState, useEffect } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { config } from "@/config";

import { DashboardSummary, PlanoAcao } from "@/lib/types";
import { PaginatedTableMedidas } from "@/components/dashboard/PaginatedTableMedidas";
import { ActionStatusTabs } from "@/components/dashboard/ActionStatusTabs";
import { Loader2 } from "lucide-react";
import { EmptyReservoirState } from "@/components/dashboard/EmptyReservoirState";

const estadoColors: Record<string, { text: string; bg: string; dot: string }> = {
  Normal: { text: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
  Alerta: { text: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-500" },
  Seca: { text: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  "Seca Severa": { text: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" },
};

function EstadoBadge({ estado }: { estado: string }) {
  const colors =
    estadoColors[estado] ?? {
      text: "text-[var(--estado-alerta-text)]",
      bg: "bg-[var(--estado-alerta-bg)]",
      dot: "bg-[var(--estado-alerta-dot)]",
    };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
      {estado}
    </span>
  );
}

export default function ImplementacaoPlanosPage() {
  const { selectedReservoir } = useReservoir();

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [ongoingActions, setOngoingActions] = useState<PlanoAcao[]>([]);
  const [completedActions, setCompletedActions] = useState<PlanoAcao[]>([]);

  useEffect(() => {
    if (!selectedReservoir) {
      setIsLoadingPage(false);
      return;
    }

    const fetchData = async () => {
      setIsLoadingPage(true);
      setError(null);
      const id = selectedReservoir.id;

      try {
        const [summaryRes, ongoingRes, completedRes] = await Promise.all([
          fetch(
            `${config.apiBaseUrl}/reservatorios/${id}/dashboard/summary`,
            { cache: "no-store" },
          ),
          fetch(
            `${config.apiBaseUrl}/reservatorios/${id}/ongoing-actions`,
            { cache: "no-store" },
          ),
          fetch(
            `${config.apiBaseUrl}/reservatorios/${id}/completed-actions`,
            { cache: "no-store" },
          ),
        ]);

        if (!summaryRes.ok || !ongoingRes.ok || !completedRes.ok) {
          throw new Error("Falha ao buscar os dados do reservatório.");
        }

        setSummary(await summaryRes.json());
        setOngoingActions(await ongoingRes.json());
        setCompletedActions(await completedRes.json());
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Ocorreu um erro desconhecido.",
        );
      } finally {
        setIsLoadingPage(false);
      }
    };

    fetchData();
  }, [selectedReservoir]);

  if (!selectedReservoir) {
    return (
      <EmptyReservoirState
        title="Implementação de Planos Indisponível"
        description="Selecione um hidrossistema no topo da página para visualizar medidas recomendadas e status das ações."
      />
    );
  }

  if (isLoadingPage) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            Carregando dados da implementação...
          </p>
        </div>
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="text-center p-6 bg-card border rounded-xl shadow-sm">
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            Erro ao carregar os dados
          </h1>
          <p className="text-muted-foreground">
            {error ||
              "Verifique se a API está em execução e tente novamente."}
          </p>
        </div>
      </main>
    );
  }

  const medidasCount = summary.medidasRecomendadas?.length ?? 0;
  const ongoingCount = ongoingActions.length;
  const completedCount = completedActions.length;

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6 bg-background overflow-x-hidden">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Implementação nos planos de seca
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          {selectedReservoir.nome}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <EstadoBadge estado={summary.estadoAtualSeca} />
        <span className="text-sm text-muted-foreground">
          <strong className="text-foreground">{medidasCount}</strong>{" "}
          {medidasCount === 1 ? "medida ativa" : "medidas ativas"}
        </span>
        <span className="text-sm text-muted-foreground/40 hidden sm:inline">
          ·
        </span>
        <span className="text-sm text-muted-foreground">
          <strong className="text-foreground">{ongoingCount}</strong> em
          andamento
          {completedCount > 0 && (
            <>
              {" · "}
              <strong className="text-foreground">{completedCount}</strong>{" "}
              concluídas
            </>
          )}
        </span>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <PaginatedTableMedidas
          data={summary.medidasRecomendadas}
          estado={summary.estadoAtualSeca}
        />
        <ActionStatusTabs
          ongoing={ongoingActions}
          completed={completedActions}
        />
      </div>
    </main>
  );
}
