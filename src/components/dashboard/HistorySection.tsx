"use client";

import { Download } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { dailyDiffs, historyToCsv } from "@/lib/monitoring";
import { formatNumber, formatSigned } from "@/lib/format";
import { SectionCard } from "@/components/app/SectionCard";
import { StateBadge } from "@/components/app/StateBadge";
import { EmptyState } from "@/components/app/EmptyState";

interface HistorySectionProps {
  history: HistoryEntry[];
  reservatorio: string;
  recentCount?: number;
}

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function HistorySection({ history, reservatorio, recentCount = 8 }: HistorySectionProps) {
  const diffs = dailyDiffs(history);
  const rows = history
    .map((entry, i) => ({ entry, diff: diffs[i] }))
    .slice(-recentCount)
    .reverse();

  const download = () => {
    const blob = new Blob([historyToCsv(history)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico-${slug(reservatorio)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SectionCard
      id="hist-titulo"
      title="Histórico recente"
      actions={
        history.length > 0 && (
          <button
            type="button"
            onClick={download}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-input bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <Download aria-hidden="true" className="size-4" />
            Baixar CSV
          </button>
        )
      }
    >
      {rows.length === 0 ? (
        <EmptyState title="Sem registros" description="Ainda não há leituras diárias para este reservatório." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <caption className="pb-2 text-left text-[13px] text-label">
              Últimos {rows.length} registros diários · o CSV traz o histórico completo
            </caption>
            <thead>
              <tr className="border-b border-input text-left text-[13px] text-label">
                <th scope="col" className="py-2.5 pr-4 font-semibold">Data</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">Estado</th>
                <th scope="col" className="py-2.5 pr-4 text-right font-semibold">Volume (hm³)</th>
                <th scope="col" className="py-2.5 text-right font-semibold">Variação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ entry, diff }) => (
                <tr key={entry.Data} className="border-b border-border last:border-0 hover:bg-background">
                  <td className="py-3 pr-4 tabular-nums">{entry.Data}</td>
                  <td className="py-3 pr-4">
                    <StateBadge state={entry["Estado de Seca"]} />
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatNumber(entry["Volume (hm3)"])}</td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground">
                    {diff === null ? "—" : formatSigned(diff)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
