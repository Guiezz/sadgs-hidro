"use client";

import { useState } from "react";
import type { PlanoAcao } from "@/lib/types";
import { splitActions, splitList } from "@/lib/text";
import { StateBadge } from "@/components/app/StateBadge";

const VISIBLE_ITEMS = 5;
const VISIBLE_PILLS = 5;

// "IMPACTOS ECONÔMICOS" → "Impactos econômicos"
function sentenceCase(text: string) {
  const t = text.replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-BR");
  return t.charAt(0).toLocaleUpperCase("pt-BR") + t.slice(1);
}

const unique = (items: string[]) => [...new Set(items)];

export function PlanCard({ plano }: { plano: PlanoAcao }) {
  const [open, setOpen] = useState(false);
  const itens = splitActions(plano.acoes);
  const visiveis = open ? itens : itens.slice(0, VISIBLE_ITEMS);
  const ocultos = itens.length - VISIBLE_ITEMS;
  const classes = unique(splitActions(plano.classes_acao).map((c) => c.replace(/\s+/g, " ")));
  const responsaveis = unique(splitList(plano.responsaveis));
  const listId = `plano-${plano.id}-itens`;
  const titulo = plano.tipos_impactos ? sentenceCase(plano.tipos_impactos) : "Ação do plano";

  return (
    <article className="flex flex-wrap gap-x-8 gap-y-5 rounded-2xl border border-border bg-card px-6 py-[22px]">
      <div className="flex min-w-0 flex-[999_1_380px] flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="m-0 text-base font-bold leading-snug">{titulo}</h3>
          <StateBadge state={plano.estado_seca} className="px-2.5 py-0.5 text-xs" />
        </div>
        {itens.length > 0 ? (
          <ul id={listId} className="m-0 flex flex-col gap-1.5 pl-[18px] text-sm leading-normal">
            {visiveis.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">Sem itens cadastrados.</p>
        )}
        {ocultos > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
            className="-ml-3 h-9 self-start rounded-lg px-3 text-sm font-semibold text-link hover:bg-muted"
          >
            {open ? "Ver menos" : `Ver mais ${ocultos} ${ocultos === 1 ? "item" : "itens"}`}
          </button>
        )}
      </div>
      <dl className="m-0 flex flex-[1_1_280px] flex-col gap-3.5">
        {classes.length > 0 && (
          <div className="flex flex-col gap-2">
            <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-label">Classe da ação</dt>
            <dd className="m-0 flex flex-wrap gap-1.5">
              {classes.map((c) => (
                <span key={c} className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-link-hover">
                  {c}
                </span>
              ))}
            </dd>
          </div>
        )}
        {responsaveis.length > 0 && (
          <div className="flex flex-col gap-2">
            <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-label">Responsáveis</dt>
            <dd className="m-0 flex flex-wrap gap-1.5">
              {responsaveis.slice(0, VISIBLE_PILLS).map((r) => (
                <span key={r} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                  {r}
                </span>
              ))}
              {responsaveis.length > VISIBLE_PILLS && (
                <span
                  className="rounded-full border border-border px-2.5 py-1 text-xs font-medium"
                  title={responsaveis.slice(VISIBLE_PILLS).join(", ")}
                >
                  +{responsaveis.length - VISIBLE_PILLS}
                  <span className="sr-only"> outros: {responsaveis.slice(VISIBLE_PILLS).join(", ")}</span>
                </span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}
