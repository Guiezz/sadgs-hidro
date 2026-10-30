import { TriangleAlert } from "lucide-react";
import type { UsoAgua } from "@/lib/types";
import { findPerdas, reductionPct, sumBy } from "@/lib/water";
import { formatNumber } from "@/lib/format";

const card = "flex flex-col gap-1.5 rounded-2xl border px-[22px] py-5";
const big = "font-display text-4xl font-bold leading-none tabular-nums";

export function UsosKpis({ usos }: { usos: UsoAgua[] }) {
  const normal = sumBy(usos, (u) => u.vazao_normal);
  const escassez = sumBy(usos, (u) => u.vazao_escassez);
  const reducao = reductionPct(normal, escassez);
  const perdas = findPerdas(usos);
  const perdasPct = perdas && escassez ? Math.round((perdas.vazao_escassez / escassez) * 100) : null;

  return (
    <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3.5">
      <div className={`${card} border-border bg-card`}>
        <dt className="flex items-center gap-2 text-[13px] font-semibold text-label">
          <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-water" />
          Demanda em normalidade
        </dt>
        <dd className="m-0 flex items-baseline gap-1.5">
          <span className={big}>{formatNumber(normal, 0)}</span>
          <span className="text-muted-foreground">L/s</span>
        </dd>
      </div>
      <div className={`${card} border-border bg-card`}>
        <dt className="flex items-center gap-2 text-[13px] font-semibold text-label">
          <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-scarcity" />
          Demanda em escassez
        </dt>
        <dd className="m-0 flex items-baseline gap-1.5">
          <span className={big}>{formatNumber(escassez, 0)}</span>
          <span className="text-muted-foreground">L/s</span>
        </dd>
        {reducao !== null && reducao > 0 && (
          <dd className="m-0 text-[13px] text-muted-foreground">{reducao}% menor que na normalidade</dd>
        )}
      </div>
      {perdas && (
        <div className={`${card} border-accent-border bg-accent`}>
          <dt className="flex items-center gap-2 text-[13px] font-semibold text-link-hover">
            <TriangleAlert aria-hidden="true" className="size-4" />
            Perdas e irregularidades
          </dt>
          <dd className="m-0 flex items-baseline gap-1.5">
            <span className={big}>{formatNumber(perdas.vazao_normal, 0)}</span>
            <span className="text-muted-foreground">L/s</span>
          </dd>
          {perdasPct !== null && perdas.vazao_escassez > 0 && (
            <dd className="m-0 text-[13px] text-muted-foreground">
              Mantidas na escassez: {perdasPct}% da demanda nesse cenário
            </dd>
          )}
        </div>
      )}
    </dl>
  );
}
