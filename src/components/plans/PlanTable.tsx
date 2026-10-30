import type { PlanoAcao } from "@/lib/types";
import { cellText } from "@/lib/text";
import { StateBadge } from "@/components/app/StateBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// "IMPACTOS ECONÔMICOS" → "Impactos econômicos"
function sentenceCase(text: string) {
  const t = text.replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR");
  return t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1);
}

const headClass = "text-xs font-semibold uppercase tracking-[0.05em] text-label";
const cellClass = "align-top whitespace-normal py-4";
// TableHead como cabeçalho de linha, sem o visual de th
const rowHeadClass = `${cellClass} h-auto font-normal text-foreground`;

export function PlanTable({ planos }: { planos: PlanoAcao[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="m-0 text-sm text-muted-foreground">
        Cada linha reúne as ações previstas para um tipo de impacto. Classes e responsáveis valem para o conjunto,
        não para cada ação.
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table aria-label="Planos de ação" className="min-w-[760px] table-fixed">
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-transparent">
              <TableHead className={`w-[18%] ${headClass}`}>Impacto</TableHead>
              <TableHead className={`w-[42%] ${headClass}`}>Descrição da ação</TableHead>
              <TableHead className={`w-[18%] ${headClass}`}>Classe da ação</TableHead>
              <TableHead className={`w-[22%] ${headClass}`}>Responsáveis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planos.map((p) => (
              <TableRow key={p.id} className="even:bg-muted/40">
                <TableHead scope="row" className={rowHeadClass}>
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-base font-bold leading-snug">
                      {p.tipos_impactos ? sentenceCase(p.tipos_impactos) : "Ação do plano"}
                    </span>
                    <StateBadge state={p.estado_seca} className="px-2.5 py-0.5 text-xs" />
                  </div>
                </TableHead>
                <TableCell className={`${cellClass} texto-corrido`}>{cellText(p.descricao_acao) || "—"}</TableCell>
                <TableCell className={cellClass}>{cellText(p.classes_acao) || "—"}</TableCell>
                <TableCell className={cellClass}>{cellText(p.responsaveis) || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
