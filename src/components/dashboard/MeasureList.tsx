"use client";

import { useState } from "react";
import type { PlanoAcao } from "@/lib/types";
import { splitActions } from "@/lib/text";
import { cn } from "@/lib/utils";

const VISIBLE = 5;

// Situação vem por medida (registro do plano), não por ação.
function situacaoTone(situacao: string) {
  const s = situacao.toLowerCase();
  if (s.startsWith("conclu")) return { label: "Concluída", cls: "bg-estado-normal-bg text-estado-normal-text", pct: 100 };
  if (s.includes("andamento")) return { label: "Em andamento", cls: "bg-water-soft text-water", pct: 50 };
  return { label: "Não iniciada", cls: "bg-muted text-muted-foreground", pct: 0 };
}

function Measure({ plano, index }: { plano: PlanoAcao; index: number }) {
  const [open, setOpen] = useState(false);
  const acoes = splitActions(plano.acoes);
  const visible = open ? acoes : acoes.slice(0, VISIBLE);
  const hidden = acoes.length - VISIBLE;
  const tone = situacaoTone(plano.situacao);
  const listId = `medida-${plano.id}-acoes`;

  return (
    <li className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card px-[22px] py-5">
      <div className="flex items-center justify-between gap-2.5">
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-accent font-bold text-link-hover"
          >
            {index + 1}
          </span>
          <h3 className="m-0 text-base font-bold">Medida {index + 1}</h3>
        </span>
        <span className="text-xs font-semibold text-label">
          {acoes.length} {acoes.length === 1 ? "ação" : "ações"}
        </span>
      </div>
      <ul id={listId} className="m-0 flex flex-col gap-2 pl-[18px] text-sm leading-normal">
        {visible.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="-ml-3 h-9 self-start rounded-lg px-3 text-sm font-semibold text-link hover:bg-muted"
        >
          {open ? "Ver menos" : `Ver mais ${hidden} ${hidden === 1 ? "ação" : "ações"}`}
        </button>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-muted pt-3 text-[13px] text-muted-foreground">
        <span>
          Situação: <span className={cn("rounded-full px-2 py-0.5 font-semibold", tone.cls)}>{tone.label}</span>
        </span>
        <span aria-hidden="true" className="block h-1.5 flex-[0_0_120px] overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-water" style={{ width: `${tone.pct}%` }} />
        </span>
      </div>
    </li>
  );
}

export function MeasureList({ planos }: { planos: PlanoAcao[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
      {planos.map((p, i) => (
        <Measure key={p.id} plano={p} index={i} />
      ))}
    </ol>
  );
}
