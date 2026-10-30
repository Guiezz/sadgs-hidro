import type { ComposicaoDemanda } from "@/lib/types";
import { groupTopN } from "@/lib/water";
import { formatNumber } from "@/lib/format";
import { SectionCard } from "@/components/app/SectionCard";

// Cores na ordem das fatias (maior → menor); "Outros" fica com a última.
const COLORS = ["var(--secondary)", "var(--link)", "var(--scarcity)", "var(--water)", "var(--water-light)", "var(--input)"];

export function ComposicaoDemandaChart({ data }: { data: ComposicaoDemanda[] }) {
  const grupos = groupTopN(data.map((d) => ({ label: d.Uso, value: d["Vazão (L/s)"] })));

  return (
    <SectionCard
      id="comp-titulo"
      title="Composição da demanda"
      description="Participação de cada uso na demanda cadastrada, em normalidade."
    >
      <div aria-hidden="true" className="flex h-7 gap-0.5 overflow-hidden rounded-lg">
        {grupos.map((g, i) => (
          <span key={g.label} style={{ width: `${g.pct}%`, background: COLORS[i] }} />
        ))}
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-8 gap-y-2.5 p-0">
        {grupos.map((g, i) => (
          <li key={g.label} className="flex items-start gap-2.5 border-b border-muted py-2">
            <span
              aria-hidden="true"
              className="mt-1 size-3 shrink-0 rounded-[3px]"
              style={{ background: COLORS[i] }}
            />
            <span className="flex-1 text-sm leading-snug">
              {g.label}
              {g.members && <span className="block text-xs text-muted-foreground">{g.members.join(", ")}</span>}
            </span>
            <strong className="tabular-nums">{formatNumber(g.pct, 1)}%</strong>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
