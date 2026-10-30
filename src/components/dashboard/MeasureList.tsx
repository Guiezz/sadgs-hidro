import type { PlanoAcao } from "@/lib/types";
import { splitActions } from "@/lib/text";
import { cn } from "@/lib/utils";
import { ExpandableList } from "@/components/app/ExpandableList";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Situação vem por medida (registro do plano), não por ação.
function situacaoTone(situacao: string) {
  const s = situacao.toLowerCase();
  if (s.startsWith("conclu")) return { label: "Concluída", cls: "bg-estado-normal-bg text-estado-normal-text" };
  if (s.includes("andamento")) return { label: "Em andamento", cls: "bg-water-soft text-water" };
  return { label: "Não iniciada", cls: "bg-muted text-muted-foreground" };
}

const headClass = "text-xs font-semibold uppercase tracking-[0.05em] text-label";
const cellClass = "align-top whitespace-normal py-4";
// TableHead como cabeçalho de linha, sem o visual de th
const rowHeadClass = `${cellClass} h-auto text-foreground`;

export function MeasureList({ planos }: { planos: PlanoAcao[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table aria-label="Medidas recomendadas" className="min-w-[520px] table-fixed">
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`w-14 ${headClass}`}>Nº</TableHead>
            <TableHead className={headClass}>Ações</TableHead>
            <TableHead className={`w-40 ${headClass}`}>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planos.map((p, i) => {
            const tone = situacaoTone(p.situacao);
            return (
              <TableRow key={p.id} className="even:bg-muted/40">
                <TableHead scope="row" className={cn(rowHeadClass, "font-bold")}>{i + 1}</TableHead>
                <TableCell className={cellClass}>
                  <ExpandableList
                    id={`medida-${p.id}-acoes`}
                    items={splitActions(p.acoes)}
                    noun={["ação", "ações"]}
                  />
                </TableCell>
                <TableCell className={cellClass}>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tone.cls)}>{tone.label}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
