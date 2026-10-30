import type { PlanoAcao } from "@/lib/types";
import { cellText } from "@/lib/text";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-col gap-2.5">
      <p className="m-0 text-sm text-muted-foreground">
        Cada medida reúne as ações previstas para um tipo de impacto; a situação vale para a medida inteira.
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table aria-label="Medidas recomendadas" className="min-w-[640px] table-fixed">
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-transparent">
              <TableHead className={`w-14 ${headClass}`}>Nº</TableHead>
              <TableHead className={headClass}>Ação</TableHead>
              <TableHead className={headClass}>Descrição</TableHead>
              <TableHead className={`w-36 ${headClass}`}>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planos.map((p, i) => {
              const tone = situacaoTone(p.situacao);
              return (
                <TableRow key={p.id} className="even:bg-muted/40">
                  <TableHead scope="row" className={cn(rowHeadClass, "font-bold")}>{i + 1}</TableHead>
                  <TableCell className={`${cellClass} texto-corrido`}>{cellText(p.acoes) || "—"}</TableCell>
                  <TableCell className={`${cellClass} texto-corrido`}>{cellText(p.descricao_acao) || "—"}</TableCell>
                  <TableCell className={cellClass}>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tone.cls)}>{tone.label}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
