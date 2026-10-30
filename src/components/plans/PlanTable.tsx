import type { PlanoAcao } from "@/lib/types";
import { splitActions, splitList } from "@/lib/text";
import { ExpandableList } from "@/components/app/ExpandableList";
import { StateBadge } from "@/components/app/StateBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// "IMPACTOS ECONÔMICOS" → "Impactos econômicos"
function sentenceCase(text: string) {
  const t = text.replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR");
  return t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1);
}

const unique = (items: string[]) => [...new Set(items)];

const headClass = "text-xs font-semibold uppercase tracking-[0.05em] text-label";
const cellClass = "align-top whitespace-normal py-4";
// TableHead como cabeçalho de linha, sem o visual de th
const rowHeadClass = `${cellClass} h-auto font-normal text-foreground`;

export function PlanTable({ planos }: { planos: PlanoAcao[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table aria-label="Planos de ação" className="min-w-[760px] table-fixed">
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`w-[20%] ${headClass}`}>Impacto</TableHead>
            <TableHead className={`w-[45%] ${headClass}`}>Ações</TableHead>
            <TableHead className={`w-[15%] ${headClass}`}>Classe</TableHead>
            <TableHead className={`w-[20%] ${headClass}`}>Responsáveis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planos.map((p) => {
            const classes = unique(splitActions(p.classes_acao).map((c) => c.replace(/\s+/g, " "))).join(", ");
            const responsaveis = unique(splitList(p.responsaveis)).join(", ");
            return (
              <TableRow key={p.id} className="even:bg-muted/40">
                <TableHead scope="row" className={rowHeadClass}>
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-base font-bold leading-snug">
                      {p.tipos_impactos ? sentenceCase(p.tipos_impactos) : "Ação do plano"}
                    </span>
                    <StateBadge state={p.estado_seca} className="px-2.5 py-0.5 text-xs" />
                  </div>
                </TableHead>
                <TableCell className={cellClass}>
                  <ExpandableList
                    id={`plano-${p.id}-itens`}
                    items={splitActions(p.acoes)}
                    noun={["item", "itens"]}
                  />
                </TableCell>
                <TableCell className={cellClass}>{classes || "—"}</TableCell>
                <TableCell className={cellClass}>{responsaveis || "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
